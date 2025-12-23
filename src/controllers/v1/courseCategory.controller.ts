import { Request, Response } from 'express';

const createCourseCategory = async (req: Request, res: Response) => {
    try {
        const { name: categoryNameRaw, href: categoryHrefRaw } = req.body;
    } catch (error) {
        console.error('Error creating course category', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export { createCourseCategory };