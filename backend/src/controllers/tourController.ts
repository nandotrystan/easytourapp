import { Request, Response } from 'express';
import { TourModel, CreateTourData } from '../models/Tour';

export class TourController {
  static async createTour(req: Request, res: Response) {
    try {
      const tourData: CreateTourData = {
        ...req.body,
        guide_id: (req as any).user.userId // Do middleware de autenticação
      };

      const tour = await TourModel.create(tourData);
      
      res.status(201).json({
        message: 'Passeio criado com sucesso',
        tour
      });
    } catch (error) {
      console.error('Create tour error:', error);
      res.status(500).json({ error: 'Erro ao criar passeio' });
    }
  }

  static async getTours(req: Request, res: Response) {
    try {
      const tours = await TourModel.findAll();
      res.json(tours);
    } catch (error) {
      console.error('Get tours error:', error);
      res.status(500).json({ error: 'Erro ao buscar passeios' });
    }
  }

  static async getTourById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tour = await TourModel.findById(parseInt(id));
      
      if (!tour) {
        return res.status(404).json({ error: 'Passeio não encontrado' });
      }
      
      res.json(tour);
    } catch (error) {
      console.error('Get tour error:', error);
      res.status(500).json({ error: 'Erro ao buscar passeio' });
    }
  }

  static async getMyTours(req: Request, res: Response) {
    try {
      const guideId = (req as any).user.userId;
      const tours = await TourModel.findByGuideId(guideId);
      
      res.json(tours);
    } catch (error) {
      console.error('Get my tours error:', error);
      res.status(500).json({ error: 'Erro ao buscar seus passeios' });
    }
  }
}