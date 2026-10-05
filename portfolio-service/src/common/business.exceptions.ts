import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';

/** Business errors. Each one carries its own HTTP status and a clear message. */

export class PortfolioNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`Portfolio ${id} not found`);
  }
}

export class InsufficientFundsException extends UnprocessableEntityException {
  constructor(required: number, available: number) {
    super(`Insufficient funds: order costs ${required.toFixed(2)} but only ${available.toFixed(2)} is available`);
  }
}

export class InsufficientPositionException extends UnprocessableEntityException {
  constructor(symbol: string, requested: number, held: number) {
    super(`Cannot sell ${requested} ${symbol}: only ${held} held`);
  }
}
