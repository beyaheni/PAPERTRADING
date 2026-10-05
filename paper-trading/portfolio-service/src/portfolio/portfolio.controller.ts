import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { PlaceOrderDto } from './dto/place-order.dto';
import { Valuation } from './dto/valuation.dto';
import { Order } from './entities/order.entity';
import { Portfolio } from './entities/portfolio.entity';
import { PortfolioService } from './portfolio.service';

/** Web layer: HTTP in, HTTP out. No business rule here, no state kept between requests. */
@ApiTags('portfolios')
@Controller('portfolios')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post()
  @ApiOperation({ summary: 'Create a portfolio with a starting cash amount' })
  create(@Body() dto: CreatePortfolioDto): Promise<Portfolio> {
    return this.portfolioService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List portfolios with their positions' })
  findAll(): Promise<Portfolio[]> {
    return this.portfolioService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one portfolio with its positions' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Portfolio> {
    return this.portfolioService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a portfolio, its positions and its order history' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.portfolioService.remove(id);
  }

  @Post(':id/orders')
  @ApiOperation({ summary: 'Buy or sell an instrument at the current market price' })
  placeOrder(@Param('id', ParseIntPipe) id: number, @Body() dto: PlaceOrderDto): Promise<Order> {
    return this.portfolioService.placeOrder(id, dto);
  }

  @Get(':id/orders')
  @ApiOperation({ summary: 'Order history of a portfolio, most recent first' })
  findOrders(@Param('id', ParseIntPipe) id: number): Promise<Order[]> {
    return this.portfolioService.findOrders(id);
  }

  @Get(':id/valuation')
  @ApiOperation({ summary: 'Value the portfolio at current market prices, with profit and loss' })
  valuate(@Param('id', ParseIntPipe) id: number): Promise<Valuation> {
    return this.portfolioService.valuate(id);
  }
}
