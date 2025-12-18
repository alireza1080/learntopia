import { Request, Response } from 'express';
import nameValidator from '../../validators/name.validator.ts';
import usernameValidator from '../../validators/username.validator.ts';
import { prisma } from '../../services/db.service.ts';
import emailValidator from 'validators/email.validator.ts';
import passwordValidator from 'validators/password.validator.ts';
import phoneValidator from 'validators/phone.validator.ts';
import hashPassword from 'utils/hashPassword.util.ts';
import mongodbIdValidator from 'validators/mongodbId.validator.ts';

const createUser = async (req: Request, res: Response) => {
  try {
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
    } = passwordValidator.safeParse(password);

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

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const { targetUserId: rawTargetUserId } = req.params;
    const { operatorId: rawOperatorId } = req.body;

    //! validate targetUserId
    const {
      success: targetUserIdSuccess,
      data: targetUserId,
      error: targetUserIdError,
    } = mongodbIdValidator('targetUserId').safeParse(rawTargetUserId);

    if (!targetUserIdSuccess) {
      return res
        .status(400)
        .json({ message: targetUserIdError?.issues[0]?.message });
    }

    //! validate operatorId
    const {
      success: operatorIdSuccess,
      data: operatorId,
      error: operatorIdError,
    } = mongodbIdValidator('operatorId').safeParse(rawOperatorId);

    if (!operatorIdSuccess) {
      return res
        .status(400)
        .json({ message: operatorIdError?.issues[0]?.message });
    }

    //! check if operator is available and is an admin
    const operator = await prisma.user.findUnique({
      where: { id: operatorId },
    });

    if (!operator) {
      return res
        .status(400)
        .json({ message: 'Operator is not available' });
    }

    if (operator.role !== 'ADMIN') {
      return res.status(400).json({ message: 'Operator is not an admin' });
    }

    //! check if target user is available
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return res
        .status(400)
        .json({ message: 'Target user is not available' });
    }

    //! check if the target user is an admin
    const isTargetUserAdmin = targetUser.role === 'ADMIN';

    //! if the target user is an admin, check if it is the only admin
    const isOnlyAdmin = await prisma.user.count({ where: { role: 'ADMIN' } }) === 1;

    if (isTargetUserAdmin && isOnlyAdmin) {
      return res.status(400).json({ message: 'The last admin cannot be deleted' });
    }

    //! delete target user
    await prisma.user.delete({ where: { id: targetUserId } });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { createUser, deleteUser };
