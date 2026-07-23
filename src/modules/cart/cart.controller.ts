import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Delete,
  Param,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { AuthorizationGuard } from '../../common/guards/authorization.guard';
import { RoleEnum } from '../../common/enum/user.enum';
import { AddToCartDto, UpdateCartQuantityDto } from './cart.dto';

@Controller('cart')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@SetMetadata('Roles_Enum', [RoleEnum.user])
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addToCart(@Body() body: AddToCartDto, @Req() req: any) {
    return this.cartService.addToCart(body, req.user);
  }

  @Get()
  getCart(@Req() req: any) {
    return this.cartService.getCart(req.user);
  }

  @Patch('quantity')
  updateQuantity(@Body() body: UpdateCartQuantityDto, @Req() req: any) {
    return this.cartService.updateQuantity(body, req.user);
  }
  @Patch('increase/:productId')
  increaseQuantity(@Param() params: any, @Req() req: any) {
    return this.cartService.increaseQuantity(params, req.user);
  }

  @Patch('decrease/:productId')
  decreaseQuantity(@Param() params: any, @Req() req: any) {
    return this.cartService.decreaseQuantity(params, req.user);
  }

  @Delete(':productId')
  removeProduct(@Param() params: any, @Req() req: any) {
    return this.cartService.removeProduct(params, req.user);
  }

  @Delete()
  clearCart(@Req() req: any) {
    return this.cartService.clearCart(req.user);
  }
}
