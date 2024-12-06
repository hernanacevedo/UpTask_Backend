import { transporter } from "../config/nodemailer"

interface IEmail{
    email:string
    name:string
    token:string
}

 export class AuthEmail{
    static sendConfirmationEmail= async(user:IEmail)=>{
        const info = await transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: user.email,
            subject: 'Uptask - Confirma tu Cuenta',
            text: 'Uptask - Confirma tu cuenta',
            html:`<p>Hola:${user.name}, has creado tue cuenta en Uptask, ya casi esta todo listo, solo debes confirmar tu cuenta<p>
            <p>Visita el siguiente enlace:<p/>
            <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta </a>
            <p> E ingrea el codigo: <b>${user.token}</b></p>
            <p>este token expira en 10 minutos</p>`
        })

        console.log('Mensaje enviado',info.messageId)

    }

    static sendPasswordResetToken= async(user:IEmail)=>{
        const info = await transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: user.email,
            subject: 'Uptask - Reestablece tu password',
            text: 'Uptask - Confirma tu cuenta',
            html:`<p>Hola:${user.name}, has solicitado reestablecer tu password.<p>
            <p>Visita el siguiente enlace:<p/>
            <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestablecer Password</a>
            <p> E ingrea el codigo: <b>${user.token}</b></p>
            <p>este token expira en 10 minutos</p>`
        })

        console.log('Mensaje enviado',info.messageId)

    }
 }