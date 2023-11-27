import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Review } from './review.model';

@Table
export class Hotel extends Model {
  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  adress: string;

  @Column(DataType.INTEGER)
  stars: number;

  @Column(DataType.FLOAT)
  price: number;

  @Column(DataType.TEXT)
  url_photo: string;

  @HasMany(() => Review)
  reviews: Review[];
}
