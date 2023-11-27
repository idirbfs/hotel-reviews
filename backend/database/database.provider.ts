import { Sequelize } from 'sequelize-typescript';
// import { Mot } from '../models/mots.model';
// import { Document } from '../models/documents.model';
import { Hotel } from '../src/models/hotel.model';
import { Review } from 'src/models/review.model';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'myrootpassword',
        database: 'hotels',
      });
      sequelize.addModels([Hotel, Review]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
