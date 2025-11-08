import { Request, Response } from "express";
import { TourRequestModel, CreateTourRequestData } from "../models/TourRequest";
import { NotificationModel } from "../models/Notification";

export class TourRequestController {
  static async createTourRequest(req: Request, res: Response) {
    try {
      const touristId = (req as any).user.userId;
      const tourRequestData: CreateTourRequestData = {
        ...req.body,
        tourist_id: touristId,
      };

      const tourRequest = await TourRequestModel.create(tourRequestData);

      // Criar notificação para o guia
      const tourRequestWithDetails = await TourRequestModel.findById(
        tourRequest.id
      );
      if (tourRequestWithDetails?.guide_id) {
        await NotificationModel.create({
          user_id: tourRequestWithDetails.guide_id,
          title: "Nova solicitação de passeio",
          message: `Você recebeu uma nova solicitação para o passeio "${tourRequestWithDetails.tour_title}"`,
          type: "tour_request",
          related_id: tourRequest.id,
          related_type: "tour_request",
        });
      }

      res.status(201).json({
        message: "Solicitação de passeio criada com sucesso",
        tourRequest,
      });
    } catch (error) {
      console.error("Create tour request error:", error);
      res.status(500).json({ error: "Erro ao criar solicitação de passeio" });
    }
  }

  static async getMyTourRequests(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const userType = (req as any).user.userType;

      let tourRequests;
      if (userType === "tourist") {
        tourRequests = await TourRequestModel.findByTouristId(userId);
      } else {
        tourRequests = await TourRequestModel.findByGuideId(userId);
      }

      res.json(tourRequests);
    } catch (error) {
      console.error("Get tour requests error:", error);
      res.status(500).json({ error: "Erro ao buscar solicitações" });
    }
  }

  static async updateTourRequestStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = (req as any).user.userId;

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Status inválido" });
      }

      const tourRequest = await TourRequestModel.updateStatus(
        parseInt(id),
        status as any
      );

      if (!tourRequest) {
        return res.status(404).json({ error: "Solicitação não encontrada" });
      }

      // Criar notificação para o turista
      await NotificationModel.create({
        user_id: tourRequest.tourist_id,
        title: `Solicitação ${
          status === "approved" ? "aprovada" : "rejeitada"
        }`,
        message: `Sua solicitação para o passeio foi ${
          status === "approved" ? "aprovada" : "rejeitada"
        } pelo guia`,
        type: "tour_request_status",
        related_id: tourRequest.id,
        related_type: "tour_request",
      });

      res.json({
        message: `Solicitação ${
          status === "approved" ? "aprovada" : "rejeitada"
        } com sucesso`,
        tourRequest,
      });
    } catch (error) {
      console.error("Update tour request status error:", error);
      res
        .status(500)
        .json({ error: "Erro ao atualizar status da solicitação" });
    }
  }

  static async cancelTourRequest(req: Request, res: Response) {
    try {
      console.log("🔄 cancelTourRequest chamado - BACKEND");
      console.log("📝 Parâmetros:", req.params);
      console.log("👤 User ID:", (req as any).user.userId);

      const { id } = req.params;
      const userId = (req as any).user.userId;

      console.log(`🎯 Cancelando request ${id} para usuário ${userId}`);

      const tourRequest = await TourRequestModel.updateStatus(
        parseInt(id),
        "cancelled"
      );

      if (!tourRequest) {
        console.log("❌ Solicitação não encontrada:", id);
        return res.status(404).json({ error: "Solicitação não encontrada" });
      }

      console.log("✅ Solicitação cancelada no banco:", tourRequest);

      // Criar notificação para o guia
      if (tourRequest.guide_id) {
        await NotificationModel.create({
          user_id: tourRequest.guide_id,
          title: "Solicitação cancelada",
          message: `Uma solicitação para seu passeio foi cancelada`,
          type: "tour_request_cancelled",
          related_id: tourRequest.id,
          related_type: "tour_request",
        });
        console.log("✅ Notificação criada para o guia");
      }

      res.json({
        message: "Solicitação cancelada com sucesso",
        tourRequest,
      });

      console.log("✅ Resposta enviada para o frontend");
    } catch (error) {
      console.error("❌ Cancel tour request error:", error);
      res.status(500).json({ error: "Erro ao cancelar solicitação" });
    }
  }
}
