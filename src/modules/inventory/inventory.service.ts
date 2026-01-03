import { Injectable, Logger, Inject } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { ApiResponse } from './types/api-response';
import { CATALOG_CLIENT, INVENTORY_EVENTS } from '../../messaging';
import {
  ValidationException,
  ResourceNotFoundException,
  ConflictException,
  InternalServerException,
} from '../../common/exceptions';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CATALOG_CLIENT) private readonly catalogClient: ClientProxy,
  ) {}
  

  async create(createInventoryDto: CreateInventoryDto): Promise<ApiResponse<any>> {
    try {
      if (!createInventoryDto.sku) {
        throw new ValidationException('SKU is required');
      }

      this.logger.log(`Creating inventory for SKU: ${createInventoryDto.sku}`);
      
      // Check if inventory with this SKU already exists
      const existingInventory = await this.prisma.inventory.findUnique({
        where: { sku: createInventoryDto.sku },
      });

      if (existingInventory) {
        this.logger.warn(`Inventory with SKU ${createInventoryDto.sku} already exists, updating quantity`);
        
        // Update existing inventory instead of creating new one
        const updatedInventory = await this.prisma.inventory.update({
          where: { sku: createInventoryDto.sku },
          data: {
            quantity: existingInventory.quantity + (createInventoryDto.quantity ?? 0),
          },
        });

        return {
          success: true,
          message: 'Inventory updated (SKU already existed)',
          data: updatedInventory,
        };
      }

      const inventory = await this.prisma.inventory.create({
        data: {
          sku: createInventoryDto.sku,
          quantity: createInventoryDto.quantity ?? 0,
          reserved: createInventoryDto.reserved ?? 0,
        },
      });

      this.logger.log(`Inventory created successfully: ${inventory.sku}`);
      
      return {
        success: true,
        message: 'Inventory created successfully',
        data: inventory,
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }
      this.logger.error(`Failed to create inventory: ${error.message}`, error.stack);
      throw new InternalServerException('Failed to create inventory');
    }
  }


  async findAll(): Promise<ApiResponse<any>> {
    try {
      this.logger.log('Fetching all inventory items');

      const inventories = await this.prisma.inventory.findMany();

      return {
        success: true,
        message: 'Inventory items fetched successfully',
        data: {
          inventories,
          count: inventories.length,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to fetch inventory: ${error.message}`, error.stack);
      throw new InternalServerException('Failed to fetch inventory');
    }
  }

  async findOne(id: string): Promise<ApiResponse<any>> {
    try {
      // this.logger.log(`Finding inventory for ID: ${JSON.stringify(id)}`);
      const sku = `PROD-${id}`; // Assuming SKU format is 'PROD-<id>'

      if (!id) {
        throw new ValidationException('ID or SKU is required');
      }

      let inventory;
      
      if (sku) {
        this.logger.log(`Finding inventory by SKU: ${sku}`);
        inventory = await this.prisma.inventory.findUnique({
          where: { sku },
        });
      } else {
        this.logger.log(`Finding inventory by ID: ${id}`);
        inventory = await this.prisma.inventory.findUnique({
          where: { id },
        });
      }

      if (!inventory) {
        throw new ResourceNotFoundException('Inventory', sku || id);
      }

      return {
        success: true,
        message: 'Inventory found',
        data: inventory,
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }
      this.logger.error(`Failed to find inventory: ${error.message}`);
      throw new InternalServerException('Failed to find inventory');
    }
  }

  async update(id: string, updateInventoryDto: UpdateInventoryDto): Promise<ApiResponse<any>> {
    try {
      if (!id) {
        throw new ValidationException('ID is required');
      }

      const inventory = await this.prisma.inventory.findUnique({
        where: { id },
      });

      if (!inventory) {
        return {
          success: false,
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: `Inventory with ID ${id} not found`,
            statusCode: 404,
            details: { resource: 'Inventory', identifier: id },
          },
          timestamp: new Date().toISOString(),
        };
      }

      const updated = await this.prisma.inventory.update({
        where: { id },
        data: updateInventoryDto,
      });

      this.logger.log(`Inventory updated: ${id}`);

      return {
        success: true,
        message: 'Inventory updated successfully',
        data: updated,
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }
      this.logger.error(`Failed to update inventory: ${error.message}`);
      throw new InternalServerException('Failed to update inventory');
    }
  }

  async remove(id: string): Promise<ApiResponse<any>> {
    try {
      if (!id) {
        throw new ValidationException('ID is required');
      }

      const inventory = await this.prisma.inventory.findUnique({
        where: { id },
      });

      if (!inventory) {
        throw new ResourceNotFoundException('Inventory', id);
      }

      const deleted = await this.prisma.inventory.delete({
        where: { id },
      });

      this.logger.log(`Inventory deleted: ${id}`);

      // Send message to catalog to deactivate product
      this.catalogClient.emit(INVENTORY_EVENTS.PRODUCT_DELETED, {
        sku: inventory.sku,
        productId: inventory.sku,
        message: 'Product inventory has been deleted, deactivate the product',
      });

      this.logger.log(`Sent product deactivation event for SKU: ${inventory.sku}`);

      return {
        success: true,
        message: 'Inventory deleted successfully',
        data: deleted,
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }
      this.logger.error(`Failed to delete inventory: ${error.message}`);
      throw new InternalServerException('Failed to delete inventory');
    }
  }

 
  async findBySku(sku: string): Promise<ApiResponse<any>> {
    try {
      if (!sku) {
        throw new ValidationException('SKU is required');
      }

      this.logger.log(`Finding inventory by SKU: ${sku}`);
      
      const inventory = await this.prisma.inventory.findUnique({
        where: { sku },
      });

      if (!inventory) {
        throw new ResourceNotFoundException('Inventory', sku);
      }

      return {
        success: true,
        message: 'Inventory found',
        data: inventory,
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }
      this.logger.error(`Failed to find inventory by SKU: ${error.message}`);
      throw new InternalServerException('Failed to find inventory');
    }
  }

  /**
   * Reserve inventory for an order
   */
  async reserve(payload: any): Promise<ApiResponse<any>> {
    try {
      const { sku, quantity, orderId } = payload;

      if (!sku || !quantity || !orderId) {
        throw new ValidationException('SKU, quantity, and orderId are required');
      }

      this.logger.log(`Reserving ${quantity} units of SKU ${sku} for order ${orderId}`);

      const inventory = await this.prisma.inventory.findUnique({
        where: { sku },
      });

      if (!inventory) {
        throw new ResourceNotFoundException('Inventory', sku);
      }

      const available = inventory.quantity - inventory.reserved;
      
      if (available < quantity) {
        throw new ConflictException(`Insufficient stock for SKU ${sku}. Available: ${available}, Requested: ${quantity}`);
      }

      const updated = await this.prisma.inventory.update({
        where: { sku },
        data: {
          reserved: inventory.reserved + quantity,
        },
      });

      this.logger.log(`Reserved ${quantity} units of SKU ${sku}`);

      return {
        success: true,
        message: 'Inventory reserved successfully',
        data: updated,
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }
      this.logger.error(`Failed to reserve inventory: ${error.message}`);
      throw new InternalServerException('Failed to reserve inventory');
    }
  }

  /**
   * Release reserved inventory
   */
  async release(payload: any): Promise<ApiResponse<any>> {
    try {
      const { sku, quantity, orderId } = payload;

      if (!sku || !quantity || !orderId) {
        throw new ValidationException('SKU, quantity, and orderId are required');
      }

      this.logger.log(`Releasing ${quantity} units of SKU ${sku} from order ${orderId}`);

      const inventory = await this.prisma.inventory.findUnique({
        where: { sku },
      });

      if (!inventory) {
        throw new ResourceNotFoundException('Inventory', sku);
      }

      if (inventory.reserved < quantity) {
        throw new ConflictException(`Cannot release ${quantity} units. Only ${inventory.reserved} units are reserved`);
      }

      const updated = await this.prisma.inventory.update({
        where: { sku },
        data: {
          reserved: inventory.reserved - quantity,
        },
      });

      this.logger.log(`Released ${quantity} units of SKU ${sku}`);

      return {
        success: true,
        message: 'Inventory released successfully',
        data: updated,
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }
      this.logger.error(`Failed to release inventory: ${error.message}`);
      throw new InternalServerException('Failed to release inventory');
    }
  }

  /**
   * Get out of stock items
   */
  async getOutOfStock(): Promise<ApiResponse<any>> {
    try {
      this.logger.log('Fetching out of stock items');

      const outOfStock = await this.prisma.inventory.findMany({
        where: {
          OR: [
            { quantity: 0 },
            {
              quantity: {
                lte: this.prisma.inventory.fields.reserved,
              },
            },
          ],
        },
      });

      return {
        success: true,
        message: 'Out of stock items fetched successfully',
        data: {
          items: outOfStock,
          count: outOfStock.length,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to fetch out of stock items: ${error.message}`);
      throw new InternalServerException('Failed to fetch out of stock items');
    }
  }
}
