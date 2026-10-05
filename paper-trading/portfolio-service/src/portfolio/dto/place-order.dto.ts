import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { OrderSide } from '../entities/order.entity';

export class PlaceOrderDto {
  @ApiProperty({ example: 'BNP' })
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty({ enum: OrderSide, example: OrderSide.BUY })
  @IsEnum(OrderSide)
  side: OrderSide;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  quantity: number;
}
