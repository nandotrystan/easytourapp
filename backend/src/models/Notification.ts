import { pool } from '../config/database';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_id?: number;
  related_type?: string;
  created_at: Date;
}

export interface CreateNotificationData {
  user_id: number;
  title: string;
  message: string;
  type: string;
  related_id?: number;
  related_type?: string;
}

export class NotificationModel {
  static async create(notificationData: CreateNotificationData): Promise<Notification> {
    const result = await pool.query(
      `INSERT INTO notifications 
       (user_id, title, message, type, related_id, related_type) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        notificationData.user_id,
        notificationData.title,
        notificationData.message,
        notificationData.type,
        notificationData.related_id || null,
        notificationData.related_type || null
      ]
    );
    
    return result.rows[0];
  }

  static async findByUserId(userId: number): Promise<Notification[]> {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    return result.rows;
  }

  static async markAsRead(id: number): Promise<Notification | null> {
    const result = await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *',
      [id]
    );
    
    return result.rows[0] || null;
  }

  static async markAllAsRead(userId: number): Promise<void> {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [userId]
    );
  }

  static async getUnreadCount(userId: number): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    
    return parseInt(result.rows[0].count);
  }
}