import { Injectable, Logger } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiResponse } from './types/api-response';
import {
  ValidationException,
  ResourceNotFoundException,
  ConflictException,
  InternalServerException,
} from '../../common/exceptions';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly prisma: PrismaService) {}
  
  /**
   * Create new inventory or update existing
   */
  async create(createInventoryDto: CreateInventoryDto): Promise<ApiResponse<any>> {
    try {
      if (!createInventoryDto.sku) {
        throw new ValidationException('SKU is required', { field: 'sku' });
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
      // Re-throw if it's already an AppException
      if (error.code) {
        throw error;
      }

      this.logger.error(`Failed to create inventory: ${error.message}`, error.stack);
      
      throw new InternalServerException(
        'Failed to create inventory',
        { originalError: error.code || error.message },
      );
    }
  }

  /**
   * Find all inventory items
   */
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
      throw new InternalServerException('Failed to fetch inventory', {
        originalError: error.code,
      });
    }
  }

  /**
   * Find inventory by ID or SKU
   */
  async findOne(payload: any): Promise<ApiResponse<any>> {
    try {
      const id = payload?.id || payload;
      const sku = payload?.sku;

      if (!id && !sku) {
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

  /**
   * Update inventory
   */
  async update(id: string, updateInventoryDto: UpdateInventoryDto): Promise<ApiResponse<any>> {
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

  /**
   * Remove inventory
   */
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
}
