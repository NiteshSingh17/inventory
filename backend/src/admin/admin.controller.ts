import { Controller, Get, Param } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AdminService } from './admin.service';
import { Roles } from '../auth/roles.decorator';

@Controller('admin/reports')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('inventory/:id')
  @Roles(UserRole.ADMIN)
  async getInventoryReport(@Param('id') id: string) {
    return this.adminService.getInventoryReport(id);
  }
}
