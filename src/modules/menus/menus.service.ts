import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenusRepository } from './menus.repository';

@Injectable()
export class MenusService {
  constructor(private readonly menusRepository: MenusRepository) {}

  async create(branchId: string, createMenuDto: CreateMenuDto) {
    try {
      return await this.menusRepository.create(branchId, createMenuDto);
    } catch (err: any) {
      if (err?.code === '23505') {
        throw new ConflictException(
          `Ya existe un menú con el nombre "${createMenuDto.name}" en esta sucursal.`,
        );
      }
      throw err;
    }
  }

  async findAll(branchId: string) {
    return this.menusRepository.findAllByBranch(branchId);
  }

  async findOne(branchId: string, id: string) {
    const menu = await this.menusRepository.findByIdAndBranch(id, branchId);
    if (!menu) {
      throw new NotFoundException(
        `Menú con ID ${id} no encontrado en esta sucursal.`,
      );
    }
    return menu;
  }

  async update(branchId: string, id: string, updateMenuDto: UpdateMenuDto) {
    await this.findOne(branchId, id);
    try {
      return await this.menusRepository.update(id, updateMenuDto);
    } catch (err: any) {
      if (err?.code === '23505') {
        throw new ConflictException(
          'Ya existe un menú con ese nombre en esta sucursal.',
        );
      }
      throw err;
    }
  }

  async remove(branchId: string, id: string) {
    await this.findOne(branchId, id);
    return this.menusRepository.delete(id);
  }
}
