import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service.js";

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.getPublicProducts(req.query);
      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductBySlugOrId(req: Request, res: Response, next: NextFunction) {
    try {
      const param = req.params.slug || req.params.id;
      const id = Array.isArray(param) ? param[0] : param;
      if (!id) {
        res.status(400).json({ success: false, message: "Invalid product identifier." });
        return;
      }

      const product = await ProductService.getProductBySlugOrId(id);
      if (!product) {
        res.status(404).json({ success: false, message: "Product not found." });
        return;
      }

      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await ProductService.getCategories();
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  // --- Admin & Owner Product Management ---

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      // If user is OWNER, assign their storeId
      const storeId = req.user?.role === "OWNER" ? req.user.storeId || undefined : req.body.storeId;

      const product = await ProductService.createProduct({
        ...req.body,
        storeId,
      });

      res.status(201).json({
        success: true,
        message: "Product created successfully.",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const param = req.params.id;
      const id = Array.isArray(param) ? param[0] : param;
      if (!id) {
        res.status(400).json({ success: false, message: "Invalid product ID." });
        return;
      }

      const storeIdFilter = req.user?.role === "OWNER" ? req.user.storeId || undefined : undefined;
      const product = await ProductService.updateProduct(id, storeIdFilter, req.body);

      res.json({
        success: true,
        message: "Product updated successfully.",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const param = req.params.id;
      const id = Array.isArray(param) ? param[0] : param;
      if (!id) {
        res.status(400).json({ success: false, message: "Invalid product ID." });
        return;
      }

      const storeIdFilter = req.user?.role === "OWNER" ? req.user.storeId || undefined : undefined;
      await ProductService.deleteProduct(id, storeIdFilter);

      res.json({ success: true, message: "Product deleted successfully." });
    } catch (error) {
      next(error);
    }
  }
}
