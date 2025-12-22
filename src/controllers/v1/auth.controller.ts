import { Request, Response } from 'express';
import { prisma } from '../../services/db.service.ts';
import nameValidator from '../../validators/name.validator.ts';
import usernameValidator from '../../validators/username.validator.ts';
import emailValidator from 'validators/email.validator.ts';
import passwordValidator from 'validators/password.validator.ts';
import phoneValidator from 'validators/phone.validator.ts';
import hashPassword from 'utils/hashPassword.util.ts';
import mongodbIdValidator from 'validators/mongodbId.validator.ts';
import createToken from 'utils/createToken.util.ts';
import checkPassword from 'utils/checkPassword.util.ts';

const register = async (req: Request, res: Response) => {
  try {
    //! Check if request body is provided
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is required' });
    }

    const {
      name: rawName,
      username: rawUsername,
      email: rawEmail,
      password,
      confirmPassword,
      phone: rawPhone,
    } = req.body;

    //! validate name
    const {
      success: nameSuccess,
      data: name,
      error: nameError,
    } = nameValidator.safeParse(rawName);

    if (!nameSuccess) {
      return res.status(400).json({ message: nameError?.issues[0]?.message });
    }

    //! validate username
    const {
      success: usernameSuccess,
      data: username,
      error: usernameError,
    } = usernameValidator.safeParse(rawUsername);

    if (!usernameSuccess) {
      return res
        .status(400)
        .json({ message: usernameError?.issues[0]?.message });
    }

    //! check if username is already taken
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    //! validate email
    const {
      success: emailSuccess,
      data: email,
      error: emailError,
    } = emailValidator.safeParse(rawEmail);

    if (!emailSuccess) {
      return res.status(400).json({ message: emailError?.issues[0]?.message });
    }

    //! check if email is already taken
    const existingEmail = await prisma.user.findUnique({ where: { email } });

    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already taken' });
    }

    //! validate password
    const {
      success: passwordSuccess,
      data: validatedPassword,
      error: passwordError,
    } = passwordValidator('Password').safeParse(password);

    if (!passwordSuccess) {
      return res
        .status(400)
        .json({ message: passwordError?.issues[0]?.message });
    }

    //! check if password and confirm password match
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: 'Password and confirm password do not match' });
    }

    //! validate phone
    const {
      success: phoneSuccess,
      data: phone,
      error: phoneError,
    } = phoneValidator.safeParse(rawPhone);

    if (!phoneSuccess) {
      return res.status(400).json({ message: phoneError?.issues[0]?.message });
    }

    //! check if phone is already taken
    const existingPhone = await prisma.user.findUnique({ where: { phone } });

    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number is already taken' });
    }

    //! set role ==> default is USER / ADMIN if first user is being created
    const isFirstUser = (await prisma.user.count()) === 0;

    const role = isFirstUser ? 'ADMIN' : 'USER';

    //! hash password
    const hashedPassword = await hashPassword(validatedPassword);

    //! create user
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        phone,
        role,
      },
      omit: { password: true },
    });

    //! Generate access token
    const accessToken = createToken(user.id, '30 days');

    return res
      .status(201)
      .json({ message: 'User registered successfully', user, accessToken });
  } catch (error) {
    console.error('Error registering user', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    //! Check if request body is provided
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is required' });
    }

    const { identifier: rawIdentifier, password } = req.body;

    //! Check if identifier is provided
    if (!rawIdentifier) {
      return res.status(400).json({ message: 'Email or username is required' });
    }

    //! Check if password is provided
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const identifier = rawIdentifier.toLowerCase();

    //! check if there is a user with the given identifier
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    //! check if user is banned
    if (user.isBanned) {
      return res
        .status(400)
        .json({ message: 'Access denied, your account has been banned' });
    }

    //! check if the password is a valid string
    if (typeof password !== 'string') {
      return res.status(400).json({ message: 'Password must be a valid string' });
    }

    //! check if password is correct
    const isPasswordCorrect = await checkPassword(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    //! generate access token
    const accessToken = createToken(user.id, '30 days');

    return res
      .status(200)
      .json({ message: 'Login successful', user, accessToken });
  } catch (error) {
    console.error('Error logging in', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const logout = async (req: Request, res: Response) => {};

const me = async (req: Request, res: Response) => {};

export { register, login, logout, me };
