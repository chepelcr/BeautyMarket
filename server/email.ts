import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Configure AWS SES
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourdomain.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5000';

export interface EmailTemplate {
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
}

export class EmailService {
  async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      const command = new SendEmailCommand({
        Source: FROM_EMAIL,
        Destination: {
          ToAddresses: [template.to],
        },
        Message: {
          Subject: {
            Data: template.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: template.htmlBody,
              Charset: 'UTF-8',
            },
            Text: {
              Data: template.textBody,
              Charset: 'UTF-8',
            },
          },
        },
      });

      await sesClient.send(command);
      console.log('Email sent successfully to:', template.to);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  generatePasswordResetEmail(email: string, token: string, userName: string): EmailTemplate {
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
    
    return {
      to: email,
      subject: 'Restablecer tu contraseña - Strawberry Essentials',
      htmlBody: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #ec4899, #f43f5e); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
              .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🍓 Strawberry Essentials</h1>
                <p>Restablecer Contraseña</p>
              </div>
              <div class="content">
                <h2>Hola ${userName},</h2>
                <p>Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva contraseña:</p>
                <p style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
                </p>
                <p><strong>Este enlace expira en 1 hora.</strong></p>
                <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
                <p>Si tienes problemas con el botón, copia y pega este enlace en tu navegador:</p>
                <p style="word-break: break-all; color: #666;">${resetUrl}</p>
              </div>
              <div class="footer">
                <p>Este correo fue enviado por Strawberry Essentials</p>
                <p>Si tienes preguntas, contáctanos en tu plataforma preferida</p>
              </div>
            </div>
          </body>
        </html>
      `,
      textBody: `
Hola ${userName},

Has solicitado restablecer tu contraseña en Strawberry Essentials.

Para crear una nueva contraseña, visita este enlace:
${resetUrl}

Este enlace expira en 1 hora.

Si no solicitaste este cambio, puedes ignorar este correo de forma segura.

--
Strawberry Essentials
Tu belleza, nuestra pasión
      `,
    };
  }

  generateEmailVerificationEmail(email: string, token: string, userName: string): EmailTemplate {
    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
    
    return {
      to: email,
      subject: 'Verifica tu correo electrónico - Strawberry Essentials',
      htmlBody: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #ec4899, #f43f5e); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
              .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🍓 Strawberry Essentials</h1>
                <p>Verificación de Correo</p>
              </div>
              <div class="content">
                <h2>¡Bienvenida ${userName}!</h2>
                <p>Gracias por registrarte en Strawberry Essentials. Para completar tu registro, verifica tu correo electrónico:</p>
                <p style="text-align: center; margin: 30px 0;">
                  <a href="${verifyUrl}" class="button">Verificar Correo</a>
                </p>
                <p><strong>Este enlace expira en 24 horas.</strong></p>
                <p>Si tienes problemas con el botón, copia y pega este enlace en tu navegador:</p>
                <p style="word-break: break-all; color: #666;">${verifyUrl}</p>
              </div>
              <div class="footer">
                <p>Este correo fue enviado por Strawberry Essentials</p>
                <p>Si no te registraste en nuestro sitio, puedes ignorar este correo</p>
              </div>
            </div>
          </body>
        </html>
      `,
      textBody: `
¡Bienvenida ${userName}!

Gracias por registrarte en Strawberry Essentials.

Para completar tu registro, verifica tu correo electrónico visitando:
${verifyUrl}

Este enlace expira en 24 horas.

Si no te registraste en nuestro sitio, puedes ignorar este correo.

--
Strawberry Essentials
Tu belleza, nuestra pasión
      `,
    };
  }
}

export const emailService = new EmailService();