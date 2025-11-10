import { Request, Response } from 'express';
import BusinessModel, { Business, BusinessCreateInput, BusinessUpdateInput } from '../models/Business';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

const businessController = {
  // Get all businesses with optional filters
  async getAllBusinesses(req: Request, res: Response<ApiResponse<Business[]>>): Promise<void> {
    try {
      const { type, verified, minRating, search } = req.query;

      let businesses: Business[];

      if (search) {
        // Search businesses
        businesses = await BusinessModel.searchBusinesses(search as string);
      } else if (type || verified !== undefined || minRating !== undefined) {
        // Filter businesses
        businesses = await BusinessModel.getBusinessesWithFilters({
          type: type as string,
          verified: verified === 'true',
          minRating: minRating ? parseFloat(minRating as string) : undefined
        });
      } else {
        // Get all businesses
        businesses = await BusinessModel.findAll();
      }

      res.json({
        success: true,
        data: businesses
      });
    } catch (error) {
      const err = error as Error;
      console.error('Error in getAllBusinesses:', err);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estabelecimentos',
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
      });
    }
  },

  // Get business by ID
  async getBusinessById(req: Request<{ id: string }>, res: Response<ApiResponse<Business>>): Promise<void> {
    try {
      const { id } = req.params;
      const businessId = parseInt(id);
      
      if (isNaN(businessId)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
        return;
      }

      const business = await BusinessModel.findById(businessId);
      
      if (!business) {
        res.status(404).json({
          success: false,
          message: 'Estabelecimento não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: business
      });
    } catch (error) {
      const err = error as Error;
      console.error('Error in getBusinessById:', err);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estabelecimento',
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
      });
    }
  },

  // Create new business
  async createBusiness(req: Request<{}, {}, BusinessCreateInput>, res: Response<ApiResponse<Business>>): Promise<void> {
    try {
      const businessData = req.body;

      // Validation
      if (!businessData.name || !businessData.type || !businessData.description || !businessData.address) {
        res.status(400).json({
          success: false,
          message: 'Campos obrigatórios: name, type, description, address'
        });
        return;
      }

      const newBusiness = await BusinessModel.create(businessData);
      
      res.status(201).json({
        success: true,
        message: 'Estabelecimento criado com sucesso',
        data: newBusiness
      });
    } catch (error) {
      const err = error as Error;
      console.error('Error in createBusiness:', err);
      res.status(400).json({
        success: false,
        message: 'Erro ao criar estabelecimento',
        error: process.env.NODE_ENV === 'production' ? 'Bad request' : err.message
      });
    }
  },

  // Update business
  async updateBusiness(req: Request<{ id: string }, {}, BusinessUpdateInput>, res: Response<ApiResponse<Business>>): Promise<void> {
    try {
      const { id } = req.params;
      const businessId = parseInt(id);
      
      if (isNaN(businessId)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
        return;
      }

      const businessData = req.body;
      
      // Check if business exists
      const existingBusiness = await BusinessModel.findById(businessId);
      if (!existingBusiness) {
        res.status(404).json({
          success: false,
          message: 'Estabelecimento não encontrado'
        });
        return;
      }

      const updatedBusiness = await BusinessModel.update(businessId, businessData);
      
      if (!updatedBusiness) {
        res.status(404).json({
          success: false,
          message: 'Estabelecimento não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Estabelecimento atualizado com sucesso',
        data: updatedBusiness
      });
    } catch (error) {
      const err = error as Error;
      console.error('Error in updateBusiness:', err);
      res.status(400).json({
        success: false,
        message: 'Erro ao atualizar estabelecimento',
        error: process.env.NODE_ENV === 'production' ? 'Bad request' : err.message
      });
    }
  },

  // Delete business
  async deleteBusiness(req: Request<{ id: string }>, res: Response<ApiResponse<Business>>): Promise<void> {
    try {
      const { id } = req.params;
      const businessId = parseInt(id);
      
      if (isNaN(businessId)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
        return;
      }

      // Check if business exists
      const existingBusiness = await BusinessModel.findById(businessId);
      if (!existingBusiness) {
        res.status(404).json({
          success: false,
          message: 'Estabelecimento não encontrado'
        });
        return;
      }

      const deletedBusiness = await BusinessModel.delete(businessId);
      
      if (!deletedBusiness) {
        res.status(404).json({
          success: false,
          message: 'Estabelecimento não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Estabelecimento deletado com sucesso',
        data: deletedBusiness
      });
    } catch (error) {
      const err = error as Error;
      console.error('Error in deleteBusiness:', err);
      res.status(500).json({
        success: false,
        message: 'Erro ao deletar estabelecimento',
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
      });
    }
  },

  // Get businesses by type
  async getBusinessesByType(req: Request<{ type: string }>, res: Response<ApiResponse<Business[]>>): Promise<void> {
    try {
      const { type } = req.params;
      const businesses = await BusinessModel.findByType(type);
      
      res.json({
        success: true,
        data: businesses
      });
    } catch (error) {
      const err = error as Error;
      console.error('Error in getBusinessesByType:', err);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estabelecimentos por tipo',
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
      });
    }
  },

  // Get verified businesses
  async getVerifiedBusinesses(req: Request, res: Response<ApiResponse<Business[]>>): Promise<void> {
    try {
      const businesses = await BusinessModel.getVerifiedBusinesses();
      
      res.json({
        success: true,
        data: businesses
      });
    } catch (error) {
      const err = error as Error;
      console.error('Error in getVerifiedBusinesses:', err);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estabelecimentos verificados',
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
      });
    }
  },

  // Search businesses
  async searchBusinesses(req: Request<{}, {}, {}, { q: string }>, res: Response<ApiResponse<Business[]>>): Promise<void> {
    try {
      const { q } = req.query;
      
      if (!q) {
        res.status(400).json({
          success: false,
          message: 'Parâmetro de busca (q) é obrigatório'
        });
        return;
      }

      const businesses = await BusinessModel.searchBusinesses(q);
      
      res.json({
        success: true,
        data: businesses
      });
    } catch (error) {
      const err = error as Error;
      console.error('Error in searchBusinesses:', err);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estabelecimentos',
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
      });
    }
  }
};

export default businessController;