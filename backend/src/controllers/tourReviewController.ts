// controllers/tourReviewController.ts
import { Request, Response } from 'express';
import { TourReviewModel } from '../models/TourReview';

export class TourReviewController {
  static async createTourReview(req: Request, res: Response) {
    try {
      const touristId = (req as any).user.userId;
      const { tour_id, rating, comment } = req.body;

      if (!tour_id || !rating) {
        return res.status(400).json({ error: 'Tour ID e avaliação são obrigatórios' });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Avaliação deve ser entre 1 e 5' });
      }

      // Verificar se o usuário já avaliou este passeio
      const existingReviews = await TourReviewModel.findByTouristId(touristId);
      const alreadyReviewed = existingReviews.find(review => review.tour_id === parseInt(tour_id));

      if (alreadyReviewed) {
        return res.status(400).json({ error: 'Você já avaliou este passeio' });
      }

      const review = await TourReviewModel.create({
        tour_id: parseInt(tour_id),
        tourist_id: touristId,
        rating,
        comment
      });

      res.status(201).json({
        message: 'Avaliação criada com sucesso',
        review
      });
    } catch (error) {
      console.error('Create tour review error:', error);
      res.status(500).json({ error: 'Erro ao criar avaliação' });
    }
  }

  static async getTourReviews(req: Request, res: Response) {
    try {
      const { tourId } = req.params;
      const reviews = await TourReviewModel.findByTourId(parseInt(tourId));
      res.json(reviews);
    } catch (error) {
      console.error('Get tour reviews error:', error);
      res.status(500).json({ error: 'Erro ao buscar avaliações' });
    }
  }

  static async getMyTourReviews(req: Request, res: Response) {
    try {
      const touristId = (req as any).user.userId;
      const reviews = await TourReviewModel.findByTouristId(touristId);
      res.json(reviews);
    } catch (error) {
      console.error('Get my tour reviews error:', error);
      res.status(500).json({ error: 'Erro ao buscar minhas avaliações' });
    }
  }

  static async updateTourReview(req: Request, res: Response) {
    try {
      const touristId = (req as any).user.userId;
      const { id } = req.params;
      const { rating, comment } = req.body;

      // Verificar se a avaliação pertence ao usuário
      const reviews = await TourReviewModel.findByTouristId(touristId);
      const userReview = reviews.find(review => review.id === parseInt(id));

      if (!userReview) {
        return res.status(404).json({ error: 'Avaliação não encontrada' });
      }

      const updatedReview = await TourReviewModel.update(parseInt(id), rating, comment);

      res.json({
        message: 'Avaliação atualizada com sucesso',
        review: updatedReview
      });
    } catch (error) {
      console.error('Update tour review error:', error);
      res.status(500).json({ error: 'Erro ao atualizar avaliação' });
    }
  }
}