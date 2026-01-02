import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del "Cartero" (Transporter)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verificar conexión al iniciar
transporter.verify().then(() => {
    console.log('✅ Listo para enviar correos con Gmail');
}).catch((error) => {
    console.error('❌ Error configurando Gmail:', error.message);
});

export const sendVerificationEmail = async (email, token) => {
    try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verificationUrl = `${frontendUrl}/verificar?token=${token}`;

        // Gmail no carga imágenes de localhost. Usamos un placeholder público si estamos en desarrollo.
        const isLocal = frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1');
        const logoUrl = isLocal
            ? 'https://placehold.co/400x120/ffffff/0f172a?text=Inmobiliaria+Escudero&font=lora' // Logo temporal visible en Gmail
            : `${frontendUrl}/logo-rectangular.jpg`;

        const info = await transporter.sendMail({
            from: '"Inmobiliaria Escudero" <' + process.env.EMAIL_USER + '>',
            to: email,
            subject: 'Verificación de cuenta - Inmobiliaria Escudero',
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #ffffff; padding: 32px 24px; text-align: center; border-bottom: 1px solid #f1f5f9;">
                         <img src="${logoUrl}" alt="Inmobiliaria Escudero" style="height: 60px; width: auto; display: block; margin: 0 auto;">
                    </div>
                    
                    <div style="padding: 40px 32px;">
                        <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 24px; font-size: 20px; font-weight: 600; text-align: center;">Bienvenido a Inmobiliaria Escudero</h2>
                        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Estimado cliente,</p>
                        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">Gracias por crear su cuenta. Para completar el registro y acceder a nuestros servicios, por favor verifique su dirección de correo electrónico pulsando el siguiente botón:</p>
                        
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${verificationUrl}" style="background-color: #0f172a; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Verificar Cuenta</a>
                        </div>

                        <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-bottom: 16px; border-top: 1px solid #f1f5f9; padding-top: 24px;">Si el botón no funciona, copie y pegue el siguiente enlace en su navegador:</p>
                        <p style="margin: 0; word-break: break-all;">
                            <a href="${verificationUrl}" style="color: #ea580c; font-size: 14px; text-decoration: none;">${verificationUrl}</a>
                        </p>
                    </div>
                    
                    <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                         <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Inmobiliaria Escudero. Todos los derechos reservados.</p>
                         <p style="color: #94a3b8; font-size: 12px; margin-top: 8px;">Este es un mensaje automático, por favor no responda a este correo.</p>
                    </div>
                </div>
            `,
        });

        console.log('📨 Correo enviado: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error enviando email:', error);
        return false;
    }
};

export const sendPasswordResetEmail = async (email, token) => {
    try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/olvide-password/${token}`;

        // Gmail no carga imágenes de localhost. Usamos un placeholder público si estamos en desarrollo.
        const isLocal = frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1');
        const logoUrl = isLocal
            ? 'https://placehold.co/400x120/ffffff/0f172a?text=Inmobiliaria+Escudero&font=lora' // Logo temporal visible en Gmail
            : `${frontendUrl}/logo-rectangular.jpg`;

        const info = await transporter.sendMail({
            from: '"Inmobiliaria Escudero" <' + process.env.EMAIL_USER + '>',
            to: email,
            subject: 'Restablecimiento de contraseña - Inmobiliaria Escudero',
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #ffffff; padding: 32px 24px; text-align: center; border-bottom: 1px solid #f1f5f9;">
                         <img src="${logoUrl}" alt="Inmobiliaria Escudero" style="height: 60px; width: auto; display: block; margin: 0 auto;">
                    </div>
                    
                    <div style="padding: 40px 32px;">
                        <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 24px; font-size: 20px; font-weight: 600; text-align: center;">Recuperación de Acceso</h2>
                        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Estimado usuario,</p>
                        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">Hemos recibido una solicitud para restablecer la contraseña de su cuenta. Si ha sido usted, pulse el siguiente botón para crear una nueva contraseña:</p>
                        
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${resetUrl}" style="background-color: #0f172a; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Restablecer Contraseña</a>
                        </div>

                        <p style="color: #64748b; font-size: 14px; text-align: center; margin-bottom: 16px;">Este enlace expirará en 1 hora por motivos de seguridad.</p>

                        <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-bottom: 16px; border-top: 1px solid #f1f5f9; padding-top: 24px;">Si el botón no funciona, copie y pegue el siguiente enlace en su navegador:</p>
                        <p style="margin: 0; word-break: break-all;">
                            <a href="${resetUrl}" style="color: #ea580c; font-size: 14px; text-decoration: none;">${resetUrl}</a>
                        </p>
                    </div>
                    
                    <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                         <p style="color: #94a3b8; font-size: 12px; margin: 0;">Si no solicitó este cambio, puede ignorar este mensaje. Su cuenta permanece segura.</p>
                         <p style="color: #94a3b8; font-size: 12px; margin-top: 8px;">&copy; ${new Date().getFullYear()} Inmobiliaria Escudero. Todos los derechos reservados.</p>
                    </div>
                </div>
            `,
        });

        console.log('📨 Correo de recuperación enviado: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error enviando email de recuperación:', error);
        return false;
    }
};
