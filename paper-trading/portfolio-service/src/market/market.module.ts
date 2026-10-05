import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { marketGrpcClientOptions } from './grpc-client.options';
import { MarketClient } from './market.client';
import { MarketController } from './market.controller';

@Module({
  imports: [ClientsModule.register([marketGrpcClientOptions])],
  controllers: [MarketController],
  providers: [MarketClient],
  exports: [MarketClient],
})
export class MarketModule {}
