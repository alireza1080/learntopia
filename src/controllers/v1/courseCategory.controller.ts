import { Request, Response } from 'express';
import categoryNameValidator from '../../validators/categoryName.validator.ts';
import slugValidator from '../../validators/slug.validator.ts';
import { prisma } from 'services/db.service.ts';
import mongodbIdValidator from 'validators/mongodbId.validator.ts';

const createCourseCategory = async (req: Request, res: Response) => {
  try {
    //! Check if request body is provided
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is required' });
    }

    //! Get name and href from request body
    const { name: categoryNameRaw, slug: categorySlugRaw } = req.body;

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

    //! Validate category slug
    const {
      success: categorySlugSuccess,
      data: categorySlug,
      error: categorySlugError,
    } = slugValidator('Category Slug').safeParse(categorySlugRaw);

    if (!categorySlugSuccess) {
      return res
        .status(400)
        .json({ message: categorySlugError?.issues[0]?.message });
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

    //! Check if category slug is already taken
    const existingCategorySlug = await prisma.courseCategory.findUnique({
      where: {
        slug: categorySlug,
      },
    });

    if (existingCategorySlug) {
      return res
        .status(400)
        .json({ message: 'Category slug is already taken' });
    }

    //! Create course category
    const courseCategory = await prisma.courseCategory.create({
      data: {
        name: categoryName,
        slug: categorySlug,
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
    const { name: newCategoryNameRaw, slug: newCategorySlugRaw } = req.body;

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
    let newCategorySlug: string;

    //! check if new category href is provided
    if (newCategorySlugRaw) {
      //! Validate new category href
      const {
        success: newCategorySlugSuccess,
        data: newCategorySlugResult,
        error: newCategorySlugError,
      } = slugValidator('New Category Slug').safeParse(newCategorySlugRaw);
      if (!newCategorySlugSuccess) {
        return res
          .status(400)
          .json({ message: newCategorySlugError?.issues[0]?.message });
      }
      newCategorySlug = newCategorySlugResult;
    } else {
      newCategorySlug = existingCourseCategory.slug;
    }

    // //! Check if new category name or href is already taken
    const [existingCategoryName, existingCategorySlug] = await Promise.all([
      prisma.courseCategory.findUnique({
        where: { name: newCategoryName },
      }),
      prisma.courseCategory.findUnique({
        where: { slug: newCategorySlug },
      }),
    ]);

    if (existingCategoryName && existingCategoryName.id !== courseCategoryId) {
      return res
        .status(400)
        .json({ message: 'New category name is already taken' });
    }

    if (existingCategorySlug && existingCategorySlug.id !== courseCategoryId) {
      return res
        .status(400)
        .json({ message: 'New category slug is already taken' });
    }

    //! Update course category
    const updatedCourseCategory = await prisma.courseCategory.update({
      where: { id: courseCategoryId },
      data: {
        name: newCategoryName,
        slug: newCategorySlug,
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

const deleteCourseCategory = async (req: Request, res: Response) => {
  //! To delete a course category, we need to make sure that no course is associated with it
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

export {
  createCourseCategory,
  getAllCourseCategories,
  editCourseCategory,
  deleteCourseCategory,
};
