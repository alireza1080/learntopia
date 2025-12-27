import { Request, Response } from 'express';
import { prisma } from 'services/db.service.ts';
import mongodbIdValidator from 'validators/mongodbId.validator.ts';
import titleNameValidator from 'validators/categoryName.validator.ts';
import durationValidator from 'validators/duration.validator.ts';
import descriptionValidator from 'validators/description.validator.ts';
import z from 'zod';
import booleanValidator from 'validators/boolean.validator.ts';
import fileNameValidator from 'validators/fileName.validator.ts';
import fileTypeValidator from 'validators/fileType.validator.ts';
import dummyUploadUrlGenerator from 'utils/generateUploadUrl.util.ts';

const createSession = async (req: Request, res: Response) => {
  try {
    //! Check if request body is provided
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is required' });
    }

    //! Get courseId and sessionNumber from request body
    const {
      courseId: rawCourseId,
      title: rawTitle,
      duration: rawDuration,
      description: rawDescription,
      isFree: rawIsFree,
      imageType: rawImageType,
      videoType: rawVideoType,
    } = req.body;

    //! Validate courseId
    const {
      success: courseIdSuccess,
      error: courseIdError,
      data: courseId,
    } = mongodbIdValidator('Course ID').safeParse(rawCourseId);

    if (!courseIdSuccess) {
      return res
        .status(400)
        .json({ message: courseIdError?.issues[0]?.message });
    }

    //! Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return res.status(400).json({ message: 'Course not found' });
    }

    //! Validate title
    const {
      success: titleSuccess,
      error: titleError,
      data: title,
    } = titleNameValidator('Session title').safeParse(rawTitle);

    if (!titleSuccess) {
      return res.status(400).json({ message: titleError?.issues[0]?.message });
    }

    //! Validate duration
    const {
      success: durationSuccess,
      error: durationError,
      data: duration,
    } = durationValidator('Session duration').safeParse(rawDuration);

    if (!durationSuccess) {
      return res
        .status(400)
        .json({ message: durationError?.issues[0]?.message });
    }

    //! Validate description
    const {
      success: descriptionSuccess,
      error: descriptionError,
      data: description,
    } = descriptionValidator('Session description', 2000, 10).safeParse(
      rawDescription
    );

    if (!descriptionSuccess) {
      return res
        .status(400)
        .json({ message: descriptionError?.issues[0]?.message });
    }

    //! Validate isFree
    const {
      success: isFreeSuccess,
      error: isFreeError,
      data: isFree,
    } = booleanValidator('Is free session').safeParse(rawIsFree);

    if (!isFreeSuccess) {
      return res.status(400).json({ message: isFreeError?.issues[0]?.message });
    }

    //! Validate imageType
    const {
      success: imageTypeSuccess,
      error: imageTypeError,
      data: imageType,
    } = fileTypeValidator('Session image type', 'image').safeParse(
      rawImageType
    );

    if (!imageTypeSuccess) {
      return res
        .status(400)
        .json({ message: imageTypeError?.issues[0]?.message });
    }

    //! Validate videoType
    const {
      success: videoTypeSuccess,
      error: videoTypeError,
      data: videoType,
    } = fileTypeValidator('Session video type', 'video').safeParse(
      rawVideoType
    );

    if (!videoTypeSuccess) {
      return res
        .status(400)
        .json({ message: videoTypeError?.issues[0]?.message });
    }

    //! Generate session number
    const sessionNumber =
      (await prisma.session.count({
        where: { courseId },
      })) + 1;

    //! Generate image name
    const imageName = `session-${sessionNumber}-image`;

    //! Generate video name
    const videoName = `session-${sessionNumber}-video`;

    //! Generate slug
    const slug = `session-${sessionNumber}`;

    //! Generate AWS Signed URL for image to handle the upload functionality in the frontend
    const { uploadUrl: imageUploadUrl, fileKey: imageFileKey } =
      dummyUploadUrlGenerator(imageName, imageType);

    if (!imageUploadUrl || !imageFileKey) {
      return res.status(500).json({
        message:
          'Error generating upload URL for image, please try again later',
      });
    }

    //! Generate AWS Signed URL for video to handle the upload functionality in the frontend
    const { uploadUrl: videoUploadUrl, fileKey: videoFileKey } =
      dummyUploadUrlGenerator(videoName, videoType);

    if (!videoUploadUrl || !videoFileKey) {
      return res.status(500).json({
        message:
          'Error generating upload URL for video, please try again later',
      });
    }

    //! Create session
    const session = await prisma.session.create({
      data: {
        courseId,
        sessionNumber,
        title,
        duration,
        description,
        isFree,
        imageUrl: imageFileKey,
        videoUrl: videoFileKey,
        slug,
      },
    });

    return res.status(201).json({
      message: 'Session created successfully',
      data: { session, imageUploadUrl, videoUploadUrl },
    });
  } catch (error) {
    console.error('Error creating session', error);
    return res
      .status(500)
      .json({ message: 'Error creating session, please try again later' });
  }
};

const getAllSessions = async (req: Request, res: Response) => {
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

    const allSessions = await prisma.session.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: orderBy,
      },
    });

    return res
      .status(200)
      .json({
        message: 'Sessions fetched successfully',
        data: { allSessions },
      });
  } catch (error) {
    console.error('Error getting all sessions', error);
    return res
      .status(500)
      .json({ message: 'Error getting all sessions, please try again later' });
  }
};

const getSessionById = async (req: Request, res: Response) => {};

const getSessionBySlug = async (req: Request, res: Response) => {};

const getSessionsByCourseId = async (req: Request, res: Response) => {};

export {
  createSession,
  getAllSessions,
  getSessionById,
  getSessionBySlug,
  getSessionsByCourseId,
};
