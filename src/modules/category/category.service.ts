import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { S3Service } from 'src/common/service/s3.service';
import BrandRepository from 'src/DB/repository/brand.repository';
import CategoryRepository from 'src/DB/repository/category.repository';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { Types } from 'mongoose';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryModel: CategoryRepository,
    private readonly brandRepo: BrandRepository,
    private readonly s3Service: S3Service,
  ) {}

  
  async createCategory(
    body: CreateCategoryDto,
    file: Express.Multer.File,
    user: any,
  ) {
    const { name, brands } = body;

    if (
      await this.categoryModel.findOne({
        filter: {
          name,
          deletedAt: { $exists: false },
        },
      })
    ) {
      throw new ConflictException('Name already exists');
    }

    const strictIds = [...new Set(brands ?? [])].map((id) =>
      Types.ObjectId.createFromHexString(id),
    );

    if (strictIds.length > 0) {
      const foundBrands = await this.brandRepo.find({
        filter: {
          _id: { $in: strictIds },
          deletedAt: { $exists: false },
        },
      });

      if (foundBrands.length !== strictIds.length) {
        throw new NotFoundException('Some brand IDs not found');
      }
    }

    let image: string | undefined;

    try {
      image = await this.s3Service.uploadFile({
        file,
        path: 'category',
      });

      const category = await this.categoryModel.create({
        name,
        brands: strictIds,
        image,
        createdBy: user._id,
      });

      return category;
    } catch (error: any) {
      if (image) {
        await this.s3Service.deleteFile(image).catch(() => {});
      }

      throw new BadRequestException(error.message || 'Error creating category');
    }
  }


  async updateCategory(body: UpdateCategoryDto, id: string, user: any) {
    const { name, brands } = body;

    const category = await this.categoryModel.findById(
      id as unknown as Types.ObjectId,
    );

    if (!category || category.deletedAt) {
      throw new NotFoundException('Category Not Found');
    }

    if (name && name === category.name) {
      throw new ConflictException('You Cant Put The Same Old Name');
    }

    if (
      name &&
      (await this.categoryModel.findOne({
        filter: {
          name,
          deletedAt: { $exists: false },
        },
      }))
    ) {
      throw new ConflictException('Name Already Exist');
    }

    let strictIds: Types.ObjectId[] | undefined;

    if (brands) {
      strictIds = [...new Set(brands)].map((id) =>
        Types.ObjectId.createFromHexString(id),
      );

      const foundBrands = await this.brandRepo.find({
        filter: {
          _id: { $in: strictIds },
          deletedAt: { $exists: false },
        },
      });

      if (foundBrands.length !== strictIds.length) {
        throw new NotFoundException('Some Brand IDs Not Found');
      }
    }

    return await this.categoryModel.findOneAndUpdate({
      filter: { _id: id },
      update: {
        ...(name ? { name } : {}),
        ...(strictIds ? { brands: strictIds } : {}),
        updatedBy: user._id,
      },
    });
  }

  async updateCategoryImage(id: string, file: Express.Multer.File) {
    const category = await this.categoryModel.findById(
      id as unknown as Types.ObjectId,
    );

    if (!category || category.deletedAt) {
      throw new NotFoundException('Category Not Found');
    }

    const image = await this.s3Service.uploadFile({
      file,
      path: 'category',
    });

    try {
      const updatedCategory = await this.categoryModel.findOneAndUpdate({
        filter: { _id: id },
        update: { image },
      });

      await this.s3Service.deleteFile(category.image);

      return updatedCategory;
    } catch (error: any) {
      await this.s3Service.deleteFile(image).catch(() => {});

      throw new BadRequestException(error.message);
    }
  }

  async getCategories(query: any) {
    const { page, limit, search } = query;

    return await this.categoryModel.pagination({
      page,
      limit,
      search: {
        deletedAt: { $exists: false },
        ...(search && {
          $or: [{ name: { $regex: search, $options: 'i' } }],
        }),
      },
      populate: [
        {
          path: 'brands',
          select: 'name slug logo',
        },
      ],
    });
  }

  async deleteCategory(params: any, user: any) {
    const { categoryId } = params;

    const category = await this.categoryModel.findById(categoryId);

    if (!category || category.deletedAt) {
      throw new NotFoundException('Category Not Found');
    }

    await this.categoryModel.findOneAndUpdate({
      filter: { _id: categoryId },
      update: {
        deletedAt: new Date(),
        deletedBy: user._id,
      },
    });

    return {
      message: 'Category Deleted Successfully',
    };
  }
}
