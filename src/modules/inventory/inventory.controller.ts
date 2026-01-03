import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Logger } from '@nestjs/common';
import { INVENTORY_PATTERNS, INVENTORY_EVENTS } from '../../messaging';

@Controller()
export class InventoryController {
  private readonly logger = new Logger(InventoryController.name);

  constructor(private readonly inventoryService: InventoryService) {}

  @MessagePattern(INVENTORY_PATTERNS.CREATE)
  async create(@Payload() createInventoryDto: CreateInventoryDto) {
    this.logger.log(`Received message pattern: ${INVENTORY_PATTERNS.CREATE}`);
    return this.inventoryService.create(createInventoryDto);
  }

  @EventPattern(INVENTORY_EVENTS.CREATED)
  async createFromCatalog(@Payload() createInventoryDto: CreateInventoryDto) {
    this.logger.log(`Received event: ${INVENTORY_EVENTS.CREATED}`);
    
    try {
      const result = await this.inventoryService.create(createInventoryDto);
      this.logger.log(`Inventory created from event: ${result.data?.sku || 'unknown'}`);
    } catch (error) {
      this.logger.error('Error creating inventory from catalog event', error.stack);
      // Don't throw for events - they are fire-and-forget
    }
  }

  @MessagePattern(INVENTORY_PATTERNS.FIND_ALL)
  findAll() {
    this.logger.log(`Received message pattern: ${INVENTORY_PATTERNS.FIND_ALL}`);
    return this.inventoryService.findAll();
  }

  @MessagePattern(INVENTORY_PATTERNS.FIND_ONE)
  findOne(@Payload() payload: any) {
    const id = payload.id || payload;
    this.logger.log(`Received message pattern: ${INVENTORY_PATTERNS.FIND_ONE} for ID: ${id}`);
    return this.inventoryService.findOne(id);
  }

  @MessagePattern(INVENTORY_PATTERNS.UPDATE)
  update(@Payload() payload: any) {
    const id = payload.id || payload.params?.id;
    this.logger.log(`Received message pattern: ${INVENTORY_PATTERNS.UPDATE} for ID: ${id}`);
    return this.inventoryService.update(id, payload.body || payload);
  }

  @MessagePattern(INVENTORY_PATTERNS.REMOVE)
  remove(@Payload() payload: any) {
    const id = payload.id || payload;
    this.logger.log(`Received message pattern: ${INVENTORY_PATTERNS.REMOVE} for ID: ${id}`);
    return this.inventoryService.remove(id);
  }
}
