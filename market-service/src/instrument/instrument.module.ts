import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instrument } from './instrument.entity';
import { InstrumentGrpcController } from './instrument.grpc.controller';
import { InstrumentService } from './instrument.service';

@Module({
  imports: [TypeOrmModule.forFeature([Instrument])],
  controllers: [InstrumentGrpcController],
  providers: [InstrumentService],
})
export class InstrumentModule {}
