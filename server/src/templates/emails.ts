// JMarkets Email Templates

export function generateVerificationEmailHtml(code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fce7f3;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fce7f3; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; color: #e91e63; font-weight: bold;">🍓 JMarkets</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 20px 40px; text-align: center;">
                  <h2 style="margin: 0; font-size: 24px; color: #1a1a1a;">¡Te damos la bienvenida!</h2>
                  <p style="margin: 16px 0 0 0; font-size: 16px; color: #666666; line-height: 1.5;">
                    Gracias por registrarte en JMarkets. Para completar tu registro, ingresa el siguiente código de verificación:
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 30px 40px; text-align: center;">
                  <div style="background-color: #fce7f3; border-radius: 12px; padding: 24px; display: inline-block;">
                    <span style="font-size: 36px; font-weight: bold; color: #e91e63; letter-spacing: 8px;">${code}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 40px 40px; text-align: center;">
                  <p style="margin: 0; font-size: 14px; color: #999999;">
                    Este código expira en 24 horas.<br>
                    Si no solicitaste este código, puedes ignorar este mensaje.
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

export function generatePasswordResetEmailHtml(code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fce7f3;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fce7f3; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; color: #e91e63; font-weight: bold;">🍓 JMarkets</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 20px 40px; text-align: center;">
                  <h2 style="margin: 0; font-size: 24px; color: #1a1a1a;">Restablecer Contraseña</h2>
                  <p style="margin: 16px 0 0 0; font-size: 16px; color: #666666; line-height: 1.5;">
                    Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código para continuar:
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 30px 40px; text-align: center;">
                  <div style="background-color: #fce7f3; border-radius: 12px; padding: 24px; display: inline-block;">
                    <span style="font-size: 36px; font-weight: bold; color: #e91e63; letter-spacing: 8px;">${code}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 20px 40px; text-align: center;">
                  <div style="background-color: #fff3cd; border-radius: 8px; padding: 16px;">
                    <p style="margin: 0; font-size: 14px; color: #856404;">
                      <strong>⚠️ Importante:</strong> Si no solicitaste restablecer tu contraseña, ignora este mensaje. Tu cuenta está segura.
                    </p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 40px 40px; text-align: center;">
                  <p style="margin: 0; font-size: 14px; color: #999999;">
                    Este código expira en 1 hora.
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

export function generateAdminCreateUserEmailHtml(tempPassword: string, email: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fce7f3;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fce7f3; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; color: #e91e63; font-weight: bold;">🍓 JMarkets</h1>
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
                  <div style="background-color: #fce7f3; border-radius: 12px; padding: 24px;">
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #666666;">
                      <strong>Email:</strong> ${email}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #666666;">
                      <strong>Contraseña temporal:</strong>
                    </p>
                    <span style="font-size: 20px; font-weight: bold; color: #e91e63;">${tempPassword}</span>
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

export function generateWelcomeEmailHtml(userName: string, frontendUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fce7f3;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fce7f3; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; color: #e91e63; font-weight: bold;">🍓 JMarkets</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 20px 40px; text-align: center;">
                  <h2 style="margin: 0; font-size: 24px; color: #1a1a1a;">¡Hola, ${userName}!</h2>
                  <p style="margin: 16px 0 0 0; font-size: 16px; color: #666666; line-height: 1.5;">
                    Tu cuenta ha sido verificada exitosamente. Ya puedes comenzar a vender en tu tienda online.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 30px 40px;">
                  <div style="background-color: #fce7f3; border-radius: 12px; padding: 24px;">
                    <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #e91e63;">¿Qué puedes hacer ahora?</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #666666;">
                      <li style="margin-bottom: 8px;">Configura tu tienda</li>
                      <li style="margin-bottom: 8px;">Agrega tus productos</li>
                      <li style="margin-bottom: 8px;">Personaliza tu diseño</li>
                      <li>Comienza a vender</li>
                    </ul>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 40px 40px 40px; text-align: center;">
                  <a href="${frontendUrl}" style="display: inline-block; background-color: #e91e63; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Ir a Mi Tienda
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 40px; background-color: #f8f8f8; border-radius: 0 0 16px 16px; text-align: center;">
                  <p style="margin: 0 0 8px 0; font-size: 14px; color: #666666;">
                    ¿Tienes preguntas? Contáctanos en nuestras redes sociales.
                  </p>
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
