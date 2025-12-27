import { Request, Response } from 'express';
import { prisma } from 'services/db.service.ts';
import checkPassword from 'utils/checkPassword.util.ts';
import hashPassword from 'utils/hashPassword.util.ts';
import passwordValidator from 'validators/password.validator.ts';

const updatePassword = async (req: Request, res: Response) => {
  try {
    //! check if request body is provided
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is required' });
    }

    //! get current password and new password from request body
    const {
      currentPassword: rawCurrentPassword,
      newPassword: rawNewPassword,
      confirmNewPassword: rawConfirmNewPassword,
    } = req.body;

    //! check if the current password is string
    if (typeof rawCurrentPassword !== 'string') {
      return res
        .status(400)
        .json({ message: 'Current password must be a valid string' });
    }

    //! compare current password with user's password
    const isCurrentPasswordCorrect = await checkPassword(
      rawCurrentPassword,
      req?.user?.password as string
    );

    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    //! validate new password
    const {
      success: newPasswordSuccess,
      data: newPassword,
      error: newPasswordError,
    } = passwordValidator('New Password').safeParse(rawNewPassword);

    if (!newPasswordSuccess) {
      return res
        .status(400)
        .json({ message: newPasswordError?.issues[0]?.message });
    }

    //! check if new password and confirm new password match
    if (newPassword !== rawConfirmNewPassword) {
      return res.status(400).json({
        message: 'New password and confirm new password do not match',
      });
    }

    //! check if the new password is not the same as the current password
    if (newPassword === rawCurrentPassword) {
      return res.status(400).json({
        message: 'New password cannot be the same as the current password',
      });
    }

    //! hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    //! update user password
    const updatedUser = await prisma.user.update({
      where: { id: req.user?.id as string },
      data: { password: hashedNewPassword },
    });

    if (!updatedUser) {
      return res
        .status(400)
        .json({ message: 'Failed to update password, try again later' });
    }

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export { updatePassword };
