import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { S3Service } from '../../common/service/s3.service';
import BrandRepository from '../../DB/repository/brand.repository';
import { CreateBrandDto, UpdateBrandDto } from './brand.dto';
import { Types } from 'mongoose';

@Injectable()
export class BrandService {
  constructor(
    private readonly brandModel: BrandRepository,
    private readonly se3: S3Service,
  ) {}

  async createBrand(
    body: CreateBrandDto,
    file: Express.Multer.File,
    user: any,
  ) {
    try {
      const { name, slogan } = body;
      if (await this.brandModel.findOne({ filter: { name } })) {
        throw new ConflictException('Name Already Exist');
      }
      const logo = await this.se3.uploadFile({
        file,
        path: 'brands',
      });

      const brand = await this.brandModel.create({
        name,
        slogan,
        logo,
        createdBy: user._id,
      });

      if (!brand) {
        await this.se3.deleteFile(logo);
        throw new BadGatewayException('Fail To Create Brand');
      }

      return brand;
    } catch (error: any) {
      console.error('ERROR IN CREATE BRAND:', error);
      throw new BadRequestException(error.message || 'Unknown error occurred');
    }
  }

  async updateBrand(body: UpdateBrandDto, id: any, user: any) {
    try {
      const { name, slogan } = body;
      const brand = await this.brandModel.findById(id);
      if (!brand) {
        throw new NotFoundException('Brand Not Exist');
      }
      if (name && name === brand.name) {
        throw new ConflictException('You Cant Put The Same Old Name');
      }
      if (name && (await this.brandModel.findOne({ filter: { name } }))) {
        throw new ConflictException('Name Already Exist');
      }

      const newBrand = await this.brandModel.findOneAndUpdate({
        filter: { _id: brand._id },
        update: {
          ...(name ? { name } : undefined),
          ...(slogan ? { slogan } : undefined),
        },
      });
      return newBrand;
    } catch (error: any) {
      console.error('ERROR IN CREATE BRAND:', error);
      throw new BadRequestException(error.message || 'Unknown error occurred');
    }
  }

  async updateBrandLogo(id: string, file: Express.Multer.File) {
    const brand = await this.brandModel.findById(
      id as unknown as Types.ObjectId,
    );

    if (!brand || brand.deletedAt) {
      throw new NotFoundException('Brand Not Found');
    }

    const logo = await this.se3.uploadFile({
      file,
      path: 'brands',
    });

    try {
      const updatedBrand = await this.brandModel.findOneAndUpdate({
        filter: { _id: id },
        update: { logo },
      });

      await this.se3.deleteFile(brand.logo);

      return updatedBrand;
    } catch (error: any) {
      await this.se3.deleteFile(logo).catch(() => {});

      throw new BadRequestException(error.message);
    }
  }

  async getBrands(query: any) {
    const { page, limit, search } = query;

    const brands = await this.brandModel.pagination({
      page,
      limit,
      search: {
        deletedAt: { $exists: false },
        ...(search && {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { slogan: { $regex: search, $options: 'i' } },
          ],
        }),
      },
    });

    return brands;
  }

  async deleteBrand(params: any, user: any) {
    const { brandId } = params;

    const brand = await this.brandModel.findById(brandId);

    if (!brand || brand.deletedAt) {
      throw new NotFoundException('Brand Not Found');
    }

    await this.brandModel.findOneAndUpdate({
      filter: { _id: brandId },
      update: {
        deletedAt: new Date(),
        deletedBy: user._id,
      },
    });

    return {
      message: 'Brand Deleted Successfully',
    };
  }
}
