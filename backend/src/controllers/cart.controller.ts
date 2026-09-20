import { Request, Response, NextFunction } from "express";
import { CartService } from "../services/cart.service.js";

export class CartController {
  static async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const cart = await CartService.getCart(req.user.userId);
      res.json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  }

  static async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const { productId, variantId, quantity } = req.body;
      const cart = await CartService.addItem(
        req.user.userId,
        productId,
        variantId,
        quantity || 1
      );

      res.status(201).json({
        success: true,
        message: "Item added to cart.",
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateQuantity(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const param = req.params.id;
      const id = Array.isArray(param) ? param[0] : param;
      if (!id) {
        res.status(400).json({ success: false, message: "Invalid item ID." });
        return;
      }

      const { quantity } = req.body;
      const cart = await CartService.updateQuantity(req.user.userId, id, quantity);

      res.json({
        success: true,
        message: "Cart item updated.",
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const param = req.params.id;
      const id = Array.isArray(param) ? param[0] : param;
      if (!id) {
        res.status(400).json({ success: false, message: "Invalid item ID." });
        return;
      }

      const cart = await CartService.removeItem(req.user.userId, id);
      res.json({
        success: true,
        message: "Item removed from cart.",
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  static async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const result = await CartService.clearCart(req.user.userId);
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }
}
