import { Controller, Get, Param, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Render('index')
  @Get()
  async root() {
    return this.appService.getHello();
  }

  @Get('insert')
  async insertData() {
    // await this.appService.getFromDb();
    //await this.appService.insertDataFromCsv();
    //await this.appService.insertReviewsFromCsv();
    // console.log('====================================');
    // console.log(await this.appService.fetchDecision('this hotel is good'));
    // console.log('====================================');
  }

  @Render('details')
  @Get('hotel/:id')
  async getHotelDetails(@Param('id') id: number) {
    const hotel = this.appService.getHotelDetails(id);
    return hotel;
  }
}
