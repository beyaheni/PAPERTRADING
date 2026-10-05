import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketModule } from '../market/market.module';
import { Order } from './entities/order.entity';
import { Portfolio } from './entities/portfolio.entity';
import { Position } from './entities/position.entity';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';

@Module({
  imports: [TypeOrmModule.forFeature([Portfolio, Position, Order]), MarketModule],
  controllers: [PortfolioController],
  providers: [PortfolioService],
})
export class PortfolioModule {}
