import { SesDao } from '../aws-daos';
import {
  generateVerificationEmailHtml,
  generatePasswordResetEmailHtml,
  generateWelcomeEmailHtml
} from '../templates/emails';

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@jcampos.dev';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://jmarkets.jcampos.dev';

export type EmailLanguage = 'en' | 'es';

export interface EmailTemplate {
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
}

export interface IEmailService {
  sendEmail(template: EmailTemplate): Promise<boolean>;
  sendVerificationEmail(email: string, verificationCode: string, language?: EmailLanguage): Promise<boolean>;
  sendPasswordResetEmail(email: string, resetCode: string, language?: EmailLanguage): Promise<boolean>;
  sendWelcomeEmail(email: string, userName: string, language?: EmailLanguage): Promise<boolean>;
}

export class EmailService implements IEmailService {
  private dao: SesDao;

  constructor() {
    this.dao = new SesDao();
  }

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      await this.dao.sendEmail({
        from: FROM_EMAIL,
        to: template.to,
        subject: template.subject,
        htmlBody: template.htmlBody,
        textBody: template.textBody,
      });

      console.log('Email sent successfully to:', template.to);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, verificationCode: string, language: EmailLanguage = 'es'): Promise<boolean> {
    const subjects = {
      en: 'Your verification code - JMarkets',
      es: 'Tu código de verificación - JMarkets',
    };

    const textBodies = {
      en: `
Welcome to JMarkets!

Thank you for registering. To complete your registration, enter the following verification code:

${verificationCode}

This code expires in 24 hours.

If you did not request this code, you can ignore this message.

--
JMarkets
Your online success
      `,
      es: `
¡Bienvenida a JMarkets!

Gracias por registrarte. Para completar tu registro, ingresa el siguiente código de verificación:

${verificationCode}

Este código expira en 24 horas.

Si no solicitaste este código, puedes ignorar este mensaje.

--
JMarkets
Tu éxito en línea
      `,
    };

    const template: EmailTemplate = {
      to: email,
      subject: subjects[language],
      htmlBody: generateVerificationEmailHtml(verificationCode, language),
      textBody: textBodies[language],
    };

    return this.sendEmail(template);
  }

  async sendPasswordResetEmail(email: string, resetCode: string, language: EmailLanguage = 'es'): Promise<boolean> {
    const subjects = {
      en: 'Reset password - JMarkets',
      es: 'Restablecer contraseña - JMarkets',
    };

    const textBodies = {
      en: `
Reset Password - JMarkets

We received a request to reset your password. Use the following code to continue:

${resetCode}

This code expires in 1 hour.

⚠️ Important: If you did not request a password reset, ignore this message. Your account is secure.

--
JMarkets
Your online success
      `,
      es: `
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

    const template: EmailTemplate = {
      to: email,
      subject: subjects[language],
      htmlBody: generatePasswordResetEmailHtml(resetCode, language),
      textBody: textBodies[language],
    };

    return this.sendEmail(template);
  }

  async sendWelcomeEmail(email: string, userName: string, language: EmailLanguage = 'es'): Promise<boolean> {
    const subjects = {
      en: 'Welcome to JMarkets!',
      es: '¡Bienvenida a JMarkets!',
    };

    const textBodies = {
      en: `
Welcome ${userName}!

Your JMarkets account has been successfully verified.

You can now start selling in your online store.

What can you do now?
- Set up your store
- Add your products
- Customize your design
- Start selling

Visit us at: ${FRONTEND_URL}

Have questions? Contact us on our social networks.

--
JMarkets
Your online success
      `,
      es: `
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

    const template: EmailTemplate = {
      to: email,
      subject: subjects[language],
      htmlBody: generateWelcomeEmailHtml(userName, FRONTEND_URL, language),
      textBody: textBodies[language],
    };

    return this.sendEmail(template);
  }
}

export const emailService = new EmailService();
