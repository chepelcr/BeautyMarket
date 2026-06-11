import { Amplify } from 'aws-amplify';

// Cognito config comes from build-time env. On a pure static deploy (e.g. GitHub
// Pages) where the landing site only needs the public templates API and has no
// auth flows, these may be unset — in that case we skip Amplify.configure rather
// than configure it with an empty userPoolId (which throws at runtime).
const userPoolId = import.meta.env.VITE_AWS_COGNITO_USER_POOL_ID || '';
const userPoolClientId = import.meta.env.VITE_AWS_COGNITO_CLIENT_ID || '';

const amplifyConfig = {
  Auth: {
    Cognito: {
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      userPoolId,
      userPoolClientId,
      signUpVerificationMethod: 'code' as const,
      loginWith: {
        email: true,
        username: false,
      },
    },
  },
};

if (userPoolId && userPoolClientId) {
  Amplify.configure(amplifyConfig);
}

export default amplifyConfig;
