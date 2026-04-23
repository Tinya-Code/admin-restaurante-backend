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
  HttpStatus,
  HttpCode,
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
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth/firebase-auth.guard';
import { RestaurantMemberGuard } from '../../common/guards/restaurant-member/restaurant-member.guard';
import { ApiResponse } from '../../common/dto/api-response.dto/api-response.dto';
import { CurrentBranch } from '../../common/decorators/branch.decorator';
import { MenuResponseDto } from './dto/menu-response.dto';

@ApiTags('menus')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, RestaurantMemberGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo menú para la sucursal actual' })
  @SwaggerResponse({ status: 201, description: 'Menú creado', type: MenuResponseDto })
  @SwaggerResponse({ status: 409, description: 'Ya existe un menú con ese nombre en la sucursal' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @CurrentBranch() branchId: string,
    @Body() createMenuDto: CreateMenuDto,
  ) {
    const menu = await this.menusService.create(branchId, createMenuDto);
    return new ApiResponse(menu, 'Menú creado exitosamente');
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los menús de la sucursal actual' })
  @SwaggerResponse({ status: 200, description: 'Menús obtenidos', type: [MenuResponseDto] })
  async findAll(@CurrentBranch() branchId: string) {
    const menus = await this.menusService.findAll(branchId);
    return new ApiResponse(menus, 'Menús obtenidos exitosamente');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un menú por ID' })
  @ApiParam({ name: 'id', type: String })
  @SwaggerResponse({ status: 200, description: 'Menú obtenido', type: MenuResponseDto })
  @SwaggerResponse({ status: 404, description: 'Menú no encontrado en esta sucursal' })
  async findOne(
    @CurrentBranch() branchId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const menu = await this.menusService.findOne(branchId, id);
    return new ApiResponse(menu, 'Menú obtenido exitosamente');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un menú' })
  @ApiParam({ name: 'id', type: String })
  @SwaggerResponse({ status: 200, description: 'Menú actualizado', type: MenuResponseDto })
  @SwaggerResponse({ status: 404, description: 'Menú no encontrado en esta sucursal' })
  @SwaggerResponse({ status: 409, description: 'Ya existe un menú con ese nombre en la sucursal' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @CurrentBranch() branchId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    const menu = await this.menusService.update(branchId, id, updateMenuDto);
    return new ApiResponse(menu, 'Menú actualizado exitosamente');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un menú' })
  @ApiParam({ name: 'id', type: String })
  @SwaggerResponse({ status: 204, description: 'Menú eliminado' })
  @SwaggerResponse({ status: 404, description: 'Menú no encontrado en esta sucursal' })
  async remove(
    @CurrentBranch() branchId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    await this.menusService.remove(branchId, id);
  }
}
