import type { Request, Response } from "express";
import User from "../models/auth";
import bcrypt from "bcrypt";
import { checkPassword, hashPassword } from "../utils/auth";
import Token from "../models/Token";
import { generateToken } from "../utils/token";
import { transporter } from "../config/nodemailer";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      const { password, email } = req.body;

      // prevenir duplicados
      const UserExists = await User.findOne({ email });
      if (UserExists) {
        const error = new Error("El usuario ya está registrado");
        res.status(409).json({ error: error.message });
        return;
      }

      // crear usuario
      const user = new User(req.body);

      // hash password
      user.password = await hashPassword(password);

      // generar el token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      // enviar el email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });
      await Promise.allSettled([user.save(), token.save()]);

      res.send("cuenta creada, revisa tu email para confirmarla");
    } catch (error) {
      res.status(500).json({ error: "hubo un error" });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Token no valido");
        res.status(404).json({ error: error.message });
        return;
      }
      const user = await User.findById(tokenExists.user);
      user.confirmed = true;
      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
      res.send("cuenta confirmada, correctamente");
    } catch (error) {
      res.status(500).json({ error: "hubo un error" });
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("Usuario no encontrado");
        res.status(404).json({ error: error.message });
        return;
      }
      if (!user.confirmed) {
        const token = new Token();
        token.user = user.id;
        token.token = generateToken();

        AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token,
        });

        const error = new Error(
          "La cuenta no ha sido confirmada, hemos enviado un e-mail de confirmación"
        );
        res.status(401).json({ error: error.message });
        return;
      }

      // revisar password

      const isPasswordCorrect = await checkPassword(password, user.password);

      if (!isPasswordCorrect) {
        const error = new Error("Password incorrecto");
        res.status(401).json({ error: error.message });
        return;
      }
      const token = generateJWT({ id: user.id });
      res.send(token);
    } catch (error) {
      res.status(500).json({ error: "hubo un error" });
    }
  };

  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // usuario existe
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El usuario no está registrado");
        res.status(404).json({ error: error.message });
        return;
      }
      if (user.confirmed) {
        const error = new Error("El usuario  ya está confirmado");
        res.status(403).json({ error: error.message });
        return;
      }

      // generar el token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      // enviar el email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });
      await Promise.allSettled([user.save(), token.save()]);

      res.send("Se envio un nuevo token a tu email");
    } catch (error) {
      res.status(500).json({ error: "hubo un error" });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // usuario existe
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El usuario no está registrado");
        res.status(404).json({ error: error.message });
        return;
      }

      // generar el token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;
      await token.save();

      // enviar el email
      AuthEmail.sendPasswordResetToken({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      res.send("Revisa tu email para instrucciones");
    } catch (error) {
      res.status(500).json({ error: "hubo un error" });
    }
  };

  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Token no valido");
        res.status(404).json({ error: error.message });
        return;
      }
      res.send("Token valido, Define tu nuevo password");
    } catch (error) {
      res.status(500).json({ error: "hubo un error" });
    }
  };

  static updatePasswordwithToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Token no valido");
        res.status(404).json({ error: error.message });
        return;
      }

      const user = await User.findById(tokenExists.user);
      user.password = await hashPassword(req.body.password);

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
      res.send("El password se modifico, correctamente");
    } catch (error) {
      res.status(500).json({ error: "hubo un error" });
    }
  };

  static user = async (req: Request, res: Response): Promise<void> => {
    res.json(req.user);
  };

  static updateProfile = async (req: Request, res: Response): Promise<void> => {
    const { name, email } = req.body;
    req.user.name = name;
    req.user.email = email;

    const UserExists = await User.findOne({ email });
    if (UserExists && UserExists.id.toString() !== req.user.id.toString()) {
      const error = new Error("Ese email ya esta registrado");
      res.status(404).json({ error: error.message });
      return;
    }
    try {
      await req.user.save();
      res.send("Perfil actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: "hubo un error" });
      return
    }
  };

  static updateCurrentUserPassword = async (req: Request, res: Response): Promise<void> => {
    const { password,current_password } = req.body;

    const user= await User.findById(req.user.id)
    const isPasswordCorrect= await checkPassword(current_password, user.password)

    if(!isPasswordCorrect){
      const error = new Error("El paswword actual es incorrecto");
      res.status(401).json({ error: error.message });
      return;
    }
    user.password= await hashPassword(password)
    await user.save()
    try {
      user.password= await hashPassword(password)
      await user.save()
      res.send("El password se ejecuto correctamente")
    } catch (error) {
      res.status(500).json({ error: "hubo un error" });
      return
    }
  };

  static checkPassword = async (req: Request, res: Response): Promise<void> => {
    const { password} = req.body;

    const user= await User.findById(req.user.id)
    const isPasswordCorrect= await checkPassword(password, user.password)

    if(!isPasswordCorrect){
      const error = new Error("El paswword  es incorrecto");
      res.status(401).json({ error: error.message });
      return;
    }
    res.send("El password se correcto")
    await user.save()
  }



}
