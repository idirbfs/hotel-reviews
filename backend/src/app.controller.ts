import { Controller, Get, Param, Post, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Render('index')
  @Get()
  async root() {
    return this.appService.getHotels();
  }

  @Post('hotel/insert')
  async insertHotels() {
    await this.appService.insertHotelsFromCsv();
  }

  @Post('review/insert')
  async insertReviews() {
    await this.appService.insertReviewsFromCsv();
  }

  @Render('details')
  @Get('hotel/:id')
  async getHotelDetails(@Param('id') id: number) {
    const hotel = this.appService.getHotelDetails(id);
    return hotel;
  }
}
