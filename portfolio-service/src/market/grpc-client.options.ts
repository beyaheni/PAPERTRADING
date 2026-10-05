import { join } from 'path';
import { ClientProviderOptions, Transport } from '@nestjs/microservices';

export const MARKET_PACKAGE = 'MARKET_PACKAGE';

/** gRPC client configuration. The .proto contract lives in /proto at the repo root. */
export const marketGrpcClientOptions: ClientProviderOptions = {
  name: MARKET_PACKAGE,
  transport: Transport.GRPC,
  options: {
    url: process.env.MARKET_GRPC_URL ?? 'localhost:50051',
    package: 'market',
    protoPath: join(__dirname, '../../../proto/market.proto'),
    loader: { defaults: true, arrays: true },
  },
};
