import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('examples')
export class ExamplesController {
  
  @Get('public')
  getPublicData() {
    return { message: 'This is public data, no authentication required' };
  }

  @Get('protected')
  @UseGuards(JwtAuthGuard)
  getProtectedData(@Req() req) {
    return { 
      message: 'This is protected data',
      user: req.user
    };
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  createItem(@Body() data: any, @Req() req) {
    return {
      message: 'Item created',
      createdBy: req.user.email,
      data: data
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  updateItem(@Param('id') id: string, @Body() data: any, @Req() req) {
    return {
      message: 'Item updated',
      id: id,
      updatedBy: req.user.email,
      data: data
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteItem(@Param('id') id: string, @Req() req) {
    return {
      message: 'Item deleted',
      id: id,
      deletedBy: req.user.email
    };
  }

  @Get('user-info')
  @UseGuards(JwtAuthGuard)
  getUserInfo(@Req() req) {
    return {
      userId: req.user.userId,
      email: req.user.email,
      message: 'You can access user ID and email from req.user'
    };
  }
}
