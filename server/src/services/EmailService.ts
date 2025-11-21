import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import {
  generateVerificationEmailHtml,
  generatePasswordResetEmailHtml,
  generateWelcomeEmailHtml
} from '../templates/emails';

// Configure AWS SES
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@jcampos.dev';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://jmarkets.jcampos.dev';

export interface EmailTemplate {
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
}

export interface IEmailService {
  sendEmail(template: EmailTemplate): Promise<boolean>;
  sendVerificationEmail(email: string, verificationCode: string): Promise<boolean>;
  sendPasswordResetEmail(email: string, resetCode: string): Promise<boolean>;
  sendWelcomeEmail(email: string, userName: string): Promise<boolean>;
}

export class EmailService implements IEmailService {
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

  async sendVerificationEmail(email: string, verificationCode: string): Promise<boolean> {
    const template: EmailTemplate = {
      to: email,
      subject: 'Tu código de verificación - JMarkets',
      htmlBody: generateVerificationEmailHtml(verificationCode),
      textBody: `
¡Bienvenida a JMarkets!

Gracias por registrarte. Para completar tu registro, ingresa el siguiente código de verificación:

${verificationCode}

Este código expira en 15 minutos.

Si no solicitaste este código, puedes ignorar este mensaje.

--
JMarkets
Tu éxito en línea
      `,
    };

    return this.sendEmail(template);
  }

  async sendPasswordResetEmail(email: string, resetCode: string): Promise<boolean> {
    const template: EmailTemplate = {
      to: email,
      subject: 'Restablecer contraseña - JMarkets',
      htmlBody: generatePasswordResetEmailHtml(resetCode),
      textBody: `
Restablecer Contraseña - JMarkets

Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código para continuar:

${resetCode}

Este código expira en 1 hora.

⚠️ Importante: Si no solicitaste restablecer tu contraseña, ignora este mensaje. Tu cuenta está segura.

--
JMarkets
Tu éxito en línea
      `,
    };

    return this.sendEmail(template);
  }

  async sendWelcomeEmail(email: string, userName: string): Promise<boolean> {
    const template: EmailTemplate = {
      to: email,
      subject: '¡Bienvenida a JMarkets!',
      htmlBody: generateWelcomeEmailHtml(userName, FRONTEND_URL),
      textBody: `
¡Bienvenida ${userName}!

Tu cuenta en JMarkets ha sido verificada exitosamente.

Ya puedes comenzar a vender en tu tienda online.

¿Qué puedes hacer ahora?
- Configura tu tienda
- Agrega tus productos
- Personaliza tu diseño
- Comienza a vender

Visítanos en: ${FRONTEND_URL}

¿Tienes preguntas? Contáctanos en nuestras redes sociales.

--
JMarkets
Tu éxito en línea
      `,
    };

    return this.sendEmail(template);
  }
}

export const emailService = new EmailService();
