// models/TourReview.ts
import { pool } from '../config/database';

export interface TourReview {
  id: number;
  tour_id: number;
  tourist_id: number;
  rating: number;
  comment?: string;
  created_at: Date;
  tourist_name?: string;
}

export interface CreateTourReviewData {
  tour_id: number;
  tourist_id: number;
  rating: number;
  comment?: string;
}

export class TourReviewModel {
  static async create(reviewData: CreateTourReviewData): Promise<TourReview> {
    const result = await pool.query(
      `INSERT INTO tour_reviews (tour_id, tourist_id, rating, comment) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [reviewData.tour_id, reviewData.tourist_id, reviewData.rating, reviewData.comment]
    );
    return result.rows[0];
  }

  static async findByTourId(tourId: number): Promise<TourReview[]> {
    const result = await pool.query(
      `SELECT tr.*, u.name as tourist_name 
       FROM tour_reviews tr
       JOIN users u ON tr.tourist_id = u.id
       WHERE tr.tour_id = $1 
       ORDER BY tr.created_at DESC`,
      [tourId]
    );
    return result.rows;
  }

  static async findByTouristId(touristId: number): Promise<TourReview[]> {
    const result = await pool.query(
      `SELECT tr.*, t.title as tour_title 
       FROM tour_reviews tr
       JOIN tours t ON tr.tour_id = t.id
       WHERE tr.tourist_id = $1 
       ORDER BY tr.created_at DESC`,
      [touristId]
    );
    return result.rows;
  }

  static async getAverageRating(tourId: number): Promise<number> {
    const result = await pool.query(
      `SELECT AVG(rating) as average_rating 
       FROM tour_reviews 
       WHERE tour_id = $1`,
      [tourId]
    );
    return parseFloat(result.rows[0]?.average_rating) || 0;
  }

  static async update(id: number, rating: number, comment?: string): Promise<TourReview> {
    const result = await pool.query(
      `UPDATE tour_reviews 
       SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING *`,
      [rating, comment, id]
    );
    return result.rows[0];
  }

  static async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM tour_reviews WHERE id = $1', [id]);
  }
}