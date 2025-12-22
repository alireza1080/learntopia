import { Request, Response } from 'express';
import { prisma } from 'services/db.service.ts';
import mongodbIdValidator from 'validators/mongodbId.validator.ts';
import roleValidator from 'validators/role.validator.ts';
import { Role } from 'generated/prisma/client.ts';

const banUser = async (req: Request, res: Response) => {
  try {
    const { violatorId } = req.params;

    //! check if violator id is valid
    const { success: violatorIdSuccess, error: violatorIdError } =
      mongodbIdValidator('Violator ID').safeParse(violatorId);

    if (!violatorIdSuccess) {
      return res
        .status(400)
        .json({ message: violatorIdError?.issues[0]?.message });
    }

    //! check if user exists
    const user = await prisma.user.findUnique({
      where: {
        id: violatorId,
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    //! check if user is not already banned
    const isBanned = await prisma.bannedUser.findUnique({
      where: {
        userId: violatorId,
      },
    });

    if (isBanned) {
      return res.status(400).json({ message: 'User is already banned' });
    }

    const bannedBy = req.user?.id;

    //! get reason from request body
    const reason =
      String(req?.body?.reason?.trim()) || 'Violated the terms of service';

    //! ban user by updating user isBanned field to true && create a banned user record
    const [updatedUser, bannedUser] = await Promise.all([
      prisma.user.update({
        where: {
          id: violatorId,
        },
        data: { isBanned: true },
      }),
      prisma.bannedUser.create({
        data: {
          userId: violatorId,
          reason,
          bannedBy: bannedBy as string,
        },
      }),
    ]);

    return res.status(200).json({ message: 'User banned successfully' });
  } catch (error) {
    console.error('Error banning user', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const unBanUser = async (req: Request, res: Response) => {
  try {
    const { violatorId } = req.params;

    //! check if violator id is valid
    const { success: violatorIdSuccess, error: violatorIdError } =
      mongodbIdValidator('Violator ID').safeParse(violatorId);

    if (!violatorIdSuccess) {
      return res
        .status(400)
        .json({ message: violatorIdError?.issues[0]?.message });
    }

    //! check if user exists
    const user = await prisma.user.findUnique({
      where: {
        id: violatorId,
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    //! check if user is banned
    const isBanned = await prisma.bannedUser.findUnique({
      where: {
        userId: violatorId,
      },
    });

    if (!isBanned) {
      return res.status(400).json({ message: 'User is not banned' });
    }

    //! unban user by updating user isBanned field to false && delete the banned user record
    const [updatedUser, deletedBannedUser] = await Promise.all([
      prisma.user.update({
        where: {
          id: violatorId,
        },
        data: { isBanned: false },
      }),
      prisma.bannedUser.delete({
        where: {
          userId: violatorId,
        },
      }),
    ]);

    return res.status(200).json({ message: 'User unbanned successfully' });
  } catch (error) {
    console.error('Error unbanning user', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const {
      page: rawPage,
      limit: rawLimit,
      orderBy: rawOrderBy,
    } = req.query as {
      page: string | undefined;
      limit: string | undefined;
      orderBy: 'asc' | 'desc' | undefined;
    };

    const [page, limit] = [Number(rawPage) || 1, Number(rawLimit) || 10];

    const orderBy = rawOrderBy === 'asc' ? 'asc' : 'desc';

    //! get all users
    const users = await prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: orderBy },
      omit: { password: true },
    });

    return res
      .status(200)
      .json({ message: 'Users fetched successfully', data: users });
  } catch (error) {
    console.error('Error getting all users', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    //! check if user id is valid
    const { success: userIdSuccess, error: userIdError } =
      mongodbIdValidator('User ID').safeParse(userId);

    if (!userIdSuccess) {
      return res.status(400).json({ message: userIdError?.issues[0]?.message });
    }

    //! check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    //! delete user
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    if (!deletedUser) {
      return res
        .status(400)
        .json({ message: 'Failed to delete user, try again later' });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    //! check if user id is valid
    const { success: userIdSuccess, error: userIdError } =
      mongodbIdValidator('User ID').safeParse(userId);

    if (!userIdSuccess) {
      return res.status(400).json({ message: userIdError?.issues[0]?.message });
    }

    //! check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    //! check if request body is provided
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is required' });
    }

    //! get role from request body
    const { role: rawRole } = req.body;

    //! check if role is valid
    const {
      success: roleSuccess,
      data: role,
      error: roleError,
    } = roleValidator.safeParse(rawRole);

    if (!roleSuccess) {
      return res.status(400).json({ message: roleError?.issues[0]?.message });
    }

    //! check if the operator is not the same as the user
    if (req.user?.id === userId) {
      return res
        .status(400)
        .json({ message: 'You cannot update your own role' });
    }

    //! check if role is different from current role
    if (role === user.role) {
      return res
        .status(400)
        .json({ message: 'New role is the same as current role' });
    }

    //! update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as Role },
    });

    if (!updatedUser) {
      return res
        .status(400)
        .json({ message: 'Failed to update user role, try again later' });
    }

    return res
      .status(200)
      .json({
        message: `${user.name}'s role updated to ${role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()} successfully`,
      });
  } catch (error) {
    console.error('Error updating user role', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export { banUser, unBanUser, getAllUsers, deleteUser, updateUserRole };
