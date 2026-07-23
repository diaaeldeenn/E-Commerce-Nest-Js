import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  Req,
  SetMetadata,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import multerCloud from '../../common/middleware/multer.cloud';
import { Store_Enum } from '../../common/enum/multer.enum';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { AuthorizationGuard } from '../../common/guards/authorization.guard';
import { RoleEnum } from '../../common/enum/user.enum';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { ProductService } from './product.service';
import { Types } from 'mongoose';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.admin])
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 5 },
      ],
      multerCloud({ storeType: Store_Enum.memory }),
    ),
  )
  createProduct(
    @Body() body: CreateProductDto,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    files: {
      mainImage?: Express.Multer.File[];
      subImages?: Express.Multer.File[];
    },
    @Req() req: any,
  ) {
    return this.productService.createProduct(body, files, req.user);
  }

  @Patch(':id')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.admin])
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 5 },
      ],
      multerCloud({ storeType: Store_Enum.memory }),
    ),
  )
  updateProduct(
    @Body() body: UpdateProductDto,
    @UploadedFiles()
    files: {
      mainImage?: Express.Multer.File[];
      subImages?: Express.Multer.File[];
    },
    @Param() params: any,
    @Req() req: any,
  ) {
    return this.productService.updateProduct(body, files, params.id, req.user);
  }
  @Get()
  getProducts(@Query() query: any) {
    return this.productService.getProducts(query);
  }

  @Delete(':productId')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.admin])
  deleteProduct(@Param() params: any, @Req() req: any) {
    return this.productService.deleteProduct(params, req.user);
  }

  @Post('/wishList/:id')
  @UseGuards(AuthenticationGuard)
  addToWishlist(@Param('id') id: Types.ObjectId, @Req() req: any) {
    return this.productService.addToWishlist(id, req.user);
  }
}
