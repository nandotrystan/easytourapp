// controllers/guideReviewController.ts
import { Request, Response } from 'express';
import { GuideReviewModel } from '../models/GuideReview';

export class GuideReviewController {
  static async createGuideReview(req: Request, res: Response) {
    try {
      const touristId = (req as any).user.userId;
      const { guide_id, rating, comment } = req.body;

      if (!guide_id || !rating) {
        return res.status(400).json({ error: 'Guide ID e avaliação são obrigatórios' });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Avaliação deve ser entre 1 e 5' });
      }

      // Verificar se o usuário já avaliou este guia
      const existingReviews = await GuideReviewModel.findByGuideId(parseInt(guide_id));
      const alreadyReviewed = existingReviews.find(review => review.tourist_id === touristId);

      if (alreadyReviewed) {
        return res.status(400).json({ error: 'Você já avaliou este guia' });
      }

      const review = await GuideReviewModel.create({
        guide_id: parseInt(guide_id),
        tourist_id: touristId,
        rating,
        comment
      });

      res.status(201).json({
        message: 'Avaliação do guia criada com sucesso',
        review
      });
    } catch (error) {
      console.error('Create guide review error:', error);
      res.status(500).json({ error: 'Erro ao criar avaliação do guia' });
    }
  }

  static async getGuideReviews(req: Request, res: Response) {
    try {
      const { guideId } = req.params;
      const reviews = await GuideReviewModel.findByGuideId(parseInt(guideId));
      res.json(reviews);
    } catch (error) {
      console.error('Get guide reviews error:', error);
      res.status(500).json({ error: 'Erro ao buscar avaliações do guia' });
    }
  }

  static async getGuideAverageRating(req: Request, res: Response) {
    try {
      const { guideId } = req.params;
      const averageRating = await GuideReviewModel.getAverageRating(parseInt(guideId));
      res.json({ average_rating: averageRating });
    } catch (error) {
      console.error('Get guide average rating error:', error);
      res.status(500).json({ error: 'Erro ao buscar média de avaliações' });
    }
  }
}