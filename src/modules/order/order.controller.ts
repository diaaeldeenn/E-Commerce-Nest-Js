import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization.guard';
import { RoleEnum } from 'src/common/enum/user.enum';
import { CreateCashOrderDto } from './order.dto';
import { Types } from 'mongoose';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/cash')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.user])
  createCashOrder(@Body() body: CreateCashOrderDto, @Req() req: any) {
    return this.orderService.createCashOrder(body, req.user);
  }

  @Post('stripe/:id')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.user])
  createCardOrder(@Param('id') id: Types.ObjectId, @Req() req: any) {
    return this.orderService.createCardOrder(id, req.user);
  }

  @SkipThrottle()
  @Post('webhook')
  async webhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
  ) {
    return this.orderService.webhook(req.rawBody, signature);
  }

  @Post('refund/:id')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.user])
  refundOrderPayment(@Param('id') id: Types.ObjectId, @Req() req: any) {
    return this.orderService.refundOrderPayment(id, req.user);
  }
  @Get('my-orders')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.user])
  getMyOrders(@Req() req: any) {
    return this.orderService.getMyOrders(req.user);
  }

  @Get()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.admin])
  getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @Get(':id')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.user, RoleEnum.admin])
  getOrderById(@Param('id') id: Types.ObjectId, @Req() req: any) {
    return this.orderService.getOrderById(id, req.user);
  }

  @Patch('cancel/:id')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @SetMetadata('Roles_Enum', [RoleEnum.user])
  cancelOrder(@Param('id') id: Types.ObjectId, @Req() req: any) {
    return this.orderService.cancelOrder(id, req.user);
  }
}
