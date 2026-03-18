import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/common/guards/firebase-auth/firebase-auth.guard';
import { RestaurantOwnerGuard } from 'src/common/guards/restaurant-owner/restaurant-owner.guard';
import { ApiResponse } from 'src/common/dto/api-response.dto/api-response.dto';
import { CurrentRestaurant } from 'src/common/decorators/restaurant.decorator';

@ApiTags('Menus')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, RestaurantOwnerGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @ApiHeader({
    name: 'x-restaurant-id',
    required: false,
    description: 'ID de restaurante opcional para sobrescribir el contexto automático',
  })
  @ApiOperation({ summary: 'Crear un nuevo menú' })
  @SwaggerResponse({ status: 201, description: 'Menú creado' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @CurrentRestaurant() restaurantId: string,
    @Body() createMenuDto: CreateMenuDto,
  ) {
    const menu = await this.menusService.create(restaurantId, createMenuDto);
    return new ApiResponse(menu, 'Menú creado exitosamente');
  }

  @Get()
  @ApiHeader({
    name: 'x-restaurant-id',
    required: false,
    description: 'ID de restaurante opcional',
  })
  @ApiOperation({ summary: 'Listar menús' })
  async findAll(@CurrentRestaurant() restaurantId: string) {
    const menus = await this.menusService.findAll(restaurantId);
    return new ApiResponse(menus, 'Menús obtenidos exitosamente');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un menú por ID' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const menu = await this.menusService.findOne(id);
    return new ApiResponse(menu, 'Menú obtenido exitosamente');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un menú' })
  @ApiParam({ name: 'id', type: String })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    const menu = await this.menusService.update(id, updateMenuDto);
    return new ApiResponse(menu, 'Menú actualizado exitosamente');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un menú' })
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.menusService.remove(id);
    return new ApiResponse(null, 'Menú eliminado exitosamente');
  }
}
