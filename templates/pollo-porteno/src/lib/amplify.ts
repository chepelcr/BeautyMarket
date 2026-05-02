import { Amplify } from 'aws-amplify';

/**
 * AWS Amplify configuration for Pollo Porteño storefront.
 *
 * The storefront does not require user sign-in. We rely on a Cognito
 * Identity Pool that allows unauthenticated (guest / "anonymous") access
 * so every visitor still gets short-lived AWS credentials and an
 * unauthenticated identity ID. The backend uses the Identity Pool to
 * authorize read-only public data for the configured organization.
 *
 * Required environment variables:
 *  - VITE_AWS_REGION
 *  - VITE_AWS_COGNITO_USER_POOL_ID            (still configured for shared infra)
 *  - VITE_AWS_COGNITO_CLIENT_ID
 *  - VITE_AWS_COGNITO_IDENTITY_POOL_ID        (must allow unauthenticated identities)
 */
const amplifyConfig = {
  Auth: {
    Cognito: {
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      userPoolId: import.meta.env.VITE_AWS_COGNITO_USER_POOL_ID || '',
      userPoolClientId: import.meta.env.VITE_AWS_COGNITO_CLIENT_ID || '',
      identityPoolId: import.meta.env.VITE_AWS_COGNITO_IDENTITY_POOL_ID || '',
      allowGuestAccess: true,
      signUpVerificationMethod: 'code' as const,
      loginWith: {
        email: true,
        username: false,
      },
    },
  },
};

Amplify.configure(amplifyConfig);

export default amplifyConfig;
