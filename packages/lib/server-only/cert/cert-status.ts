import { X509Certificate } from 'node:crypto';

import { createLocalSigner } from '@documenso/signing/transports/local';

import { NEXT_PRIVATE_SIGNING_TRANSPORT } from '../../constants/app';

/**
 * Whether the local P12 opens with the configured passphrase and is in date.
 * Skips AIA so this stays offline. gcloud-hsm and csc always report available.
 */
export const getCertificateStatus = async () => {
  const transport = NEXT_PRIVATE_SIGNING_TRANSPORT();

  // Cannot inspect a remote HSM or CSC provider from this process.
  if (transport === 'gcloud-hsm' || transport === 'csc') {
    return { isAvailable: true };
  }

  // Anything else (typo, leftover `http`) would throw at seal time.
  if (transport !== 'local') {
    return { isAvailable: false };
  }

  try {
    const signer = await createLocalSigner({ buildChain: false });

    const certificate = new X509Certificate(Buffer.from(signer.certificate));

    const now = new Date();

    const isWithinValidityPeriod = new Date(certificate.validFrom) <= now && now <= new Date(certificate.validTo);

    return { isAvailable: isWithinValidityPeriod };
  } catch (error) {
    // Preview diagnosis only. Never log certificate contents or its password.
    if (process.env.VERCEL_ENV === 'preview') {
      const encodedP12 = process.env.NEXT_PRIVATE_SIGNING_LOCAL_FILE_CONTENTS ?? '';

      console.error('[SIGNING_CERT_STATUS] Certificate initialization failed', {
        message: error instanceof Error ? error.message : 'Unknown error',
        hasP12: encodedP12.length > 0,
        p12Base64Length: encodedP12.length,
        hasPassphrase: Boolean(process.env.NEXT_PRIVATE_SIGNING_PASSPHRASE),
      });
    }

    return { isAvailable: false };
  }
};
