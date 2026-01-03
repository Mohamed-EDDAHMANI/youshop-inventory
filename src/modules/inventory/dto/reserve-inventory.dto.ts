import { IsString, IsInt, Min } from 'class-validator';

export class ReserveInventoryDto {
  @IsString()
  sku: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  orderId: string;
}
