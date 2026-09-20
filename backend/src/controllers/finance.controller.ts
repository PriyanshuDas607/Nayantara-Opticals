import { Request, Response, NextFunction } from "express";
import { FinanceService } from "../services/finance.service.js";

export class FinanceController {
  /**
   * Scoped financial dashboard data for Store Owner
   */
  static async getOwnerFinance(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.user?.storeId || req.query.storeId as string | undefined;
      const data = await FinanceService.getOwnerFinancialOverview(storeId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Consolidated platform financial dashboard data for Super Admin
   */
  static async getAdminFinance(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await FinanceService.getAdminFinancialOverview();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
