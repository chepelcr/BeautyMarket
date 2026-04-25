// JMarkets Email Templates

type Language = 'en' | 'es';

interface EmailTranslations {
  verification: {
    title: string;
    greeting: string;
    message: string;
    expiryNote: string;
    ignoreNote: string;
  };
  passwordReset: {
    title: string;
    message: string;
    warning: string;
    expiryNote: string;
  };
  welcome: {
    greeting: string;
    message: string;
    whatYouCanDo: string;
    feature1: string;
    feature2: string;
    feature3: string;
    feature4: string;
    buttonText: string;
    supportMessage: string;
  };
  footer: string;
}

const translations: Record<Language, EmailTranslations> = {
  en: {
    verification: {
      title: 'Welcome!',
      greeting: 'Welcome!',
      message: 'Thank you for registering with JMarkets. To complete your registration, please enter the following verification code:',
      expiryNote: 'This code expires in 24 hours.',
      ignoreNote: 'If you did not request this code, you can ignore this message.',
    },
    passwordReset: {
      title: 'Reset Password',
      message: 'We received a request to reset your password. Use the following code to continue:',
      warning: '<strong>⚠️ Important:</strong> If you did not request a password reset, please ignore this message. Your account is secure.',
      expiryNote: 'This code expires in 1 hour.',
    },
    welcome: {
      greeting: 'Hello',
      message: 'Your account has been successfully verified. You can now start selling in your online store.',
      whatYouCanDo: 'What can you do now?',
      feature1: 'Set up your store',
      feature2: 'Add your products',
      feature3: 'Customize your design',
      feature4: 'Start selling',
      buttonText: 'Go to My Store',
      supportMessage: 'Have questions? Contact us on our social networks.',
    },
    footer: '© 2024 JMarkets. All rights reserved.',
  },
  es: {
    verification: {
      title: '¡Te damos la bienvenida!',
      greeting: '¡Te damos la bienvenida!',
      message: 'Gracias por registrarte en JMarkets. Para completar tu registro, ingresa el siguiente código de verificación:',
      expiryNote: 'Este código expira en 24 horas.',
      ignoreNote: 'Si no solicitaste este código, puedes ignorar este mensaje.',
    },
    passwordReset: {
      title: 'Restablecer Contraseña',
      message: 'Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código para continuar:',
      warning: '<strong>⚠️ Importante:</strong> Si no solicitaste restablecer tu contraseña, ignora este mensaje. Tu cuenta está segura.',
      expiryNote: 'Este código expira en 1 hora.',
    },
    welcome: {
      greeting: '¡Hola',
      message: 'Tu cuenta ha sido verificada exitosamente. Ya puedes comenzar a vender en tu tienda online.',
      whatYouCanDo: '¿Qué puedes hacer ahora?',
      feature1: 'Configura tu tienda',
      feature2: 'Agrega tus productos',
      feature3: 'Personaliza tu diseño',
      feature4: 'Comienza a vender',
      buttonText: 'Ir a Mi Tienda',
      supportMessage: '¿Tienes preguntas? Contáctanos en nuestras redes sociales.',
    },
    footer: '© 2024 JMarkets. Todos los derechos reservados.',
  },
};

