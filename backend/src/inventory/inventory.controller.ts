import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { Roles } from '../auth/roles.decorator';

@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.create(dto);
  }

  @Get()
  async findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.inventoryService.findById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateInventoryItemDto) {
    return this.inventoryService.update(id, dto);
  }
}
