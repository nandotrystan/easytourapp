import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tourguide',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    return false;
  }
};

export const initDatabase = async (): Promise<void> => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Initializing database...');

    // Tabela de usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        user_type VARCHAR(20) CHECK (user_type IN ('tourist', 'guide')) NOT NULL,
        avatar_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de passeios
    await client.query(`
      CREATE TABLE IF NOT EXISTS tours (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        guide_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        base_price DECIMAL(10,2) NOT NULL,
        max_people INTEGER NOT NULL,
        extra_person_price DECIMAL(10,2) DEFAULT 0,
        location VARCHAR(200) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        image_url VARCHAR(500),
        rating DECIMAL(3,2) DEFAULT 5.0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de solicitações de passeio
    await client.query(`
      CREATE TABLE IF NOT EXISTS tour_requests (
        id SERIAL PRIMARY KEY,
        tour_id INTEGER REFERENCES tours(id) ON DELETE CASCADE,
        tourist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        request_date DATE NOT NULL,
        people_count INTEGER NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
        special_requests TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de estabelecimentos
    await client.query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        type VARCHAR(50) CHECK (type IN ('restaurant', 'store', 'hotel', 'attraction')) NOT NULL,
        description TEXT NOT NULL,
        address TEXT NOT NULL,
        phone VARCHAR(20),
        website VARCHAR(500),
        image_url VARCHAR(500),
        rating DECIMAL(3,2) DEFAULT 5.0,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de avaliações
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        target_type VARCHAR(20) CHECK (target_type IN ('tour', 'guide', 'business')) NOT NULL,
        target_id INTEGER NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de notificações
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        related_id INTEGER,
        related_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Inserir dados de exemplo
    const businessCount = await client.query('SELECT COUNT(*) FROM businesses');
    if (parseInt(businessCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO businesses (name, type, description, address, phone, rating, image_url, is_verified) 
        VALUES 
        ('Restaurante Tradicional', 'restaurant', 'Comida típica local com os melhores ingredientes', 'Rua Principal, 123 - Centro', '(11) 9999-9999', 4.5, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300', true),
        ('Loja de Artesanato', 'store', 'Artesanatos feitos à mão por artistas locais', 'Avenida das Artes, 456', '(11) 8888-8888', 4.8, 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300', true),
        ('Hotel Pousada Natureza', 'hotel', 'Pousada aconchegante com vista para as montanhas', 'Estrada da Serra, 789', '(11) 7777-7777', 4.7, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300', true),
        ('Mirante da Cidade', 'attraction', 'Vista panorâmica incrível da cidade', 'Morro do Mirante, s/n', NULL, 4.9, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300', true)
      `);
      console.log('✅ Sample businesses inserted');
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
};