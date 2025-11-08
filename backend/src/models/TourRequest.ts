import { pool } from "../config/database";

export interface TourRequest {
  id: number;
  tour_id: number;
  tourist_id: number;
  tourist_name: string;
  request_date: string;
  people_count: number;
  total_price: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  special_requests?: string;
  created_at: Date;
  tour_title?: string;
  guide_id?: number;
}

export interface CreateTourRequestData {
  tour_id: number;
  tourist_id: number;
  request_date: string;
  people_count: number;
  total_price: number;
  special_requests?: string;
}

export class TourRequestModel {
  static async create(
    tourRequestData: CreateTourRequestData
  ): Promise<TourRequest> {
    const result = await pool.query(
      `INSERT INTO tour_requests 
       (tour_id, tourist_id, request_date, people_count, total_price, special_requests, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        tourRequestData.tour_id,
        tourRequestData.tourist_id,
        tourRequestData.request_date,
        tourRequestData.people_count,
        tourRequestData.total_price,
        tourRequestData.special_requests || null, // ✅ Agora incluído
        "pending", // ✅ Status padrão
      ]
    );

    return result.rows[0];
  }

  static async findById(id: number): Promise<TourRequest | null> {
    const result = await pool.query(
      `SELECT tr.*, u.name as tourist_name, t.title as tour_title, t.guide_id 
       FROM tour_requests tr
       JOIN users u ON tr.tourist_id = u.id
       JOIN tours t ON tr.tour_id = t.id
       WHERE tr.id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  static async findByTouristId(touristId: number): Promise<TourRequest[]> {
    const result = await pool.query(
      `SELECT tr.*, u.name as tourist_name, t.title as tour_title, t.guide_id 
       FROM tour_requests tr
       JOIN users u ON tr.tourist_id = u.id
       JOIN tours t ON tr.tour_id = t.id
       WHERE tr.tourist_id = $1 
       ORDER BY tr.created_at DESC`,
      [touristId]
    );

    return result.rows;
  }

  static async findByGuideId(guideId: number): Promise<TourRequest[]> {
    const result = await pool.query(
      `SELECT tr.*, u.name as tourist_name, t.title as tour_title, t.guide_id 
       FROM tour_requests tr
       JOIN users u ON tr.tourist_id = u.id
       JOIN tours t ON tr.tour_id = t.id
       WHERE t.guide_id = $1 
       ORDER BY tr.created_at DESC`,
      [guideId]
    );

    return result.rows;
  }

  static async updateStatus(
    id: number,
    status: "approved" | "rejected" | "cancelled"
  ): Promise<TourRequest | null> {
    const result = await pool.query(
      `UPDATE tour_requests 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );

    return result.rows[0] || null;
  }

  // Método adicional para buscar todas as solicitações (útil para admin)
  static async findAll(): Promise<TourRequest[]> {
    const result = await pool.query(
      `SELECT tr.*, u.name as tourist_name, t.title as tour_title, t.guide_id 
       FROM tour_requests tr
       JOIN users u ON tr.tourist_id = u.id
       JOIN tours t ON tr.tour_id = t.id
       ORDER BY tr.created_at DESC`
    );

    return result.rows;
  }
}
