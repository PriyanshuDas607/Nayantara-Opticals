import { VirtualTryOnModal } from "./VirtualTryOnModal";
import { PRODUCTS, type Product } from "@/data/catalog";

export interface TryOnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName?: string;
  initialProductId?: string;
  product?: Product | null;
  allProducts?: Product[];
}

export function TryOnDialog({
  open,
  onOpenChange,
  productName,
  initialProductId,
  product,
  allProducts = PRODUCTS,
}: TryOnDialogProps) {
  // If product object is provided directly, resolve its ID
  // If productName is provided, try to find matching product
  let resolvedId = product?.id || initialProductId;
  if (!resolvedId && productName) {
    const match = allProducts.find(
      (p) => p.name.toLowerCase() === productName.toLowerCase()
    );
    if (match) resolvedId = match.id;
  }

  return (
    <VirtualTryOnModal
      open={open}
      onOpenChange={onOpenChange}
      initialProductId={resolvedId}
      allProducts={allProducts}
    />
  );
}
