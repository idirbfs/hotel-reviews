import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { Hotel } from './hotel.model';

@Table
export class Review extends Model {
  @Column(DataType.STRING)
  text: string;

  @Column(DataType.STRING)
  reviewer: string;

  @Column(DataType.INTEGER)
  reviewer_nationality: number;

  @Column(DataType.DATE)
  review_date: Date;

  @ForeignKey(() => Hotel)
  @Column
  hotelId: number;

  @BelongsTo(() => Hotel)
  hotel: Hotel;
}
