import { Request, Response } from 'express';
import categoryNameValidator from '../../validators/categoryName.validator.ts';
import courseCategoryHrefValidator from '../../validators/courseCategoryHref.validator.ts';
import { prisma } from 'services/db.service.ts';
import mongodbIdValidator from 'validators/mongodbId.validator.ts';

const createCourseCategory = async (req: Request, res: Response) => {
  try {
    //! Check if request body is provided
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is required' });
    }

    //! Get name and href from request body
    const { name: categoryNameRaw, href: categoryHrefRaw } = req.body;

    //! Validate category name
    const {
      success: categoryNameSuccess,
      data: categoryName,
      error: categoryNameError,
    } = categoryNameValidator('Category Name').safeParse(categoryNameRaw);

    if (!categoryNameSuccess) {
      return res
        .status(400)
        .json({ message: categoryNameError?.issues[0]?.message });
    }

    //! Validate category href
    const {
      success: categoryHrefSuccess,
      data: categoryHref,
      error: categoryHrefError,
    } = courseCategoryHrefValidator('Category Href').safeParse(categoryHrefRaw);

    if (!categoryHrefSuccess) {
      return res
        .status(400)
        .json({ message: categoryHrefError?.issues[0]?.message });
    }

    //! Check if category name is already taken
    const existingCategory = await prisma.courseCategory.findUnique({
      where: {
        name: categoryName,
      },
    });

    if (existingCategory) {
      return res
        .status(400)
        .json({ message: 'Category name is already taken' });
    }

    //! Check if category href is already taken
    const existingCategoryHref = await prisma.courseCategory.findUnique({
      where: {
        href: categoryHref,
      },
    });

    if (existingCategoryHref) {
      return res
        .status(400)
        .json({ message: 'Category href is already taken' });
    }

    //! Create course category
    const courseCategory = await prisma.courseCategory.create({
      data: {
        name: categoryName,
        href: categoryHref,
      },
    });

    return res.status(201).json({
      message: 'Course category created successfully',
      data: { category: courseCategory },
    });
  } catch (error) {
    console.error('Error creating course category', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const editCourseCategory = async (req: Request, res: Response) => {
  try {
    const { id: courseCategoryId } = req.params;

    //! Check if course category id is valid
    const { success: courseCategoryIdSuccess, error: courseCategoryIdError } =
      mongodbIdValidator('Course Category ID').safeParse(courseCategoryId);

    if (!courseCategoryIdSuccess) {
      return res
        .status(400)
        .json({ message: courseCategoryIdError?.issues[0]?.message });
    }

    //! Check if course category exists
    const existingCourseCategory = await prisma.courseCategory.findUnique({
      where: {
        id: courseCategoryId,
      },
    });

    if (!existingCourseCategory) {
      return res.status(400).json({ message: 'Course category not found' });
    }

    //! Check if request body is provided
    if (!req.body) {
      return res
        .status(400)
        .json({ message: 'New category name or href is required' });
    }

    //! Get name and href from request body
    const { name: newCategoryNameRaw, href: newCategoryHrefRaw } = req.body;

    //! Initialize new category name
    let newCategoryName: string;

    //! check if new category name is provided
    if (newCategoryNameRaw) {
      //! Validate new category name
      const {
        success: newCategoryNameSuccess,
        data: newCategoryNameResult,
        error: newCategoryNameError,
      } = categoryNameValidator('New Category Name').safeParse(
        newCategoryNameRaw
      );
      if (!newCategoryNameSuccess) {
        return res
          .status(400)
          .json({ message: newCategoryNameError?.issues[0]?.message });
      }
      newCategoryName = newCategoryNameResult;
    } else {
      newCategoryName = existingCourseCategory.name;
    }

    //! Initialize new category href
    let newCategoryHref: string;

    //! check if new category href is provided
    if (newCategoryHrefRaw) {
      //! Validate new category href
      const {
        success: newCategoryHrefSuccess,
        data: newCategoryHrefResult,
        error: newCategoryHrefError,
      } = courseCategoryHrefValidator('New Category Href').safeParse(
        newCategoryHrefRaw
      );
      if (!newCategoryHrefSuccess) {
        return res
          .status(400)
          .json({ message: newCategoryHrefError?.issues[0]?.message });
      }
      newCategoryHref = newCategoryHrefResult;
    } else {
      newCategoryHref = existingCourseCategory.href;
    }

    // //! Check if new category name or href is already taken
    const [existingCategoryName, existingCategoryHref] = await Promise.all([
      prisma.courseCategory.findUnique({
        where: { name: newCategoryName },
      }),
      prisma.courseCategory.findUnique({
        where: { href: newCategoryHref },
      }),
    ]);

    if (existingCategoryName && existingCategoryName.id !== courseCategoryId) {
      return res
        .status(400)
        .json({ message: 'New category name is already taken' });
    }

    if (existingCategoryHref && existingCategoryHref.id !== courseCategoryId) {
      return res
        .status(400)
        .json({ message: 'New category href is already taken' });
    }

    //! Update course category
    const updatedCourseCategory = await prisma.courseCategory.update({
      where: { id: courseCategoryId },
      data: {
        name: newCategoryName,
        href: newCategoryHref,
      },
    });

    if (!updatedCourseCategory) {
      return res
        .status(400)
        .json({ message: 'Failed to update course category, try again later' });
    }

    return res.status(200).json({
      message: 'Course category updated successfully',
      data: { category: updatedCourseCategory },
    });
  } catch (error) {
    console.error('Error editing course category', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllCourseCategories = async (req: Request, res: Response) => {
  try {
    const courseCategories = await prisma.courseCategory.findMany();
    return res.status(200).json({
      message: 'Course categories fetched successfully',
      data: { courseCategories },
    });
  } catch (error) {
    console.error('Error fetching course categories', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export { createCourseCategory, getAllCourseCategories, editCourseCategory };
