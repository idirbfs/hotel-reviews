import { Injectable, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { data as datas } from './data';
import { Hotel } from './models/hotel.model';
import { Review } from './models/review.model';
import axios from 'axios';

import { createReadStream } from 'fs';
import path from 'path';

import * as fastCsv from 'fast-csv';

@Injectable()
export class AppService {
  constructor(
    @Inject('SEQUELIZE')
    private sequelize: Sequelize,
  ) {}

  async getHotels() {
    const hotelsWithReviews = await Hotel.findAll({ include: [Review] });

    // Calcul du pourcentage des commentaires positifs pour chaque hôtel
    const hotelsWithPercentage = hotelsWithReviews.map((hotel) => {
      const positiveReviews = hotel.reviews.filter(
        (review) => review.decision === 'Positive',
      );
      const percentage = parseFloat(
        ((positiveReviews.length / hotel.reviews.length) * 100 || 0).toFixed(1),
      );

      const status = percentage > 50 ? 'text-success' : 'text-danger';

      return {
        ...hotel.toJSON(),
        percentagePositiveReviews: percentage,
        reviewStatus: status,
      };
    });

    return { hotels: hotelsWithPercentage };
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
  async insertHotelsFromCsv() {
    const filePath = path.resolve(__dirname, '../../dataset/dataset.csv');
    const stream = createReadStream(filePath);
    const hotelsData = [];

    // Wrap the stream creation in a promise to ensure it's completed before continuing
    await new Promise((resolve, reject) => {
      const parseStream = fastCsv.parseStream(stream, { headers: true });
      parseStream
        .on('data', (data) => {
          // Assuming you have some logic to round the necessary fields like stars and price
          const roundedData = {
            adress: data.Hotel_Address,
            name: data.Hotel_Name,
            longitude: data.lng,
            latitude: data.lat,
          };

          hotelsData.push(roundedData);
        })
        .on('end', () => {
          console.log('CSV reading finished');
          resolve(console.log('CSV reading finished')); // Resolve the promise when parsing is complete
        })
        .on('error', (error) => {
          console.error('Error reading CSV:', error);
          reject(error); // Reject the promise if there's an error
        });
    });

    // Assuming you have Sequelize initialized and your models are available
    await Hotel.bulkCreate(hotelsData, { ignoreDuplicates: true });

    console.log('Data inserted successfully!');
  }

  async getFromDb() {
    const hotels = await Hotel.findAll();
    hotels.forEach(async (hotel) => {
      const { stars, imgUrl } = await this.getHotelInfoFromGooglePlacesAPI(
        'AIzaSyApeXWJE5MSQ8mapOkNOgitzfOxhgiOm_o',
        hotel.name,
        hotel.adress,
      );

      hotel.stars = stars;
      hotel.url_photo = imgUrl;
      await hotel.save();
    });
  }

  async getHotelInfoFromGooglePlacesAPI(apiKey, hotelName, hotelAddress) {
    const apiUrl =
      'https://maps.googleapis.com/maps/api/place/findplacefromtext/json';

    try {
      const response = await axios.get(apiUrl, {
        params: {
          input: `${hotelName} ${hotelAddress}`,
          inputtype: 'textquery',
          fields: 'name,rating,photos',
          key: apiKey,
        },
      });

      if (response.data.candidates.length > 0) {
        const hotelInfo = response.data.candidates[0];
        const stars = hotelInfo.rating || 0;
        const imgUrl = this.getHotelImageUrl(hotelInfo.photos);

        return { stars, imgUrl };
      } else {
        return { stars: 0, imgUrl: '' };
      }
    } catch (error) {
      console.error('Error fetching hotel info from Google Places API:', error);
      return { stars: 0, imgUrl: '' };
    }
  }

  getHotelImageUrl(photos) {
    if (photos && photos.length > 0) {
      const photoReference = photos[0].photo_reference;
      const maxWidth = 400; // You can adjust the width based on your requirements
      const imgUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=YOUR_GOOGLE_PLACES_API_KEY`;

      return imgUrl;
    } else {
      return '';
    }
  }

  async insertReviewsFromCsv() {
    const filePath = path.resolve(__dirname, '../../dataset/dataset.csv');
    const stream = createReadStream(filePath);

    const reviewsData = [];

    const parseStream = fastCsv.parseStream(stream, { headers: true });

    parseStream
      .on('data', async (data) => {
        try {
          const reviewDate = new Date(data.Review_Date);

          // Check if reviewDate is a valid date
          if (!isNaN(reviewDate.getTime())) {
            const incrementedDate = this.incrementYears(reviewDate, 3);
            console.log('====================================');
            console.log(incrementedDate);
            console.log('====================================');

            const reviewText = this.getRandomReviewText(
              data.Positive_Review,
              data.Negative_Review,
            );

            // Search for the hotel based on Hotel_Name
            const hotel = await Hotel.findOne({
              where: { name: data.Hotel_Name },
            });

            const decision = (await this.fetchDecision(reviewText)).data
              .sentiment;
            console.log('====================================');
            console.log(await this.fetchDecision(reviewText));
            console.log('====================================');

            if (hotel) {
              const reviewData = {
                text: reviewText,
                reviewer: data.reviewer,
                reviewer_nationality: data.reviewer_nationality,
                review_date: incrementedDate,
                decision,
                hotelId: hotel.id, // Use the hotel's id as the foreign key
              };

              // Assuming you have Sequelize initialized and your models are available
              await Review.upsert(reviewData);
            } else {
              console.error('Hotel not found for name:', data.Hotel_Name);
            }
          } else {
            console.error(
              'Invalid date format for review_date:',
              data.review_date,
            );
          }
        } catch (error) {
          console.error('Error processing row:', data);
          console.error('Error details:', error);
        }
      })
      .on('end', () => {
        console.log('CSV reading finished');
        console.log('Reviews inserted successfully!');
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
      });
  }

  getRandomReviewText(positiveReview, negativeReview) {
    // Randomly choose between positive and negative reviews
    const usePositiveReview = Math.random() < 0.5;
    return usePositiveReview ? positiveReview : negativeReview;
  }

  incrementYears(date: Date, years: number): Date {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + years);
    return newDate;
  }

  // async getHotelDetails(id: number) {
  //   const hotel = await Hotel.findOne({ where: { id: id }, include: [Review] });

  //   return { hotel };
  // }

  async getHotelDetails(id: number) {
    const hotel = await Hotel.findOne({ where: { id: id }, include: [Review] });

    const positiveReview = hotel.reviews.find(
      (review) => review.decision === 'Positive',
    );
    const negativeReview = hotel.reviews.find(
      (review) => review.decision === 'Negative',
    );

    return { hotel, positiveReview, negativeReview };
  }
  async fetchDecision(review) {
    const decision = await axios.post(
      'http://localhost:5000/analyze_sentiment',
      { sentence: review },
    );
    return decision;
  }
}
