import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { S3Service } from '../../common/service/s3.service';
import ProductRepository from '../../DB/repository/product.repository';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import BrandRepository from '../../DB/repository/brand.repository';
import CategoryRepository from '../../DB/repository/category.repository';
import { Types } from 'mongoose';
import UserRepository from '../../DB/repository/user.repository';

@Injectable()
export class ProductService {
  constructor(
    private readonly productModel: ProductRepository,
    private readonly userModel: UserRepository,
    private readonly s3Service: S3Service,
    private readonly brandModel: BrandRepository,
    private readonly categoryModel: CategoryRepository,
  ) {}

  async createProduct(
    body: CreateProductDto,
    files: {
      mainImage?: Express.Multer.File[];
      subImages?: Express.Multer.File[];
    },
    user: any,
  ) {
    const { name, description, price, discount, stock, brandId, categoryId } =
      body;

    if (
      await this.productModel.findOne({
        filter: {
          name,
          deletedAt: { $exists: false },
        },
      })
    ) {
      throw new ConflictException('Name Already Exist');
    }

    const brandObjectId = Types.ObjectId.createFromHexString(brandId);
    const brand = await this.brandModel.findById(brandObjectId);

    if (!brand || brand.deletedAt) {
      throw new NotFoundException('Brand Not Found');
    }

    const categoryObjectId = Types.ObjectId.createFromHexString(categoryId);
    const category = await this.categoryModel.findById(categoryObjectId);

    if (!category || category.deletedAt) {
      throw new NotFoundException('Category Not Found');
    }

    if (!files?.mainImage?.length) {
      throw new BadRequestException('Main Image Is Required');
    }

    let mainImage = '';
    const subImages: string[] = [];

    try {
      mainImage = await this.s3Service.uploadFile({
        file: files.mainImage[0],
        path: 'products/main',
      });

      if (files.subImages?.length) {
        for (const file of files.subImages) {
          const image = await this.s3Service.uploadFile({
            file,
            path: 'products/sub',
          });

          subImages.push(image);
        }
      }

      const product = await this.productModel.create({
        name,
        description,
        price,
        discount: discount ?? 0,
        stock,
        brandId: brandObjectId,
        categoryId: categoryObjectId,
        mainImage,
        subImages,
        createdBy: user._id,
      });

      return product;
    } catch (error: any) {
      if (mainImage) {
        await this.s3Service.deleteFile(mainImage).catch(() => {});
      }

      if (subImages.length) {
        await Promise.all(
          subImages.map((image) =>
            this.s3Service.deleteFile(image).catch(() => {}),
          ),
        );
      }

      throw new BadRequestException(error.message || 'Error Creating Product');
    }
  }
  async updateProduct(
    body: UpdateProductDto,
    files: {
      mainImage?: Express.Multer.File[];
      subImages?: Express.Multer.File[];
    },
    id: string,
    user: any,
  ) {
    const { name, description, price, discount, stock, brandId, categoryId } =
      body;

    const productObjectId = Types.ObjectId.createFromHexString(id);

    const product = await this.productModel.findById(productObjectId);

    if (!product || product.deletedAt) {
      throw new NotFoundException('Product Not Found');
    }

    if (name && name === product.name) {
      throw new ConflictException('You Cant Put The Same Old Name');
    }

    if (
      name &&
      (await this.productModel.findOne({
        filter: {
          name,
          deletedAt: { $exists: false },
        },
      }))
    ) {
      throw new ConflictException('Name Already Exist');
    }

    let brandObjectId: Types.ObjectId | undefined;
    if (brandId) {
      brandObjectId = Types.ObjectId.createFromHexString(brandId);
      const brand = await this.brandModel.findById(brandObjectId);

      if (!brand || brand.deletedAt) {
        throw new NotFoundException('Brand Not Found');
      }
    }

    let categoryObjectId: Types.ObjectId | undefined;
    if (categoryId) {
      categoryObjectId = Types.ObjectId.createFromHexString(categoryId);
      const category = await this.categoryModel.findById(categoryObjectId);

      if (!category || category.deletedAt) {
        throw new NotFoundException('Category Not Found');
      }
    }

    let newMainImage: string | undefined;
    let newSubImages: string[] = [];

    try {
      if (files.mainImage?.length) {
        newMainImage = await this.s3Service.uploadFile({
          file: files.mainImage[0],
          path: 'products/main',
        });
      }

      if (files.subImages?.length) {
        for (const file of files.subImages) {
          const image = await this.s3Service.uploadFile({
            file,
            path: 'products/sub',
          });

          newSubImages.push(image);
        }
      }

      const updatedProduct = await this.productModel.findOneAndUpdate({
        filter: { _id: id },
        update: {
          ...(name && { name }),
          ...(description && { description }),
          ...(price !== undefined && { price }),
          ...(discount !== undefined && { discount }),
          ...(stock !== undefined && { stock }),
          ...(brandId && { brandId: brandObjectId }),
          ...(categoryId && { categoryId: categoryObjectId }),
          ...(newMainImage && { mainImage: newMainImage }),
          ...(newSubImages.length && { subImages: newSubImages }),
          updatedBy: user._id,
        },
      });

      if (!updatedProduct) {
        throw new BadGatewayException('Fail To Update Product');
      }

      if (newMainImage) {
        await this.s3Service.deleteFile(product.mainImage).catch(() => {});
      }

      if (newSubImages.length) {
        await Promise.all(
          product.subImages.map((image) =>
            this.s3Service.deleteFile(image).catch(() => {}),
          ),
        );
      }

      return updatedProduct;
    } catch (error: any) {
      if (newMainImage) {
        await this.s3Service.deleteFile(newMainImage).catch(() => {});
      }

      if (newSubImages.length) {
        await Promise.all(
          newSubImages.map((image) =>
            this.s3Service.deleteFile(image).catch(() => {}),
          ),
        );
      }

      throw new BadRequestException(error.message || 'Error Updating Product');
    }
  }
  async getProducts(query: any) {
    const { page, limit, search } = query;

    const products = await this.productModel.pagination({
      page,
      limit,
      search: {
        deletedAt: { $exists: false },
        ...(search && {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        }),
      },
      populate: [
        {
          path: 'brandId',
          select: 'name slug logo',
        },
        {
          path: 'categoryId',
          select: 'name slug image',
        },
      ],
    });

    return products;
  }
  async deleteProduct(params: any, user: any) {
    const { productId } = params;

    const product = await this.productModel.findById(productId);

    if (!product || product.deletedAt) {
      throw new NotFoundException('Product Not Found');
    }

    await this.productModel.findOneAndUpdate({
      filter: { _id: productId },
      update: {
        deletedAt: new Date(),
        deletedBy: user._id,
      },
    });

    return {
      message: 'Product Deleted Successfully',
    };
  }
  async addToWishlist(id: Types.ObjectId, user: any) {
    const product = await this.productModel.findById(id);

    if (!product || product.deletedAt) {
      throw new NotFoundException('Product Not Found');
    }

    const removed = await this.userModel.findOneAndUpdate({
      filter: {
        _id: user._id,
        wishList: { $in: [id] },
      },
      update: {
        $pull: {
          wishList: id,
        },
      },
    });

    if (removed) {
      return {
        message: 'Removed from wishlist',
      };
    }

    await this.userModel.findOneAndUpdate({
      filter: {
        _id: user._id,
      },
      update: {
        $addToSet: {
          wishList: id,
        },
      },
    });

    return {
      message: 'Added to wishlist',
    };
  }
}
