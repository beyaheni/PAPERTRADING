import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { GRPC_URL, grpcOptions } from './grpc.options';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, grpcOptions);
  await app.listen();
  new Logger('Bootstrap').log(`market-service (gRPC) listening on ${GRPC_URL}`);
}

bootstrap();
