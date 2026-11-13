import { Request, Response, NextFunction } from "express";
import { OrderStatus } from "@prisma/client";
import { OrderService } from "../services/order.service.js";
import { PaymentService } from "../services/payment.service.js";

export class OrderController {
  static async validateCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const { addressId, items } = req.body;
      const result = await OrderService.validateCheckout(req.user.userId, addressId, items);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const result = await OrderService.createOrder({
        userId: req.user.userId,
        ...req.body,
      });

      res.status(201).json({
        success: true,
        message: "Order placed successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.verifyPaymentSignature(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const orders = await OrderService.getCustomerOrders(req.user.userId);
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const param = req.params.id;
      const id = Array.isArray(param) ? param[0] : param;
      if (!id) {
        res.status(400).json({ success: false, message: "Invalid order ID." });
        return;
      }

      const order = await OrderService.getOrderById(id, req.user?.userId);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  // --- Owner & Admin Management ---

  static async getOwnerOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.user?.storeId;
      const result = await OrderService.getAllOrders({
        storeId: storeId || undefined,
        status: req.query.status as OrderStatus | undefined,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });

      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAdminOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrderService.getAllOrders({
        storeId: req.query.storeId as string | undefined,
        status: req.query.status as OrderStatus | undefined,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });

      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const param = req.params.id;
      const id = Array.isArray(param) ? param[0] : param;
      const { status, notes } = req.body;

      if (!id) {
        res.status(400).json({ success: false, message: "Invalid order ID." });
        return;
      }

      const order = await OrderService.updateOrderStatus(
        id,
        status as OrderStatus,
        req.user?.userId || "system",
        notes
      );

      res.json({
        success: true,
        message: "Order status updated.",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}
