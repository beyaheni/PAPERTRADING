import { ApiProperty } from '@nestjs/swagger';

export class PositionValuation {
  @ApiProperty() symbol: string;
  @ApiProperty() quantity: number;
  @ApiProperty() averagePrice: number;
  @ApiProperty() marketPrice: number;
  @ApiProperty() marketValue: number;
  @ApiProperty() unrealizedPnl: number;
}

export class Valuation {
  @ApiProperty() portfolioId: number;
  @ApiProperty() owner: string;
  @ApiProperty() cash: number;
  @ApiProperty({ type: [PositionValuation] }) positions: PositionValuation[];
  @ApiProperty() positionsValue: number;
  @ApiProperty() totalValue: number;
  @ApiProperty() unrealizedPnl: number;
}
