import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth/firebase-auth.guard';
import { CategoryTypesService } from './category-types.service';
import { CategoryTypeResponseDto } from './dto/category-type-response.dto';
import { ApiResponse } from '../../common/dto/api-response.dto/api-response.dto';

@ApiTags('category-types')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('category-types')
export class CategoryTypesController {
  constructor(private readonly categoryTypesService: CategoryTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available category types (catalog)' })
  @SwaggerResponse({ 
    status: 200, 
    description: 'List of category types obtained successfully',
    type: [CategoryTypeResponseDto] 
  })
  async findAll() {
    const types = await this.categoryTypesService.findAll();
    return new ApiResponse(types, 'Catálogo de tipos de categoría obtenido');
  }
}
