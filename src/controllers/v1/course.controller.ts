import { Request, Response } from 'express';
import { prisma } from 'services/db.service.ts';
import titleNameValidator from 'validators/categoryName.validator.ts';
import descriptionValidator from 'validators/description.validator.ts';
import fileNameValidator from 'validators/fileName.validator.ts';
import fileTypeValidator from 'validators/fileType.validator.ts';
import mongodbIdValidator from 'validators/mongodbId.validator.ts';

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
      discount: rawDiscount,
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
    const { success: coverNameSuccess, data: coverName, error: coverNameError } = fileNameValidator('Course cover name').safeParse(rawCoverName);

    if (!coverNameSuccess) {
      return res
        .status(400)
        .json({ message: coverNameError?.issues[0]?.message });
    }
    
    //! Validate coverType
    const { success: coverTypeSuccess, data: coverType, error: coverTypeError } = fileTypeValidator('Course cover type', 'image').safeParse(rawCoverType);

    if (!coverTypeSuccess) {
      return res
        .status(400)
        .json({ message: coverTypeError?.issues[0]?.message });
    }
    
    res.json({ message: 'Course created successfully', data: { coverName, coverType } });
  } catch (error) {
    console.error('Error creating course', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export { createCourse };
