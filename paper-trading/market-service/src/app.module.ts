import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseFile } from './database.config';
import { Instrument } from './instrument/instrument.entity';
import { InstrumentModule } from './instrument/instrument.module';

@Module({
  imports: [
    // The market database belongs to this service only.
    TypeOrmModule.forRoot({
      type: 'sqljs',
      location: databaseFile(),
      autoSave: true,
      entities: [Instrument],
      synchronize: true,
    }),
    InstrumentModule,
  ],
})
export class AppModule {}
