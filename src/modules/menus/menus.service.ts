import { Injectable } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
  async create(restaurantId: string, createMenuDto: CreateMenuDto) {
    return `This action adds a new menu for restaurant #${restaurantId}`;
  }

  async findAll(restaurantId: string) {
    return `This action returns all menus for restaurant #${restaurantId}`;
  }

  findOne(id: string) {
    return `This action returns a #${id} menu`;
  }

  update(id: string, updateMenuDto: UpdateMenuDto) {
    return `This action updates a #${id} menu`;
  }

  remove(id: string) {
    return `This action removes a #${id} menu`;
  }
}
