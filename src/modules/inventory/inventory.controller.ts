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
    const id = payload?.params?.id;
    this.logger.log(`Received message pattern: ${INVENTORY_PATTERNS.FIND_ONE} for ID: ${id}`);
    return this.inventoryService.findOne(id);
  }

  @MessagePattern(INVENTORY_PATTERNS.UPDATE)
  async update(@Payload() payload: any) {
    const id = payload.id || payload.params?.id;
    this.logger.log(`Received message pattern: ${INVENTORY_PATTERNS.UPDATE} for ID: ${id}`);
    
    try {
      return await this.inventoryService.update(id, payload.body || payload);
    } catch (error) {
      this.logger.error(`Error in update: ${error.message}`);
      throw error;
    }
  }

  @MessagePattern(INVENTORY_PATTERNS.REMOVE)
  remove(@Payload() payload: any) {
    const id = payload.params?.id || payload;
    this.logger.log(`Received message pattern: ${INVENTORY_PATTERNS.REMOVE} for ID: ${id}`);
    return this.inventoryService.remove(id);
  }

  @MessagePattern(INVENTORY_PATTERNS.FIND_BY_SKU)
  findBySku(@Payload() payload: any) {
    const sku = payload?.sku || payload?.params?.sku || payload;
    this.logger.log(`Received message pattern: ${INVENTORY_PATTERNS.FIND_BY_SKU} for SKU: ${sku}`);
    return this.inventoryService.findBySku(sku);
  }

  @MessagePattern(INVENTORY_PATTERNS.RESERVE)
  reserve(@Payload() payload: any) {
    this.logger.log(`Received message pattern: ${INVENTORY_PATTERNS.RESERVE}`);
    return this.inventoryService.reserve(payload);
  }

  @MessagePattern(INVENTORY_PATTERNS.RELEASE)
  release(@Payload() payload: any) {
    this.logger.log(`Received message pattern: ${INVENTORY_PATTERNS.RELEASE}`);
    return this.inventoryService.release(payload);
  }

  @MessagePattern(INVENTORY_PATTERNS.OUT_OF_STOCK)
  getOutOfStock() {
    this.logger.log(`Received message pattern: ${INVENTORY_PATTERNS.OUT_OF_STOCK}`);
    return this.inventoryService.getOutOfStock();
  }

  @EventPattern(INVENTORY_EVENTS.RESERVED)
  async handleInventoryReserved(@Payload() data: any) {
    this.logger.log(`Received event: ${INVENTORY_EVENTS.RESERVED}`);
    this.logger.log(`Inventory reserved: ${JSON.stringify(data)}`);
  }

  @EventPattern(INVENTORY_EVENTS.RELEASED)
  async handleInventoryReleased(@Payload() data: any) {
    this.logger.log(`Received event: ${INVENTORY_EVENTS.RELEASED}`);
    this.logger.log(`Inventory released: ${JSON.stringify(data)}`);
  }
}
