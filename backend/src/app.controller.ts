import { Controller, Get, Render } from '@nestjs/common';
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
    await this.appService.insertData();
  }
}
