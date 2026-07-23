import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { AuthorizationGuard } from '../../common/guards/authorization.guard';
import { RoleEnum } from '../../common/enum/user.enum';
import { ApplyCouponDto, CreateCouponDto, UpdateCouponDto } from './coupon.dto';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.admin])
  createCoupon(@Body() body: CreateCouponDto, @Req() req: any) {
    return this.couponService.createCoupon(body, req.user);
  }

  @Patch(':couponId')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.admin])
  updateCoupon(
    @Param('couponId') couponId: string,
    @Body() body: UpdateCouponDto,
  ) {
    return this.couponService.updateCoupon(couponId, body);
  }

  @Get()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.admin])
  getCoupons() {
    return this.couponService.getCoupons();
  }

  @Delete(':couponId')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.admin])
  deleteCoupon(@Param('couponId') couponId: string, @Req() req: any) {
    return this.couponService.deleteCoupon(couponId, req.user);
  }

  @Post('apply')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.user])
  applyCoupon(@Body() body: ApplyCouponDto, @Req() req: any) {
    return this.couponService.applyCoupon(body, req.user);
  }
}
