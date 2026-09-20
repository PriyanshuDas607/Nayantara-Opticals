import { prisma } from "../utils/prisma.js";

export class CartService {
  /**
   * Retrieves a customer's cart with live pricing and stock validation
   */
  static async getCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true } },
                inventory: true,
              },
            },
            variant: {
              include: { inventory: true },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { where: { isPrimary: true } },
                  inventory: true,
                },
              },
              variant: {
                include: { inventory: true },
              },
            },
          },
        },
      });
    }

    // Calculate totals server-side
    let subtotalPaise = 0;
    const validatedItems = cart.items.map((item) => {
      const basePrice = item.product.salePricePaise || item.product.pricePaise;
      const variantDelta = item.variant?.priceDelta || 0;
      const unitPricePaise = basePrice + variantDelta;
      const totalItemPaise = unitPricePaise * item.quantity;
      subtotalPaise += totalItemPaise;

      const availableStock = item.variant?.inventory?.quantity ?? item.product.inventory?.quantity ?? 0;

      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        variantName: item.variant?.name,
        productImage: item.product.images[0]?.url,
        quantity: item.quantity,
        unitPricePaise,
        totalItemPaise,
        availableStock,
        isOutOfStock: availableStock < item.quantity,
        requiresPrescription: item.product.requiresPrescription,
      };
    });

    return {
      id: cart.id,
      items: validatedItems,
      subtotalPaise,
      itemCount: validatedItems.reduce((acc, curr) => acc + curr.quantity, 0),
    };
  }

  /**
   * Adds an item to the customer's cart
   */
  static async addItem(userId: string, productId: string, variantId?: string, quantity = 1) {
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { inventory: true },
    });

    if (!product || !product.isActive) {
      throw new Error("Product is unavailable or out of stock.");
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId,
          quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  /**
   * Updates quantity of an existing item in the cart
   */
  static async updateQuantity(userId: string, cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeItem(userId, cartItemId);
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== userId) {
      throw new Error("Cart item not found.");
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return this.getCart(userId);
  }

  /**
   * Removes an item from the cart
   */
  static async removeItem(userId: string, cartItemId: string) {
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== userId) {
      throw new Error("Cart item not found.");
    }

    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return this.getCart(userId);
  }

  /**
   * Clears the entire cart
   */
  static async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return { success: true, message: "Cart cleared" };
  }
}
