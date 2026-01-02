import { Request, Response } from 'express';
import { prisma } from 'services/db.service.ts';
import dummyUploadUrlGenerator from 'utils/generateUploadUrl.util.ts';
import titleNameValidator from 'validators/categoryName.validator.ts';
import descriptionValidator from 'validators/description.validator.ts';
import discountPercentageValidator from 'validators/discountPercentage.validator.ts';
import fileNameValidator from 'validators/fileName.validator.ts';
import fileTypeValidator from 'validators/fileType.validator.ts';
import mongodbIdValidator from 'validators/mongodbId.validator.ts';
import positiveNumberValidator from 'validators/positiveNumber.validator.ts';
import priceValidator from 'validators/price.validator.ts';
import slugValidator from 'validators/slug.validator.ts';

const createCourse = async (req: Request, res: Response) => {
  try {
    //! Check if request body is provided
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is required' });
    }

    //! Get title, categoryId, teacherId, description, coverName, coverType, slug, price, discount from request body
    const {
      title: rawTitle,
      categoryId: rawCategoryId,
      description: rawDescription,
      coverName: rawCoverName,
      coverType: rawCoverType,
      slug: rawSlug,
      price: rawPrice,
      discountPercentage: rawDiscountPercentage,
    } = req.body;

    //! Validate title
    const {
      success: titleSuccess,
      data: title,
      error: titleError,
    } = titleNameValidator('Title').safeParse(rawTitle);

    if (!titleSuccess) {
      return res.status(400).json({ message: titleError?.issues[0]?.message });
    }

    //! Validate categoryId
    const {
      success: categoryIdSuccess,
      data: categoryId,
      error: categoryIdError,
    } = mongodbIdValidator('Category ID').safeParse(rawCategoryId);

    if (!categoryIdSuccess) {
      return res
        .status(400)
        .json({ message: categoryIdError?.issues[0]?.message });
    }

    //! check if category exists
    const existingCategory = await prisma.courseCategory.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return res.status(400).json({ message: 'Category not found' });
    }

    //! Get teacherId from request object
    const teacherId = req.user?.id as string;

    //! Validate description
    const {
      success: descriptionSuccess,
      data: description,
      error: descriptionError,
    } = descriptionValidator('Course description', 2000, 10).safeParse(
      rawDescription
    );

    if (!descriptionSuccess) {
      return res
        .status(400)
        .json({ message: descriptionError?.issues[0]?.message });
    }

    //! Validate coverName
    const {
      success: coverNameSuccess,
      data: coverName,
      error: coverNameError,
    } = fileNameValidator('Course cover name').safeParse(rawCoverName);

    if (!coverNameSuccess) {
      return res
        .status(400)
        .json({ message: coverNameError?.issues[0]?.message });
    }

    //! Validate coverType
    const {
      success: coverTypeSuccess,
      data: coverType,
      error: coverTypeError,
    } = fileTypeValidator('Course cover type', 'image').safeParse(rawCoverType);

    if (!coverTypeSuccess) {
      return res
        .status(400)
        .json({ message: coverTypeError?.issues[0]?.message });
    }

    //! Validate slug
    const {
      success: slugSuccess,
      data: slug,
      error: slugError,
    } = slugValidator('Course slug').safeParse(rawSlug);

    if (!slugSuccess) {
      return res.status(400).json({ message: slugError?.issues[0]?.message });
    }

    //! Check if slug is already taken
    const existingSlug = await prisma.course.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return res.status(400).json({ message: 'Course slug is already taken' });
    }

    //! Validate price
    const {
      success: priceSuccess,
      data: price,
      error: priceError,
    } = priceValidator('Course price', 500).safeParse(rawPrice);

    if (!priceSuccess) {
      return res.status(400).json({ message: priceError?.issues[0]?.message });
    }

    //! Validate discountPercentage
    const {
      success: discountPercentageSuccess,
      data: discountPercentage,
      error: discountPercentageError,
    } = discountPercentageValidator('Course discount percentage').safeParse(
      rawDiscountPercentage
    );

    if (!discountPercentageSuccess) {
      return res
        .status(400)
        .json({ message: discountPercentageError?.issues[0]?.message });
    }

    //! Generate AWS Signed URL for cover to handle the upload functionality in the frontend
    const { uploadUrl, fileKey } = dummyUploadUrlGenerator(
      coverName,
      coverType
    );

    if (!uploadUrl || !fileKey) {
      return res.status(500).json({
        message: 'Error generating upload URL, please try again later',
      });
    }

    //! Create course
    const course = await prisma.course.create({
      data: {
        title,
        categoryId,
        teacherId,
        description,
        cover: fileKey,
        slug,
        price,
        discountPercentage,
      },
    });

    return res.status(201).json({
      message: 'Course created successfully',
      data: { course, uploadUrl },
    });
  } catch (error) {
    console.error('Error creating course', error);
    return res
      .status(500)
      .json({ message: 'Error creating course, please try again later' });
  }
};

