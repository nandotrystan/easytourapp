// models/GuideReview.ts
import { pool } from '../config/database';

export interface GuideReview {
  id: number;
  guide_id: number;
  tourist_id: number;
  rating: number;
  comment?: string;
  created_at: Date;
  tourist_name?: string;
}

export interface CreateGuideReviewData {
  guide_id: number;
  tourist_id: number;
  rating: number;
  comment?: string;
}

export class GuideReviewModel {
  static async create(reviewData: CreateGuideReviewData): Promise<GuideReview> {
    const result = await pool.query(
      `INSERT INTO guide_reviews (guide_id, tourist_id, rating, comment) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [reviewData.guide_id, reviewData.tourist_id, reviewData.rating, reviewData.comment]
    );
    return result.rows[0];
  }

  static async findByGuideId(guideId: number): Promise<GuideReview[]> {
    const result = await pool.query(
      `SELECT gr.*, u.name as tourist_name 
       FROM guide_reviews gr
       JOIN users u ON gr.tourist_id = u.id
       WHERE gr.guide_id = $1 
       ORDER BY gr.created_at DESC`,
      [guideId]
    );
    return result.rows;
  }

  static async getAverageRating(guideId: number): Promise<number> {
    const result = await pool.query(
      `SELECT AVG(rating) as average_rating 
       FROM guide_reviews 
       WHERE guide_id = $1`,
      [guideId]
    );
    return parseFloat(result.rows[0]?.average_rating) || 0;
  }
}