import { pool } from '../config/database';

export interface Tour {
  id: number;
  title: string;
  description: string;
  guide_id: number;
  guide_name: string;
  base_price: number;
  max_people: number;
  extra_person_price: number;
  location: string;
  duration: string;
  image_url: string;
  rating: number;
  created_at: Date;
}

export interface CreateTourData {
  title: string;
  description: string;
  guide_id: number;
  base_price: number;
  max_people: number;
  extra_person_price?: number;
  location: string;
  duration: string;
  image_url?: string;
}

export class TourModel {
  static async create(tourData: CreateTourData): Promise<Tour> {
    const result = await pool.query(
      `INSERT INTO tours 
       (title, description, guide_id, base_price, max_people, extra_person_price, location, duration, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        tourData.title,
        tourData.description,
        tourData.guide_id,
        tourData.base_price,
        tourData.max_people,
        tourData.extra_person_price || 0,
        tourData.location,
        tourData.duration,
        tourData.image_url || null
      ]
    );
    
    return result.rows[0];
  }

  static async findAll(): Promise<Tour[]> {
    const result = await pool.query(`
      SELECT t.*, u.name as guide_name 
      FROM tours t 
      JOIN users u ON t.guide_id = u.id 
      ORDER BY t.created_at DESC
    `);
    
    return result.rows;
  }

  // static async findById(id: number): Promise<Tour | null> {
  //   const result = await pool.query(`
  //     SELECT t.*, u.name as guide_name 
  //     FROM tours t 
  //     JOIN users u ON t.guide_id = u.id 
  //     WHERE t.id = $1
  //   `, [id]);
    
  //   return result.rows[0] || null;
  // }

  static async findById(id: number): Promise<Tour | null> {
  const result = await pool.query(
    `SELECT t.*, u.name as guide_name, 
            (SELECT AVG(rating) FROM tour_reviews WHERE tour_id = t.id) as average_rating,
            (SELECT COUNT(*) FROM tour_reviews WHERE tour_id = t.id) as review_count
     FROM tours t
     JOIN users u ON t.guide_id = u.id
     WHERE t.id = $1`,
    [id]
  );
  return result.rows[0];
}

  static async findByGuideId(guideId: number): Promise<Tour[]> {
    const result = await pool.query(
      'SELECT * FROM tours WHERE guide_id = $1 ORDER BY created_at DESC',
      [guideId]
    );
    
    return result.rows;
  }

  
}