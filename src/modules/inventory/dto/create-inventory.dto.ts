import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateInventoryDto {
	@IsString()
	@IsNotEmpty()
	sku: string;

	@IsInt()
	quantity: number;

	@IsInt()
	@IsOptional()
	reserved?: number;
}
