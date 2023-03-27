import { Body, Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/test')
  getHello(
    @Query('address') address: any,
    @Query('category') category: any,
    @Query('title') title: any,
    @Query('telephone') telephone: any,
  ): string {
    console.log(address, category, title, telephone);
    return this.appService.getHello();
  }
}
