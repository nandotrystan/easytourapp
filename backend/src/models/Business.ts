import { pool } from '../config/database';

export interface Business {
  id?: number;
  name: string;
  type: string;
  description: string;
  address: string;
  phone: string | null;
  rating: number;
  image_url: string;
  is_verified: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface BusinessCreateInput {
  name: string;
  type: string;
  description: string;
  address: string;
  phone: string | null;
  rating: number;
  image_url: string;
  is_verified: boolean;
}

export interface BusinessUpdateInput {
  name?: string;
  type?: string;
  description?: string;
  address?: string;
  phone?: string | null;
  rating?: number;
  image_url?: string;
  is_verified?: boolean;
}

class BusinessModel {
  static async findAll(): Promise<Business[]> {
    try {
      const result = await pool.query(`
        SELECT id, name, type, description, address, phone, rating, image_url, is_verified
        FROM businesses 
        ORDER BY created_at DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error in BusinessModel.findAll:', error);
      throw error;
    }
  }

  static async findById(id: number): Promise<Business | null> {
    try {
      const result = await pool.query(
        'SELECT id, name, type, description, address, phone, rating, image_url, is_verified FROM businesses WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in BusinessModel.findById:', error);
      throw error;
    }
  }

  static async create(businessData: BusinessCreateInput): Promise<Business> {
    const { name, type, description, address, phone, rating, image_url, is_verified } = businessData;
    
    try {
      const result = await pool.query(
        `INSERT INTO businesses (name, type, description, address, phone, rating, image_url, is_verified) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING id, name, type, description, address, phone, rating, image_url, is_verified`,
        [name, type, description, address, phone, rating, image_url, is_verified]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in BusinessModel.create:', error);
      throw error;
    }
  }

  static async update(id: number, businessData: BusinessUpdateInput): Promise<Business | null> {
    const { name, type, description, address, phone, rating, image_url, is_verified } = businessData;
    
    try {
      // Build dynamic update query
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (name !== undefined) {
        fields.push(`name = $${paramCount}`);
        values.push(name);
        paramCount++;
      }
      if (type !== undefined) {
        fields.push(`type = $${paramCount}`);
        values.push(type);
        paramCount++;
      }
      if (description !== undefined) {
        fields.push(`description = $${paramCount}`);
        values.push(description);
        paramCount++;
      }
      if (address !== undefined) {
        fields.push(`address = $${paramCount}`);
        values.push(address);
        paramCount++;
      }
      if (phone !== undefined) {
        fields.push(`phone = $${paramCount}`);
        values.push(phone);
        paramCount++;
      }
      if (rating !== undefined) {
        fields.push(`rating = $${paramCount}`);
        values.push(rating);
        paramCount++;
      }
      if (image_url !== undefined) {
        fields.push(`image_url = $${paramCount}`);
        values.push(image_url);
        paramCount++;
      }
      if (is_verified !== undefined) {
        fields.push(`is_verified = $${paramCount}`);
        values.push(is_verified);
        paramCount++;
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      // Add updated_at timestamp
      fields.push(`updated_at = NOW()`);

      values.push(id);
      
      const query = `
        UPDATE businesses 
        SET ${fields.join(', ')} 
        WHERE id = $${paramCount} 
        RETURNING id, name, type, description, address, phone, rating, image_url, is_verified
      `;
      
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in BusinessModel.update:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<Business | null> {
    try {
      const result = await pool.query(
        'DELETE FROM businesses WHERE id = $1 RETURNING id, name, type, description, address, phone, rating, image_url, is_verified',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in BusinessModel.delete:', error);
      throw error;
    }
  }

  static async findByType(type: string): Promise<Business[]> {
    try {
      const result = await pool.query(
        'SELECT id, name, type, description, address, phone, rating, image_url, is_verified FROM businesses WHERE type = $1 ORDER BY rating DESC',
        [type]
      );
      return result.rows;
    } catch (error) {
      console.error('Error in BusinessModel.findByType:', error);
      throw error;
    }
  }

  static async getVerifiedBusinesses(): Promise<Business[]> {
    try {
      const result = await pool.query(
        'SELECT id, name, type, description, address, phone, rating, image_url, is_verified FROM businesses WHERE is_verified = true ORDER BY rating DESC'
      );
      return result.rows;
    } catch (error) {
      console.error('Error in BusinessModel.getVerifiedBusinesses:', error);
      throw error;
    }
  }

  static async searchBusinesses(searchTerm: string): Promise<Business[]> {
    try {
      const result = await pool.query(
        `SELECT id, name, type, description, address, phone, rating, image_url, is_verified 
         FROM businesses 
         WHERE name ILIKE $1 OR description ILIKE $1 OR address ILIKE $1
         ORDER BY rating DESC`,
        [`%${searchTerm}%`]
      );
      return result.rows;
    } catch (error) {
      console.error('Error in BusinessModel.searchBusinesses:', error);
      throw error;
    }
  }

  static async getBusinessesWithFilters(filters: {
    type?: string;
    verified?: boolean;
    minRating?: number;
  }): Promise<Business[]> {
    try {
      let query = `
        SELECT id, name, type, description, address, phone, rating, image_url, is_verified 
        FROM businesses 
        WHERE 1=1
      `;
      const values: any[] = [];
      let paramCount = 1;

      if (filters.type && filters.type !== 'all') {
        query += ` AND type = $${paramCount}`;
        values.push(filters.type);
        paramCount++;
      }

      if (filters.verified !== undefined) {
        query += ` AND is_verified = $${paramCount}`;
        values.push(filters.verified);
        paramCount++;
      }

      if (filters.minRating !== undefined) {
        query += ` AND rating >= $${paramCount}`;
        values.push(filters.minRating);
        paramCount++;
      }

      query += ' ORDER BY rating DESC';

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error in BusinessModel.getBusinessesWithFilters:', error);
      throw error;
    }
  }
}

export default BusinessModel;