// eslint-disable-next-line @typescript-eslint/no-var-requires
const serverless = require('serverless-http');
const { ExpressAppConfig } = require('./src/config/ExpressAppConfig');
const {
  generateVerificationEmailHtml,
  generatePasswordResetEmailHtml,
  generateAdminCreateUserEmailHtml
} = require('./src/templates/emails');

// Create Express app using configuration class
const appConfig = new ExpressAppConfig();
const app = appConfig.getApp();

// Serverless Express handler
const expressHandler = serverless(app);

// Main handler for API Gateway, SQS, and SNS
exports.handler = async (event: any, context: any, callback: any) => {
  // Handle SQS events
  if (event.Records && event.Records[0].eventSource === 'aws:sqs') {
    console.log('Processing SQS event:', JSON.stringify(event, null, 2));
    for (const record of event.Records) {
      console.log('SQS message:', record.body);
      // Add SQS processing logic here
    }
    return;
  }

  // Handle SNS events
  if (event.Records && event.Records[0].EventSource === 'aws:sns') {
    console.log('Processing SNS event:', JSON.stringify(event, null, 2));
    for (const record of event.Records) {
      console.log('SNS message:', record.Sns.Message);
      // Add SNS processing logic here
    }
    return;
  }

  // Handle API Gateway events
  return expressHandler(event, context, callback);
};

// Cognito Custom Message trigger handler
exports.cognitoHandler = async (event: any, context: any) => {
  console.log('Cognito trigger event:', JSON.stringify(event, null, 2));

  const { triggerSource, request, response } = event;
  const { userAttributes, codeParameter } = request;
  const email = userAttributes.email;

  // Custom email templates based on trigger source
  if (triggerSource === 'CustomMessage_SignUp' || triggerSource === 'CustomMessage_ResendCode') {
    // Email verification
    response.emailSubject = 'Tu código de verificación - JMarkets';
    response.emailMessage = generateVerificationEmailHtml(codeParameter);
  } else if (triggerSource === 'CustomMessage_ForgotPassword') {
    // Password reset
    response.emailSubject = 'Restablecer contraseña - JMarkets';
    response.emailMessage = generatePasswordResetEmailHtml(codeParameter);
  } else if (triggerSource === 'CustomMessage_AdminCreateUser') {
    // Admin created user (temporary password)
    response.emailSubject = 'Tu cuenta ha sido creada - JMarkets';
    response.emailMessage = generateAdminCreateUserEmailHtml(codeParameter, email);
  }

  return event;
};
