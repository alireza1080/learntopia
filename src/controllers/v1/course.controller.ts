import { Request, Response } from 'express';

const createCourse = async (req: Request, res: Response) => {
    return res.status(200).json({ message: 'Course created successfully' });
};

export { createCourse };