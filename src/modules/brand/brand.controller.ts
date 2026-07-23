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
import { BrandService } from './brand.service';
import { FileInterceptor } from '@nestjs/platform-express';
import multerCloud from '../../common/middleware/multer.cloud';
import { Store_Enum } from '../../common/enum/multer.enum';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { AuthorizationGuard } from '../../common/guards/authorization.guard';
import { RoleEnum } from '../../common/enum/user.enum';
import { CreateBrandDto, UpdateBrandDto } from './brand.dto';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.admin])
  @UseInterceptors(
    FileInterceptor('file', multerCloud({ storeType: Store_Enum.memory })),
  )
  createBrand(
    @Body() body: CreateBrandDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @Req() req: any,
  ) {
    const user = req.user;
    return this.brandService.createBrand(body, file, user);
  }
  @Patch(':id')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.admin])
  @UseInterceptors(
    FileInterceptor('file', multerCloud({ storeType: Store_Enum.memory })),
  )
  updateBrand(
    @Body() body: UpdateBrandDto,
    @Param() params: any,
    @Req() req: any,
  ) {
    const user = req.user;
    return this.brandService.updateBrand(body, params.id, user);
  }
  @Get()
  getBrands(@Query() query: any) {
    return this.brandService.getBrands(query);
  }
  @Delete(':brandId')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.admin])
  deleteBrand(@Param() params: any, @Req() req: any) {
    return this.brandService.deleteBrand(params, req.user);
  }
  @Patch(':id/logo')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.admin])
  @UseInterceptors(
    FileInterceptor('file', multerCloud({ storeType: Store_Enum.memory })),
  )
  updateBrandLogo(
    @Param() params: any,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ) {
    return this.brandService.updateBrandLogo(params.id, file);
  }
}
