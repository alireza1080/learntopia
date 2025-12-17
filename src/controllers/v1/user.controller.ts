import { Request, Response } from 'express';
import nameValidator from '../../validators/name.validator.ts';
import usernameValidator from '../../validators/username.validator.ts';
import { prisma } from '../../services/db.service.ts';
import emailValidator from 'validators/email.validator.ts';
import passwordValidator from 'validators/password.validator.ts';

export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      name: rawName,
      username: rawUsername,
      email: rawEmail,
      password,
      confirmPassword,
      phone: rawPhone,
      role,
    } = req.body;

    //! validate name
    const { success: nameSuccess, data: name, error: nameError } = nameValidator.safeParse(rawName);

    if (!nameSuccess) {
      return res.status(400).json({ message: nameError?.issues[0]?.message });
    }
    
    //! validate username
    const { success: usernameSuccess, data: username, error: usernameError } = usernameValidator.safeParse(rawUsername);

    if (!usernameSuccess) {
      return res.status(400).json({ message: usernameError?.issues[0]?.message });
    }

    //! check if username is already taken
    const existingUsername = await prisma.user.findUnique({ where: { username } });

    if (existingUsername) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    //! validate email
    const { success: emailSuccess, data: email, error: emailError } = emailValidator.safeParse(rawEmail);

    if (!emailSuccess) {
      return res.status(400).json({ message: emailError?.issues[0]?.message });
    }

    //! check if email is already taken
    const existingEmail = await prisma.user.findUnique({ where: { email } });

    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already taken' });
    }

    //! validate password
    const { success: passwordSuccess, data: validatedPassword, error: passwordError } = passwordValidator.safeParse(password);

    if (!passwordSuccess) {
      return res.status(400).json({ message: passwordError?.issues[0]?.message });
    }

    //! check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and confirm password do not match' });
    }

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
