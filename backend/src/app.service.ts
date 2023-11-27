import { Injectable, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { data as datas } from './data';
import { Hotel } from './models/hotel.model';

@Injectable()
export class AppService {
  constructor(
    @Inject('SEQUELIZE')
    private sequelize: Sequelize,
  ) {}

  async getHello() {
    console.log('====================================');
    console.log(datas);
    console.log('====================================');
    return { datas };
  }

  async insertData() {
    datas.forEach(async (data) => {
      await Hotel.upsert({
        name: data.name,
        adress: data.adresse,
        stars: data.etoiles,
        price: data.prix,
        url_photo: data.url_photo,
      });
    });
  }
}
