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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multerCloud from '../../common/middleware/multer.cloud';
import { Store_Enum } from '../../common/enum/multer.enum';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { AuthorizationGuard } from '../../common/guards/authorization.guard';
import { RoleEnum } from '../../common/enum/user.enum';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.admin])
  @UseInterceptors(
    FileInterceptor('file', multerCloud({ storeType: Store_Enum.memory })),
  )
  createCategory(
    @Body() body: CreateCategoryDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.categoryService.createCategory(body, file, req.user);
  }

  @Patch(':id')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.admin])
  @UseInterceptors(
    FileInterceptor('file', multerCloud({ storeType: Store_Enum.memory })),
  )
  updateCategory(
    @Body() body: UpdateCategoryDto,
    @Param() params: any,
    @Req() req: any,
  ) {
    return this.categoryService.updateCategory(body, params.id, req.user);
  }

  @Get()
  getCategories(@Query() query: any) {
    return this.categoryService.getCategories(query);
  }

  @Delete(':categoryId')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.admin])
  deleteCategory(@Param() params: any, @Req() req: any) {
    return this.categoryService.deleteCategory(params, req.user);
  }
  @Patch(':id/image')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.admin])
  @UseInterceptors(
    FileInterceptor('file', multerCloud({ storeType: Store_Enum.memory })),
  )
  updateCategoryImage(
    @Param() params: any,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ) {
    return this.categoryService.updateCategoryImage(params.id, file);
  }
}
