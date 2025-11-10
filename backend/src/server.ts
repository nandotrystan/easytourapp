import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { initDatabase, testConnection } from './config/database';
import authRoutes from './routes/auth';
import tourRoutes from './routes/tour';
import tourRequestRoutes from './routes/tourRequest';
import notificationRoutes from './routes/notification';
import tourReviewRoutes from './routes/tourReview';
import guideReviewRoutes from './routes/guideReview';
import BusinessRoutes from './routes/business';




dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Para upload de imagens

// Logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', async (req: Request, res: Response) => {
  try {
    const dbStatus = await testConnection();
    res.json({ 
      status: 'OK', 
      message: 'Tour Guide API is running',
      database: dbStatus ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'API is having issues',
      database: 'Error',
      timestamp: new Date().toISOString()
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/tour-requests', tourRequestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tour-reviews', tourReviewRoutes);
app.use('/api/guide-reviews', guideReviewRoutes);
app.use('/api/businesses', BusinessRoutes);

// Business routes (simplificadas)
app.get('/api/businesses', async (req: Request, res: Response) => {
  try {
    const { pool } = await import('./config/database');
    const result = await pool.query('SELECT * FROM businesses WHERE is_verified = true ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get businesses error:', error);
    res.status(500).json({ error: 'Erro ao buscar estabelecimentos' });
  }
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.path,
    method: req.method
  });
});

// Error handling
app.use((error: Error, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
  });
});

// Initialize and start server
const startServer = async (): Promise<void> => {
  try {
    console.log('🚀 Starting Tour Guide API...');
    
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Cannot start server without database connection');
      process.exit(1);
    }

    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`🎉 Server running on port ${PORT}`);
      console.log(`📚 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`🗺️ Tours API: http://localhost:${PORT}/api/tours`);
      console.log(`📋 Tour Requests API: http://localhost:${PORT}/api/tour-requests`);
      console.log(`🔔 Notifications API: http://localhost:${PORT}/api/notifications`);
      console.log(`🏪 Business API: http://localhost:${PORT}/api/businesses`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

startServer();