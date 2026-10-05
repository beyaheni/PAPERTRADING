import { join } from 'path';
import { GrpcOptions, Transport } from '@nestjs/microservices';

export const GRPC_URL = process.env.GRPC_URL ?? '0.0.0.0:50051';

/** gRPC server configuration. The .proto contract lives in /proto at the repo root. */
export const grpcOptions: GrpcOptions = {
  transport: Transport.GRPC,
  options: {
    url: GRPC_URL,
    package: 'market',
    protoPath: join(__dirname, '../../proto/market.proto'),
    loader: { defaults: true, arrays: true },
  },
};
