import { Request, Response } from 'express';
import { prisma } from 'services/db.service.ts';
import mongodbIdValidator from 'validators/mongodbId.validator.ts';
import rateValidator from 'validators/integer.validator.ts';

const createRating = async (req: Request, res: Response) => {
  try {
    //! get courseId from request params
    const { courseId } = req.params;

    //! validate courseId
    const { success: courseIdSuccess, error: courseIdError } =
      mongodbIdValidator('Course ID').safeParse(courseId);

    if (!courseIdSuccess) {
      return res
        .status(400)
        .json({ message: courseIdError?.issues[0]?.message });
    }

    //! check if the course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return res.status(400).json({ message: 'Course not found' });
    }

    //! check if the user has already rated the course
    const existingRating = await prisma.courseRating.findUnique({
      where: { userId_courseId: { userId: req.user?.id as string, courseId } },
    });

    if (existingRating) {
      return res
        .status(400)
        .json({ message: 'You have already rated this course' });
    }

    //! check if the request body is provided
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is required' });
    }

    //! get rating from request body
    const { rating: rawRating } = req.body;

    //! validate rating
    const {
      success: ratingSuccess,
      error: ratingError,
      data: rating,
    } = rateValidator('Rating').safeParse(rawRating);

    if (!ratingSuccess) {
      return res.status(400).json({ message: ratingError?.issues[0]?.message });
    }

    //! create rating
    const newRating = await prisma.courseRating.create({
      data: { userId: req.user?.id as string, courseId, rating },
    });

    if (!newRating) {
      return res
        .status(400)
        .json({ message: 'Failed to create rating, please try again later' });
    }

    return res
      .status(200)
      .json({ message: 'Rating created successfully', rating: newRating });
  } catch (error) {
    console.error('Error creating rating', error);
    return res
      .status(500)
      .json({ message: 'Error creating rating, please try again later' });
  }
};

export default createRating;
