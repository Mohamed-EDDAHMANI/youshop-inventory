import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @MessagePattern('createInventory')
  create(@Payload() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @MessagePattern('findAllInventory')
  findAll() {
    return this.inventoryService.findAll();
  }

  @MessagePattern('findOneInventory')
  findOne(@Payload() id: number) {
    return this.inventoryService.findOne(id);
  }

  @MessagePattern('updateInventory')
  update(@Payload() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.update(updateInventoryDto.id, updateInventoryDto);
  }

  @MessagePattern('removeInventory')
  remove(@Payload() id: number) {
    return this.inventoryService.remove(id);
  }
}
