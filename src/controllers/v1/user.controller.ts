import { Request, Response } from 'express';
import { prisma } from '../../services/db.service.ts';
import mongodbIdValidator from '../../validators/mongodbId.validator.ts';

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
      return res.status(400).json({ message: 'Operator is not available' });
    }

    if (operator.role !== 'ADMIN') {
      return res.status(400).json({ message: 'Operator is not an admin' });
    }

    //! check if target user is available
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return res.status(400).json({ message: 'Target user is not available' });
    }

    //! check if the target user is an admin
    const isTargetUserAdmin = targetUser.role === 'ADMIN';

    //! if the target user is an admin, check if it is the only admin
    const isOnlyAdmin =
      (await prisma.user.count({ where: { role: 'ADMIN' } })) === 1;

    if (isTargetUserAdmin && isOnlyAdmin) {
      return res
        .status(400)
        .json({ message: 'The last admin cannot be deleted' });
    }

    //! delete target user
    await prisma.user.delete({ where: { id: targetUserId } });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { deleteUser };
