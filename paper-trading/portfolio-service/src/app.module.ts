import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseFile } from './database.config';
import { MarketModule } from './market/market.module';
import { Order } from './portfolio/entities/order.entity';
import { Portfolio } from './portfolio/entities/portfolio.entity';
import { Position } from './portfolio/entities/position.entity';
import { PortfolioModule } from './portfolio/portfolio.module';

@Module({
  imports: [
    // The portfolio database belongs to this service only.
    TypeOrmModule.forRoot({
      type: 'sqljs',
      location: databaseFile(),
      autoSave: true,
      entities: [Portfolio, Position, Order],
      synchronize: true,
    }),
    MarketModule,
    PortfolioModule,
  ],
})
export class AppModule {}
