import { Request, Response } from 'express';
import { NotificationModel } from '../models/Notification';

export class NotificationController {
  static async getMyNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const notifications = await NotificationModel.findByUserId(userId);

      res.json(notifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Erro ao buscar notificações' });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const notification = await NotificationModel.markAsRead(parseInt(id));

      if (!notification) {
        return res.status(404).json({ error: 'Notificação não encontrada' });
      }

      res.json({ message: 'Notificação marcada como lida', notification });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({ error: 'Erro ao marcar notificação como lida' });
    }
  }

  static async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      await NotificationModel.markAllAsRead(userId);

      res.json({ message: 'Todas as notificações marcadas como lidas' });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({ error: 'Erro ao marcar notificações como lidas' });
    }
  }

  static async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const count = await NotificationModel.getUnreadCount(userId);

      res.json({ unreadCount: count });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({ error: 'Erro ao buscar contagem de não lidas' });
    }
  }
}