const purchaseCourse = async (req: Request, res: Response) => {
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

    //! check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return res.status(400).json({ message: 'Course not found' });
    }

    //! check if user has already purchased the course
    const existingUserCourse = await prisma.userCourse.findUnique({
      where: { userId_courseId: { userId: req.user?.id as string, courseId } },
    });

    if (existingUserCourse) {
      return res
        .status(400)
        .json({ message: 'You have already purchased this course' });
    }

    //! create user course record
    const userCourse = await prisma.userCourse.create({
      data: {
        userId: req.user?.id as string,
        courseId,
        price: existingCourse.price,
        discountPercentage: existingCourse.discountPercentage,
      },
    });

    if (!userCourse) {
      return res
        .status(400)
        .json({ message: 'Failed to purchase course, please try again later' });
    }

    return res.status(200).json({
      message: 'Course purchased successfully',
      data: { userCourse },
    });
  } catch (error) {
    console.error('Error purchasing course', error);
    return res
      .status(500)
      .json({ message: 'Error purchasing course, please try again later' });
  }
};

const getAllCoursesByCategoryId = async (req: Request, res: Response) => {
  try {
    //! get categoryId from request params
    const { categoryId } = req.params;

    //! validate categoryId
    const { success: categoryIdSuccess, error: categoryIdError } =
      mongodbIdValidator('Category ID').safeParse(categoryId);

    if (!categoryIdSuccess) {
      return res
        .status(400)
        .json({ message: categoryIdError?.issues[0]?.message });
    }

    //! check if category exists
    const existingCategory = await prisma.courseCategory.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return res.status(400).json({ message: 'Category not found' });
    }

    //! get all courses by category id
    const courses = await prisma.course.findMany({
      where: { categoryId },
    });

    if (courses.length === 0) {
      return res.status(200).json({
        message: `${existingCategory.name} has no courses yet`,
        data: { courses },
      });
    }

    return res
      .status(200)
      .json({ message: 'Courses fetched successfully', data: { courses } });
  } catch (error) {
    console.error('Error getting all courses by category id', error);
    return res.status(500).json({
      message:
        'Error getting all courses by category id, please try again later',
    });
  }
};

