import { Controller, Get, Post, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser } from '../auth/user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  async findByUser(@CurrentUser() user: { id: string }) {
    return this.ordersService.findByUser(user.id);
  }

  @Post()
  async create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(user.id, dto);
  }
}
