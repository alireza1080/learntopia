import { Request, Response } from 'express';
import { prisma } from 'services/db.service.ts';
import mongodbIdValidator from 'validators/mongodbId.validator.ts';

const banUser = async (req: Request, res: Response) => {
    try {
        const { violatorId } = req.params;

        //! check if violator id is valid
        const { success: violatorIdSuccess, error: violatorIdError } = mongodbIdValidator('Violator ID').safeParse(violatorId);

        if (!violatorIdSuccess) {
            return res.status(400).json({ message: violatorIdError?.issues[0]?.message });
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

        //! check if user exists
        const user = await prisma.user.findUnique({
            where: {
                id: violatorId,
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const bannedBy = req.user?.id;

        //! get reason from request body
        const reason = String( req?.body?.reason?.trim()) || 'Violated the terms of service';

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

        console.log(updatedUser, bannedUser);

        return res.status(200).json({ message: 'User banned successfully' });
    } catch (error) {
        console.error('Error banning user', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const unBanUser = async (req: Request, res: Response) => {}

export { banUser, unBanUser };