export function generateVerificationEmailHtml(code: string, language: Language = 'es'): string {
  const t = translations[language].verification;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #E8F5E9;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #E8F5E9; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; color: #2E7D32; font-weight: bold;">🌿 JMarkets</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 20px 40px; text-align: center;">
                  <h2 style="margin: 0; font-size: 24px; color: #1a1a1a;">${t.greeting}</h2>
                  <p style="margin: 16px 0 0 0; font-size: 16px; color: #666666; line-height: 1.5;">
                    ${t.message}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 30px 40px; text-align: center;">
                  <div style="background-color: #E8F5E9; border-radius: 12px; padding: 24px; display: inline-block;">
                    <span style="font-size: 36px; font-weight: bold; color: #2E7D32; letter-spacing: 8px;">${code}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 40px 40px; text-align: center;">
                  <p style="margin: 0; font-size: 14px; color: #999999;">
                    ${t.expiryNote}<br>
                    ${t.ignoreNote}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 40px; background-color: #f8f8f8; border-radius: 0 0 16px 16px; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #999999;">
                    ${translations[language].footer}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function generatePasswordResetEmailHtml(code: string, language: Language = 'es'): string {
  const t = translations[language].passwordReset;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #E8F5E9;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #E8F5E9; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; color: #2E7D32; font-weight: bold;">🌿 JMarkets</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 20px 40px; text-align: center;">
                  <h2 style="margin: 0; font-size: 24px; color: #1a1a1a;">${t.title}</h2>
                  <p style="margin: 16px 0 0 0; font-size: 16px; color: #666666; line-height: 1.5;">
                    ${t.message}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 30px 40px; text-align: center;">
                  <div style="background-color: #E8F5E9; border-radius: 12px; padding: 24px; display: inline-block;">
                    <span style="font-size: 36px; font-weight: bold; color: #2E7D32; letter-spacing: 8px;">${code}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 20px 40px; text-align: center;">
                  <div style="background-color: #fff3cd; border-radius: 8px; padding: 16px;">
                    <p style="margin: 0; font-size: 14px; color: #856404;">
                      ${t.warning}
                    </p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 40px 40px; text-align: center;">
                  <p style="margin: 0; font-size: 14px; color: #999999;">
                    ${t.expiryNote}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 40px; background-color: #f8f8f8; border-radius: 0 0 16px 16px; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #999999;">
                    ${translations[language].footer}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function generateAdminCreateUserEmailHtml(tempPassword: string, email: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #E8F5E9;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #E8F5E9; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; color: #2E7D32; font-weight: bold;">🌿 JMarkets</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 20px 40px; text-align: center;">
                  <h2 style="margin: 0; font-size: 24px; color: #1a1a1a;">Tu cuenta ha sido creada</h2>
                  <p style="margin: 16px 0 0 0; font-size: 16px; color: #666666; line-height: 1.5;">
                    Se ha creado una cuenta para ti en JMarkets. Usa las siguientes credenciales para iniciar sesión:
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 30px 40px; text-align: center;">
                  <div style="background-color: #E8F5E9; border-radius: 12px; padding: 24px;">
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #666666;">
                      <strong>Email:</strong> ${email}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #666666;">
                      <strong>Contraseña temporal:</strong>
                    </p>
                    <span style="font-size: 20px; font-weight: bold; color: #2E7D32;">${tempPassword}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 40px 40px; text-align: center;">
                  <p style="margin: 0; font-size: 14px; color: #999999;">
                    Deberás cambiar tu contraseña en el primer inicio de sesión.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 40px; background-color: #f8f8f8; border-radius: 0 0 16px 16px; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #999999;">
                    © 2024 JMarkets. Todos los derechos reservados.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function generateWelcomeEmailHtml(userName: string, frontendUrl: string, language: Language = 'es'): string {
  const t = translations[language].welcome;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #E8F5E9;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #E8F5E9; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; color: #2E7D32; font-weight: bold;">🌿 JMarkets</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 20px 40px; text-align: center;">
                  <h2 style="margin: 0; font-size: 24px; color: #1a1a1a;">${t.greeting}, ${userName}!</h2>
                  <p style="margin: 16px 0 0 0; font-size: 16px; color: #666666; line-height: 1.5;">
                    ${t.message}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 30px 40px;">
                  <div style="background-color: #E8F5E9; border-radius: 12px; padding: 24px;">
                    <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #2E7D32;">${t.whatYouCanDo}</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #666666;">
                      <li style="margin-bottom: 8px;">${t.feature1}</li>
                      <li style="margin-bottom: 8px;">${t.feature2}</li>
                      <li style="margin-bottom: 8px;">${t.feature3}</li>
                      <li>${t.feature4}</li>
                    </ul>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 40px 40px; text-align: center;">
                  <a href="${frontendUrl}" style="display: inline-block; background-color: #2E7D32; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    ${t.buttonText}
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 40px; background-color: #f8f8f8; border-radius: 0 0 16px 16px; text-align: center;">
                  <p style="margin: 0 0 8px 0; font-size: 14px; color: #666666;">
                    ${t.supportMessage}
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #999999;">
                    ${translations[language].footer}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function generateInvitationEmailHtml(inviteUrl: string, organizationName: string, language: Language = 'es'): string {
  const isEs = language === 'es';
  const title = isEs ? `Invitación a ${organizationName}` : `Invitation to ${organizationName}`;
  const heading = isEs ? '¡Te invitaron a unirte!' : 'You have been invited!';
  const message = isEs
    ? `Has recibido una invitación para unirte a <strong>${organizationName}</strong> en JMarkets. Hacé clic en el botón para aceptarla.`
    : `You have been invited to join <strong>${organizationName}</strong> on JMarkets. Click the button below to accept.`;
  const buttonText = isEs ? 'Aceptar invitación' : 'Accept invitation';
  const expiryNote = isEs ? 'Esta invitación expira en 7 días.' : 'This invitation expires in 7 days.';
  const footer = isEs ? '© 2024 JMarkets. Todos los derechos reservados.' : '© 2024 JMarkets. All rights reserved.';

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>${title}</title></head>
    <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <tr>
          <td style="background-color: #2E7D32; padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">JMarkets</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 32px;">
            <h2 style="color: #1a1a1a; margin: 0 0 16px;">${heading}</h2>
            <p style="color: #555555; font-size: 16px; line-height: 1.5; margin: 0 0 32px;">${message}</p>
            <div style="text-align: center; margin: 0 0 32px;">
              <a href="${inviteUrl}" style="background-color: #2E7D32; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">${buttonText}</a>
            </div>
            <p style="color: #999999; font-size: 13px; margin: 0;">${expiryNote}</p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f3f4f6; padding: 16px 32px; text-align: center;">
            <p style="color: #999999; font-size: 12px; margin: 0;">${footer}</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