const getCourseById = async (req: Request, res: Response) => {
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

    //! check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return res.status(400).json({ message: 'Course not found' });
    }

    //! get all sessions for the course
    const sessions = await prisma.session.findMany({
      where: { courseId },
    });

    //! get course category
    const courseCategory = await prisma.courseCategory.findUnique({
      where: { id: existingCourse.categoryId },
    });

    //! get course teacher
    const courseTeacher = await prisma.user.findUnique({
      where: { id: existingCourse.teacherId },
      omit: { password: true, phone: true, email: true },
    });

    //! calculate the total duration of the course
    const totalDuration = sessions.reduce(
      (acc, session) => acc + session.duration,
      0
    );

    //! get comments for the course which are approved and they are not a reply
    const comments = await prisma.comment.findMany({
      where: { courseId, isApproved: true, isItReply: false },
    });

    //! get comment author for each comment
    const commentAuthors = await prisma.user.findMany({
      where: { id: { in: comments.map((comment) => comment.userId) } },
      omit: { password: true, phone: true, email: true },
    });

    //! get replies for each comment
    const replies = await prisma.comment.findMany({
      where: { courseId, isApproved: true, isItReply: true },
    });

    //! get reply author for each reply
    const replyAuthors = await prisma.user.findMany({
      where: { id: { in: replies.map((reply) => reply.userId) } },
      omit: { password: true, phone: true, email: true },
    });

    //! get ratings for the course
    const ratings = await prisma.courseRating.findMany({
      where: { courseId },
    });

    let roundedAverageRating = 5.0;

    //! calculate the average rating
    if (ratings.length > 0) {
      const averageRating =
        ratings.reduce((acc, rating) => acc + rating.rating, 0) /
        ratings.length;
      roundedAverageRating = Math.round(averageRating * 10) / 10;
    }

    //! get the number of students who have purchased the course
    const numberOfStudents = await prisma.userCourse.count({
      where: { courseId },
    });

    //! Check if the user is not teacher or admin

    let doesUserHaveFullAccess = false;

    if (req.roleLevel !== 2 && req.roleLevel !== 3) {
      doesUserHaveFullAccess = true;
    }

    //! Check if the user is logged in to have full access to the course
    if (req.roleLevel === 0) {
      doesUserHaveFullAccess = false;
    }

    //! Check if the logged in user has purchased the course
    if (req.roleLevel === 1) {
      const existingUserCourse = await prisma.userCourse.findUnique({
        where: {
          userId_courseId: { userId: req.user?.id as string, courseId },
        },
      });

      if (existingUserCourse) {
        doesUserHaveFullAccess = true;
      }

      if (!existingUserCourse) {
        doesUserHaveFullAccess = false;
      }
    }

    //! Remove the videos from the sessions with isFree set to false if the user does not have full access to the course
    let filteredSessions = sessions;
    if (!doesUserHaveFullAccess) {
      filteredSessions = sessions.map((session) => {
        if (!session.isFree) {
          return {
            ...session,
            videoUrl: '',
          };
        }

        return session;
      });
    }

    return res.status(200).json({
      message: 'Course fetched successfully',
      data: {
        course: existingCourse,
        category: courseCategory,
        teacher: courseTeacher,
        sessions: {
          total: sessions.length,
          data: filteredSessions,
        },
        doesUserHaveFullAccess,
        totalDuration,
        comments: {
          total: comments.length,
          data: comments.map((comment) => ({
            ...comment,
            author: commentAuthors.find(
              (author) => author.id === comment.userId
            ),
            replies: replies.map((reply) => ({
              ...reply,
              author: replyAuthors.find((author) => author.id === reply.userId),
            })),
          })),
        },
        ratings: {
          average: roundedAverageRating,
          total: ratings.length,
        },
        numberOfStudents,
      },
    });
  } catch (error) {
    console.error('Error getting course by id', error);
    return res
      .status(500)
      .json({ message: 'Error getting course by id, please try again later' });
  }
};

const getRelatedCourses = async (req: Request, res: Response) => {
  try {
    //! get courseId and count from request params
    const { courseId, count: rawCount } = req.params;

    //! validate courseId
    const { success: courseIdSuccess, error: courseIdError } =
      mongodbIdValidator('Course ID').safeParse(courseId);

    if (!courseIdSuccess) {
      return res
        .status(400)
        .json({ message: courseIdError?.issues[0]?.message });
    }

    //! validate count
    const {
      success: countSuccess,
      error: countError,
      data: count,
    } = positiveNumberValidator('Count').safeParse(+rawCount);

    if (!countSuccess) {
      return res.status(400).json({ message: countError?.issues[0]?.message });
    }

    //! check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return res.status(400).json({ message: 'Course not found' });
    }

    //! get related courses with the same category except the current course
    const relatedCourses = await prisma.course.findMany({
      where: { categoryId: existingCourse.categoryId, id: { not: courseId } },
      take: count,
    });

    return res.status(200).json({
      message: 'Related courses fetched successfully',
      data: { relatedCourses },
    });
  } catch (error) {
    console.error('Error getting related courses', error);
    return res.status(500).json({
      message: 'Error getting related courses, please try again later',
    });
  }
};

export {
  createCourse,
  purchaseCourse,
  getAllCoursesByCategoryId,
  getCourseById,
  getRelatedCourses,
};
