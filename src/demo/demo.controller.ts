import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UsePipes,
  UseFilters,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { TrimPipe } from '../common/pipes/trim.pipe';
import { ParseIntPipeCustom } from '../common/pipes/parse-int-custom.pipe';
import { BadRequestExceptionFilter } from '../common/filters/bad-request-exception.filter';
import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  quantity: number;
}

@Controller('demo')
export class DemoController {
  @Get('parameter-pipe/:id')
  getWithParameterPipe(@Param('id', ParseIntPipe) id: number) {
    return { id, level: 'parameter-level pipe binding' };
  }

  @Get('custom-parameter-pipe/:id')
  getWithCustomParameterPipe(@Param('id', ParseIntPipeCustom) id: number) {
    return { id, level: 'parameter-level custom pipe binding' };
  }

  @Post('method-pipe')
  @UsePipes(new ValidationPipe({ transform: true }))
  createWithMethodPipe(@Body() createItemDto: CreateItemDto) {
    return { data: createItemDto, level: 'method-level pipe binding' };
  }

  @Post('body-trim-pipe')
  createWithBodyTrimPipe(@Body(TrimPipe) createItemDto: CreateItemDto) {
    return { data: createItemDto, level: 'parameter-level trim pipe' };
  }

  @Get('query-pipe')
  getWithQueryPipe(@Query('page', ParseIntPipe) page: number) {
    return { page, level: 'query parameter pipe binding' };
  }

  @Post('multiple-pipes')
  @UsePipes(TrimPipe, new ValidationPipe({ transform: true }))
  createWithMultiplePipes(@Body() createItemDto: CreateItemDto) {
    return { data: createItemDto, level: 'multiple pipes at method level' };
  }

  @Get('filter-demo')
  @UseFilters(BadRequestExceptionFilter)
  throwError() {
    throw new Error('This is a demo error with custom filter');
  }
}
