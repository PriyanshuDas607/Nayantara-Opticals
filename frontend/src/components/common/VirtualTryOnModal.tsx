import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Camera,
  X,
  ShoppingBag,
  RotateCcw,
  Sliders,
  Check,
  Download,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { PRODUCTS, type Product } from "@/data/catalog";
import { inr } from "@/lib/site";
import { useShop } from "@/store/shop";
import { cn } from "@/lib/utils";

// Real High-Definition Front-Facing Cutout Assets (100% clean, no inner temple artifacts)
import meridianGoldCutout from "@/assets/tryon/meridian-gold-front.png";
import aureliaRoundCutout from "@/assets/tryon/aurelia-round-front.png";
import graphiteSquarelineCutout from "@/assets/tryon/graphite-squareline-front.png";
import solsticeAviatorCutout from "@/assets/tryon/solstice-aviator-front.png";
import amberCateyeCutout from "@/assets/tryon/amber-cateye-front.png";

// Types
export type FrameShape = "round" | "aviator" | "wayfarer" | "square" | "rectangle" | "cateye" | "clubmaster" | "hexagon" | "rimless";
export type LensTint = "clear" | "dark" | "bluelight" | "sunset";

export interface VirtualTryOnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialProductId?: string | undefined;
  allProducts?: Product[] | undefined;
}

export function mapProductToShape(product: Product): FrameShape {
  const s = (product.style || "").toLowerCase();
  const n = (product.name || "").toLowerCase();
  const id = (product.id || "").toLowerCase();
  if (s.includes("aviator") || n.includes("aviator") || id.includes("aviator") || id.includes("solstice")) return "aviator";
  if (s.includes("cat") || n.includes("cat-eye") || n.includes("cateye") || id.includes("amber")) return "cateye";
  if (s.includes("clubmaster") || s.includes("browline")) return "clubmaster";
  if (s.includes("hexagon") || s.includes("geometric")) return "hexagon";
  if (s.includes("rimless") || s.includes("drill")) return "rimless";
  if (s.includes("rectangle") || n.includes("meridian") || id.includes("meridian")) return "rectangle";
  if (s.includes("square") || n.includes("graphite") || id.includes("graphite") || id.includes("classic")) return "square";
  if (s.includes("round") || n.includes("round") || id.includes("aurelia") || id.includes("aero")) return "round";
  return "wayfarer";
}

export function getProductCutoutUrl(product: Product): string {
  const id = (product.id || "").toLowerCase();
  const name = (product.name || "").toLowerCase();

  if (id.includes("meridian") || name.includes("meridian") || id.includes("aero") || name.includes("aero")) {
    return meridianGoldCutout;
  }
  if (id.includes("aurelia") || name.includes("aurelia")) {
    return aureliaRoundCutout;
  }
  if (id.includes("graphite") || name.includes("graphite") || id.includes("classic") || name.includes("classic")) {
    return graphiteSquarelineCutout;
  }
  if (id.includes("solstice") || name.includes("solstice") || id.includes("polarized") || name.includes("polarized")) {
    return solsticeAviatorCutout;
  }
  if (id.includes("amber") || name.includes("amber") || id.includes("cat") || name.includes("cat")) {
    return amberCateyeCutout;
  }

  // Fallbacks by category / shape
  if (product.category === "sunglasses") return solsticeAviatorCutout;
  if (product.style?.toLowerCase().includes("round")) return aureliaRoundCutout;
  if (product.style?.toLowerCase().includes("square")) return graphiteSquarelineCutout;
  return meridianGoldCutout;
}

export function getDefaultTintForProduct(product: Product): LensTint {
  if (product.category === "sunglasses") {
    if (product.name.toLowerCase().includes("amber") || product.style.toLowerCase().includes("cat")) {
      return "sunset";
    }
    return "dark";
  }
  if (product.badges?.some((b) => b.toLowerCase().includes("blue")) || product.name.toLowerCase().includes("graphite")) {
    return "bluelight";
  }
  return "clear";
}

export function getDefaultColorForProduct(product: Product): { hex: string; name: string } {
  const firstCol = product.colors?.[0];
  const colName = firstCol?.name || "24K Royal Gold";
  const lower = colName.toLowerCase();

  if (lower.includes("gold")) return { hex: "#d4af37", name: "24K Royal Gold" };
  if (lower.includes("tortoise") || lower.includes("amber")) return { hex: "#6f3d1e", name: "Italian Tortoise" };
  if (lower.includes("matte black") || lower.includes("black") || lower.includes("ink")) return { hex: "#1c1d21", name: "Matte Black Titanium" };
  if (lower.includes("silver") || lower.includes("gunmetal") || lower.includes("titanium")) return { hex: "#cbd5e1", name: "Platinum Silver" };
  return { hex: "#d4af37", name: "24K Royal Gold" };
}

// Draw Eyewear on Canvas with 100% physically accurate temple arms & dynamic finish tinting
export function drawProceduralEyewear(
  ctx: CanvasRenderingContext2D,
  shape: FrameShape,
  options: {
    x?: number | undefined;
    y?: number | undefined;
    width?: number | undefined;
    roll?: number | undefined;
    yaw?: number | undefined;
    frameColor?: string | undefined;
    frameColorName?: string | undefined;
    tintMode?: LensTint | undefined;
    drawTemples?: boolean | undefined;
    imageElement?: HTMLImageElement | null | undefined;
    mirrored?: boolean | undefined;
    earLeft?: { x: number; y: number } | undefined;
    earRight?: { x: number; y: number } | undefined;
  } = {}
) {
  const {
    x = 0,
    y = 0,
    width = 240,
    roll = 0,
    yaw = 0,
    frameColor = "#d4af37",
    frameColorName = "24K Royal Gold",
    tintMode = "clear",
    drawTemples = true,
    imageElement = null,
    mirrored = false,
    earLeft,
    earRight,
  } = options;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(roll);

  // 3D perspective: compress horizontally as head turns, shift towards the nearer side
  const absYaw = Math.abs(yaw);
  const perspectiveScaleX = Math.max(0.72, 1 - absYaw * 0.28);
  const yawShiftX = yaw * width * 0.12;
  ctx.translate(yawShiftX, 0);
  ctx.scale(perspectiveScaleX, 1);

  // 1. Photographic Cutout Rendering (Studio Realism)
  if (imageElement && imageElement.complete && imageElement.naturalWidth > 0) {
    const imgH = (imageElement.naturalHeight / imageElement.naturalWidth) * width;

    // Draw Realistic 3D Temple Arms ("Dandi") extending from frame hinges directly to ears
    if (drawTemples) {
      // Hinge positions on front cutout (upper outer corner of frame)
      const hingeY = -imgH * 0.16;
      const leftHingeX = -width * 0.472;
      const rightHingeX = width * 0.472;

      // Transform world/screen ear coordinates into local frame space
      const transformToLocal = (pt: { x: number; y: number } | undefined, defaultLocalX: number) => {
        if (!pt) {
          return { x: defaultLocalX, y: hingeY + width * 0.015 };
        }
        const dx = pt.x - x;
        const dy = pt.y - y;
        const unrotX = dx * Math.cos(-roll) - dy * Math.sin(-roll);
        const unrotY = dx * Math.sin(-roll) + dy * Math.cos(-roll);
        const localX = (unrotX - yawShiftX) / perspectiveScaleX;
        const localY = unrotY;
        return { x: localX, y: localY };
      };

      // In real eyewear (as shown in reference images 2, 3, 4):
      // Both temple arms extend backwards from the frame hinges towards the ears.
      // In front view (Image 3), both are visible extending back past the hinges along the sides of the head.
      // When turning head (Image 2 & 4):
      // The near temple arm extends all the way across the side of the head to the ear.
      // The far temple arm naturally foreshortens.
      const leftVisibility = yaw > 0.32 ? Math.max(0.2, 1 - (yaw - 0.32) / 0.25) : 1.0;
      const rightVisibility = yaw < -0.32 ? Math.max(0.2, 1 - (-yaw - 0.32) / 0.25) : 1.0;

      // Natural reach to the ears:
      const leftEarLocal = transformToLocal(earLeft, leftHingeX - width * (0.24 + Math.max(0, -yaw) * 0.45));
      const rightEarLocal = transformToLocal(earRight, rightHingeX + width * (0.24 + Math.max(0, yaw) * 0.45));

      // Frame styling attributes
      const isAcetateOrBold =
        shape === "square" ||
        shape === "wayfarer" ||
        shape === "round" ||
        shape === "cateye";

      const templeStemWidth = isAcetateOrBold
        ? Math.max(4.2, width * 0.026)
        : Math.max(2.6, width * 0.014);
      const templeHingeWidth = isAcetateOrBold
        ? Math.max(5.2, width * 0.032)
        : Math.max(3.2, width * 0.017);

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // -------------------------------------------------------------
      // Left Temple Arm ("Left Dandi") -> goes from left hinge to left ear
      // -------------------------------------------------------------
      if (leftVisibility > 0) {
        ctx.globalAlpha = leftVisibility;

        // targetX extends out towards ear (strictly outside leftHingeX, never inside lens)
        const targetX = Math.min(leftHingeX - width * 0.16, leftEarLocal.x);
        const targetY = Math.max(hingeY - width * 0.05, Math.min(hingeY + width * 0.06, leftEarLocal.y));
        const midX = leftHingeX + (targetX - leftHingeX) * 0.45;
        const midY = Math.min(hingeY, targetY) - 1.5;

        // Ear curve tip (curves downward behind ear as in reference image)
        const tipX = targetX - width * 0.03;
        const tipY = targetY + width * 0.07;

        // 1. Soft skin/hair drop shadow behind temple arm
        ctx.beginPath();
        ctx.moveTo(leftHingeX, hingeY + 2.5);
        ctx.quadraticCurveTo(midX, midY + 2.5, targetX, targetY + 2.5);
        ctx.quadraticCurveTo(targetX - 2, targetY + width * 0.035 + 2.5, tipX, tipY + 2.5);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.32)";
        ctx.lineWidth = templeStemWidth + 2.0;
        ctx.stroke();

        // 2. Main temple arm stem (from frame hinge straight across to ear)
        ctx.beginPath();
        ctx.moveTo(leftHingeX, hingeY);
        ctx.quadraticCurveTo(midX, midY, targetX, targetY);
        ctx.strokeStyle = frameColor;
        ctx.lineWidth = templeStemWidth;
        ctx.stroke();

        // 3. Ear hook / temple tip curving gently behind the ear
        ctx.beginPath();
        ctx.moveTo(targetX, targetY);
        ctx.quadraticCurveTo(targetX - 2, targetY + width * 0.035, tipX, tipY);
        ctx.strokeStyle = frameColor;
        ctx.lineWidth = Math.max(2.2, templeStemWidth * 0.85);
        ctx.stroke();

        // 4. Specular highlight line along upper edge
        ctx.beginPath();
        ctx.moveTo(leftHingeX, hingeY - 1.0);
        ctx.quadraticCurveTo(midX, midY - 1.0, targetX, targetY - 1.0);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
        ctx.lineWidth = Math.max(0.9, width * 0.005);
        ctx.stroke();

        // 5. Designer metallic hinge bracket / horizontal rivet pin (matching reference image)
        ctx.fillStyle = frameColor;
        ctx.fillRect(leftHingeX - 4.0, hingeY - templeHingeWidth / 2, 5.0, templeHingeWidth);
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.fillRect(leftHingeX - 3.0, hingeY - 1.0, 4.0, 2.0);
      }

      // -------------------------------------------------------------
      // Right Temple Arm ("Right Dandi") -> goes from right hinge to right ear
      // -------------------------------------------------------------
      if (rightVisibility > 0) {
        ctx.globalAlpha = rightVisibility;

        // targetX extends out towards ear (strictly outside rightHingeX, never inside lens)
        const targetX = Math.max(rightHingeX + width * 0.16, rightEarLocal.x);
        const targetY = Math.max(hingeY - width * 0.05, Math.min(hingeY + width * 0.06, rightEarLocal.y));
        const midX = rightHingeX + (targetX - rightHingeX) * 0.45;
        const midY = Math.min(hingeY, targetY) - 1.5;

        // Ear curve tip (curves downward behind ear as in reference image)
        const tipX = targetX + width * 0.03;
        const tipY = targetY + width * 0.07;

        // 1. Soft skin/hair drop shadow behind temple arm
        ctx.beginPath();
        ctx.moveTo(rightHingeX, hingeY + 2.5);
        ctx.quadraticCurveTo(midX, midY + 2.5, targetX, targetY + 2.5);
        ctx.quadraticCurveTo(targetX + 2, targetY + width * 0.035 + 2.5, tipX, tipY + 2.5);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.32)";
        ctx.lineWidth = templeStemWidth + 2.0;
        ctx.stroke();

        // 2. Main temple arm stem (from frame hinge straight across to ear)
        ctx.beginPath();
        ctx.moveTo(rightHingeX, hingeY);
        ctx.quadraticCurveTo(midX, midY, targetX, targetY);
        ctx.strokeStyle = frameColor;
        ctx.lineWidth = templeStemWidth;
        ctx.stroke();

        // 3. Ear hook / temple tip curving gently behind the ear
        ctx.beginPath();
        ctx.moveTo(targetX, targetY);
        ctx.quadraticCurveTo(targetX + 2, targetY + width * 0.035, tipX, tipY);
        ctx.strokeStyle = frameColor;
        ctx.lineWidth = Math.max(2.2, templeStemWidth * 0.85);
        ctx.stroke();

        // 4. Specular highlight line along upper edge
        ctx.beginPath();
        ctx.moveTo(rightHingeX, hingeY - 1.0);
        ctx.quadraticCurveTo(midX, midY - 1.0, targetX, targetY - 1.0);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
        ctx.lineWidth = Math.max(0.9, width * 0.005);
        ctx.stroke();

        // 5. Designer metallic hinge bracket / horizontal rivet pin (matching reference image)
        ctx.fillStyle = frameColor;
        ctx.fillRect(rightHingeX - 1.0, hingeY - templeHingeWidth / 2, 5.0, templeHingeWidth);
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.fillRect(rightHingeX - 1.0, hingeY - 1.0, 4.0, 2.0);
      }

      ctx.restore();
    }

    // Colorize the frame and apply lens tint on isolated offscreen canvas
    const offW = Math.ceil(width);
    const offH = Math.ceil(imgH);
    const offscreen = document.createElement("canvas");
    offscreen.width = offW;
    offscreen.height = offH;
    const offCtx = offscreen.getContext("2d")!;

    // 1. Draw original photographic frame cutout
    offCtx.drawImage(imageElement, 0, 0, offW, offH);

    // 2. Dynamic Frame Finish Color Tinting:
    const lowerName = (frameColorName || "").toLowerCase();
    const lowerHex = (frameColor || "").toLowerCase();

    const isBlack = lowerName.includes("black") || lowerHex.includes("1c") || lowerHex === "#000000";
    const isSilver = lowerName.includes("silver") || lowerHex.includes("cbd") || lowerHex === "#ffffff";
    const isTortoise = lowerName.includes("tortoise") || lowerHex.includes("6f3d");
    const isGold = lowerName.includes("gold") || lowerHex.includes("d4af");

    if (isBlack) {
      offCtx.globalCompositeOperation = "color";
      offCtx.fillStyle = "#666666";
      offCtx.fillRect(0, 0, offW, offH);
      offCtx.globalCompositeOperation = "multiply";
      offCtx.fillStyle = "rgba(24, 25, 28, 0.90)";
      offCtx.fillRect(0, 0, offW, offH);
    } else if (isSilver) {
      offCtx.globalCompositeOperation = "color";
      offCtx.fillStyle = "#cbd5e1";
      offCtx.fillRect(0, 0, offW, offH);
      offCtx.globalCompositeOperation = "screen";
      offCtx.fillStyle = "rgba(255, 255, 255, 0.28)";
      offCtx.fillRect(0, 0, offW, offH);
    } else if (isTortoise) {
      offCtx.globalCompositeOperation = "color";
      offCtx.fillStyle = "#92400e";
      offCtx.fillRect(0, 0, offW, offH);
      offCtx.globalCompositeOperation = "color-burn";
      offCtx.fillStyle = "rgba(120, 53, 15, 0.40)";
      offCtx.fillRect(0, 0, offW, offH);
    } else if (isGold) {
      offCtx.globalCompositeOperation = "color";
      offCtx.fillStyle = "#f59e0b";
      offCtx.fillRect(0, 0, offW, offH);
      offCtx.globalCompositeOperation = "color-burn";
      offCtx.fillStyle = "rgba(217, 119, 6, 0.35)";
      offCtx.fillRect(0, 0, offW, offH);
    } else if (frameColor) {
      offCtx.globalCompositeOperation = "color";
      offCtx.fillStyle = frameColor;
      offCtx.fillRect(0, 0, offW, offH);
    }

    // 3. Re-mask with destination-in so transparent lenses and outer edges stay 100% clean
    offCtx.globalCompositeOperation = "destination-in";
    offCtx.drawImage(imageElement, 0, 0, offW, offH);

    // 4. Lens optical coating tint
    if (tintMode === "bluelight") {
      offCtx.globalCompositeOperation = "source-atop";
      offCtx.fillStyle = "rgba(100, 180, 255, 0.20)";
      offCtx.fillRect(0, 0, offW, offH);
    } else if (tintMode === "sunset") {
      offCtx.globalCompositeOperation = "source-atop";
      offCtx.fillStyle = "rgba(245, 158, 11, 0.24)";
      offCtx.fillRect(0, 0, offW, offH);
    } else if (tintMode === "dark") {
      offCtx.globalCompositeOperation = "source-atop";
      offCtx.fillStyle = "rgba(20, 35, 25, 0.55)";
      offCtx.fillRect(0, 0, offW, offH);
    }

    // Draw final tinted frame onto main canvas with 3D drop shadow
    ctx.save();
    if (mirrored) ctx.scale(-1, 1);
    ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.shadowOffsetX = yaw * 2;
    ctx.drawImage(offscreen, -width / 2, -imgH * 0.48, width, imgH);
    ctx.restore();

    ctx.restore();
    return;
  }

  // Fallback vector outline if image still loading (clean ellipses, no interior sticks)
  const lensW =
    shape === "rectangle" ? width * 0.43 :
    shape === "aviator" ? width * 0.42 :
    shape === "cateye" ? width * 0.41 :
    shape === "round" ? width * 0.39 : width * 0.40;

  const lensH =
    shape === "rectangle" ? lensW * 0.60 :
    shape === "round" ? lensW * 0.94 :
    shape === "aviator" ? lensW * 0.88 :
    shape === "cateye" ? lensW * 0.75 :
    shape === "square" ? lensW * 0.84 :
    shape === "rimless" ? lensW * 0.64 : lensW * 0.74;

  const bridgeW = width * 0.14;
  const leftCenterX = -(bridgeW / 2 + lensW / 2);
  const rightCenterX = bridgeW / 2 + lensW / 2;

  // Lenses with subtle specular glare
  [ { cx: leftCenterX, isRight: false }, { cx: rightCenterX, isRight: true } ].forEach((lens) => {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(lens.cx, 0, lensW / 2, lensH / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = tintMode === "dark" ? "rgba(16, 45, 30, 0.78)" : "rgba(200, 230, 255, 0.10)";
    ctx.fill();
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = Math.max(2.5, width * 0.02);
    ctx.stroke();
    ctx.restore();
  });

  // Bridge
  ctx.beginPath();
  ctx.moveTo(leftCenterX + lensW / 2, -2);
  ctx.quadraticCurveTo(0, -10, rightCenterX - lensW / 2, -2);
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = Math.max(2.5, width * 0.02);
  ctx.stroke();

  ctx.restore();
}

// MediaPipe Script Loader
let scriptsLoadingPromise: Promise<void> | null = null;
function loadMediaPipeScripts(): Promise<void> {
  if (scriptsLoadingPromise) return scriptsLoadingPromise;

  scriptsLoadingPromise = new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).FaceMesh && (window as any).Camera) {
      resolve();
      return;
    }

    const loadScript = (src: string) => {
      return new Promise<void>((res) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          res();
          return;
        }
        const s = document.createElement("script");
        s.src = src;
        s.crossOrigin = "anonymous";
        s.onload = () => res();
        s.onerror = () => res();
        document.head.appendChild(s);
      });
    };

    loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js")
      .then(() => loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"))
      .then(() => resolve());
  });

  return scriptsLoadingPromise;
}

export function VirtualTryOnModal({
  open,
  onOpenChange,
  initialProductId,
  allProducts = PRODUCTS,
}: VirtualTryOnModalProps) {
  const { addToCart } = useShop();

  // Find the selected product
  const selectedProduct = useMemo<Product>(() => {
    if (initialProductId) {
      const match = allProducts.find(
        (p) => p.id === initialProductId || p.name.toLowerCase() === initialProductId.toLowerCase()
      );
      if (match) return match;
    }
    const wearable = allProducts.find((p) => p.category === "eyeglasses" || p.category === "sunglasses");
    return (wearable ?? allProducts[0] ?? PRODUCTS[0])!;
  }, [initialProductId, allProducts]);

  // Preload and Cache Photographic Frame Cutouts
  const imageCacheRef = useRef<Record<string, HTMLImageElement>>({});
  const activeImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const cutouts = [
      meridianGoldCutout,
      aureliaRoundCutout,
      graphiteSquarelineCutout,
      solsticeAviatorCutout,
      amberCateyeCutout,
    ];
    cutouts.forEach((url) => {
      if (!imageCacheRef.current[url]) {
        const img = new Image();
        img.src = url;
        imageCacheRef.current[url] = img;
      }
    });
  }, []);

  // Sync active photographic image whenever selectedProduct changes
  useEffect(() => {
    const url = getProductCutoutUrl(selectedProduct);
    let img = imageCacheRef.current[url];
    if (!img) {
      img = new Image();
      img.src = url;
      imageCacheRef.current[url] = img;
    }
    activeImageRef.current = img;
  }, [selectedProduct]);

  // Frame Customization State
  const defaultCol = getDefaultColorForProduct(selectedProduct);
  const [frameColor, setFrameColor] = useState<string>(defaultCol.hex);
  const [frameColorName, setFrameColorName] = useState<string>(defaultCol.name);
  const [lensTint, setLensTint] = useState<LensTint>(getDefaultTintForProduct(selectedProduct));
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(1.0);
  const [offsetY, setOffsetY] = useState<number>(0);

  // Sync frame defaults on product switch
  useEffect(() => {
    const col = getDefaultColorForProduct(selectedProduct);
    setFrameColor(col.hex);
    setFrameColorName(col.name);
    setLensTint(getDefaultTintForProduct(selectedProduct));
    setScaleMultiplier(1.0);
    setOffsetY(0);
  }, [selectedProduct]);

  // Camera & Tracking State
  const [cameraActive, setCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState({ pd: "63.0 mm", tilt: "0.0°", yaw: "0.0°" });

  // Refs for tracking pipeline (Mutable to eliminate stale closures)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraInstanceRef = useRef<any>(null);
  const faceMeshInstanceRef = useRef<any>(null);

  const selectedProductRef = useRef(selectedProduct);
  const frameColorRef = useRef(frameColor);
  const frameColorNameRef = useRef(frameColorName);
  const lensTintRef = useRef(lensTint);
  const scaleMultiplierRef = useRef(scaleMultiplier);
  const offsetYRef = useRef(offsetY);

  // EMA smoothing state for jitter-free tracking
  const smoothedRef = useRef<{
    x: number; y: number; roll: number; yaw: number; eyeDist: number;
  } | null>(null);
  const EMA_ALPHA = 0.35;

  // Synchronize refs on every render
  selectedProductRef.current = selectedProduct;
  frameColorRef.current = frameColor;
  frameColorNameRef.current = frameColorName;
  lensTintRef.current = lensTint;
  scaleMultiplierRef.current = scaleMultiplier;
  offsetYRef.current = offsetY;

  // MediaPipe Results Processing
  const onMediaPipeResults = (results: any) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }

    const w = canvas.width;
    const h = canvas.height;

    // Draw Mirrored Video Feed
    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(results.image, 0, 0, w, h);
    ctx.restore();

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];

      // Mirror X coordinates for screen positioning on mirrored video
      const getPt = (idx: number) => {
        const pt = landmarks[idx];
        if (!pt) return { x: w / 2, y: h / 2, z: 0 };
        return { x: (1 - pt.x) * w, y: pt.y * h, z: pt.z };
      };

      // Get RAW coordinates for roll angle
      const getRawPt = (idx: number) => {
        const pt = landmarks[idx];
        if (!pt) return { x: w / 2, y: h / 2, z: 0 };
        return { x: pt.x * w, y: pt.y * h, z: pt.z };
      };

      // Screen-space positions for placing the glasses overlay
      const noseBridgeScreen = getPt(168);
      const noseTipScreen = getPt(1);
      const eyeLeftScreen = getPt(263);   // anatomical left → screen left in mirror
      const eyeRightScreen = getPt(33);   // anatomical right → screen right in mirror

      const raw33 = getRawPt(33);
      const raw263 = getRawPt(263);
      const rawDx = raw263.x - raw33.x;
      const rawDy = raw263.y - raw33.y;
      const outerEyeDist = Math.sqrt(rawDx * rawDx + rawDy * rawDy);

      let rollAngle = Math.atan2(rawDy, rawDx);
      rollAngle = -rollAngle;
      const MAX_ROLL = Math.PI / 4;
      rollAngle = Math.max(-MAX_ROLL, Math.min(MAX_ROLL, rollAngle));

      const eyeCenterMidX = (eyeLeftScreen.x + eyeRightScreen.x) / 2;
      const yawRatio = Math.max(-0.6, Math.min(0.6, (noseTipScreen.x - eyeCenterMidX) / (outerEyeDist * 0.4)));

      const rawBridge = {
        x: noseBridgeScreen.x,
        y: noseBridgeScreen.y,
        roll: rollAngle,
        yaw: yawRatio,
        eyeDist: outerEyeDist * 1.82,
      };

      const prev = smoothedRef.current;
      const a = EMA_ALPHA;
      const bridgeCenter = prev ? {
        x: prev.x + a * (rawBridge.x - prev.x),
        y: prev.y + a * (rawBridge.y - prev.y),
        roll: prev.roll + a * (rawBridge.roll - prev.roll),
        yaw: prev.yaw + a * (rawBridge.yaw - prev.yaw),
        eyeDist: prev.eyeDist + a * (rawBridge.eyeDist - prev.eyeDist),
      } : rawBridge;
      smoothedRef.current = bridgeCenter;

      const currentProd = selectedProductRef.current;
      const activeShape = mapProductToShape(currentProd);

      // Draw Eyewear with photographic cutout & 3D pose
      drawProceduralEyewear(ctx, activeShape, {
        x: bridgeCenter.x,
        y: bridgeCenter.y + offsetYRef.current + bridgeCenter.eyeDist * 0.02,
        width: bridgeCenter.eyeDist * scaleMultiplierRef.current,
        roll: bridgeCenter.roll,
        yaw: bridgeCenter.yaw,
        frameColor: frameColorRef.current,
        frameColorName: frameColorNameRef.current,
        tintMode: lensTintRef.current,
        imageElement: activeImageRef.current,
        mirrored: false,
        earLeft: getPt(356),
        earRight: getPt(127),
      });

      // Update Telemetry
      const estPD = (61 + (outerEyeDist / w) * 8).toFixed(1);
      const tiltDeg = (bridgeCenter.roll * (180 / Math.PI)).toFixed(1);
      const yawDeg = (bridgeCenter.yaw * (180 / Math.PI)).toFixed(1);
      setTelemetry({ pd: `${estPD} mm`, tilt: `${tiltDeg}°`, yaw: `${yawDeg}°` });
    }
  };

  // AR Pipeline Initializer
  const startARPipeline = useCallback(async () => {
    setCameraError(null);
    setIsCameraLoading(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Webcam not available on this device or browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      await loadMediaPipeScripts();

      const FaceMeshConstructor = (window as any).FaceMesh;
      const CameraConstructor = (window as any).Camera;

      if (FaceMeshConstructor && CameraConstructor && videoRef.current) {
        const faceMesh = new FaceMeshConstructor({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults(onMediaPipeResults);
        faceMeshInstanceRef.current = faceMesh;

        const camera = new CameraConstructor(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && faceMeshInstanceRef.current) {
              await faceMeshInstanceRef.current.send({ image: videoRef.current });
            }
          },
          width: 1280,
          height: 720,
        });

        camera.start();
        cameraInstanceRef.current = camera;
        setCameraActive(true);
        setIsCameraLoading(false);
      } else {
        setCameraActive(true);
        setIsCameraLoading(false);
      }
    } catch (err: any) {
      setIsCameraLoading(false);
      setCameraActive(false);
      setCameraError(err?.message || "Camera access was denied or is unavailable.");
      toast.error("Camera unavailable", {
        description: "Please enable camera permissions to use the Live AR Mirror.",
      });
    }
  }, []);

  // Lifecycle Management - Start Camera immediately when modal opens
  useEffect(() => {
    if (open) {
      startARPipeline();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [open, startARPipeline]);

  // Snapshot Capture
  const captureSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const snap = document.createElement("canvas");
    snap.width = canvas.width;
    snap.height = canvas.height;
    const sctx = snap.getContext("2d");
    if (!sctx) return;

    sctx.drawImage(canvas, 0, 0);

    // Warm luxury Nayantara banner
    sctx.fillStyle = "rgba(252, 250, 247, 0.94)";
    sctx.fillRect(0, snap.height - 72, snap.width, 72);

    sctx.fillStyle = "#1e293b";
    sctx.font = "bold 20px 'Fraunces', serif";
    sctx.fillText(`NAYANTARA OPTICALS • ${selectedProduct.name.toUpperCase()}`, 24, snap.height - 30);

    sctx.fillStyle = "#64748b";
    sctx.font = "13px 'Outfit', sans-serif";
    sctx.fillText(
      `${selectedProduct.brand} | ${selectedProduct.style} | Finish: ${frameColorName} | ${inr(selectedProduct.price)}`,
      snap.width - 450,
      snap.height - 30
    );

    const a = document.createElement("a");
    a.download = `Nayantara-${selectedProduct.name.replace(/\s+/g, "-")}.png`;
    a.href = snap.toDataURL("image/png");
    a.click();
    toast.success("Snapshot saved!", {
      description: `Photo of ${selectedProduct.name} saved to your device.`,
    });
  };

  // Add to Bag directly from Try-On
  const handleAddToCart = () => {
    addToCart(selectedProduct, {
      color: frameColorName,
      lensPackage: lensTint === "bluelight" ? "blue-antiglare" : "single-vision",
    });
    toast.success(`${selectedProduct.name} added to bag!`, {
      description: `Finish: ${frameColorName} · ${inr(selectedProduct.price)}`,
    });
    onOpenChange(false);
  };

  const handleSelectColor = (hex: string, name: string) => {
    setFrameColor(hex);
    setFrameColorName(name);
    frameColorRef.current = hex;
    frameColorNameRef.current = name;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#FCFAF7] rounded-2xl sm:rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col lg:flex-row h-[94vh] max-h-[850px]">
        
        {/* Left: Dedicated Full-Height Camera AR Mirror */}
        <div className="relative flex-1 bg-stone-900 flex flex-col justify-between overflow-hidden min-h-[420px] border-b lg:border-b-0 lg:border-r border-stone-200">
          
          {/* Top Brand Header */}
          <div className="relative z-20 flex items-center justify-between gap-2 p-3 sm:p-4 bg-stone-900/75 backdrop-blur-md border-b border-white/10 text-white">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-white text-xs sm:text-sm tracking-wide">
                    NAYANTARA LIVE AR MIRROR
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {cameraActive ? "Live AR Active" : isCameraLoading ? "Starting Camera..." : "Camera Mode"}
                  </span>
                </div>
                <p className="text-[10.5px] text-stone-300">
                  {cameraActive
                    ? `Live Fitting: ${selectedProduct.name} (${selectedProduct.style})`
                    : "Precision optical try-on directly on your face"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close Mirror"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Canvas Viewport Frame */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black select-none">
            <video ref={videoRef} className="hidden" playsInline muted />
            <canvas ref={canvasRef} className="w-full h-full object-contain" />

            {/* Connecting Spinner / Initial Loader */}
            {isCameraLoading && (
              <div className="absolute inset-0 z-30 bg-stone-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                <p className="text-sm font-semibold text-white">
                  Starting Live Camera for <span className="text-amber-300">{selectedProduct.name}</span>...
                </p>
                <p className="text-xs text-stone-300">Please allow camera access and look directly at your screen</p>
              </div>
            )}

            {/* Camera Permission / Error Banner */}
            {cameraError && !isCameraLoading && (
              <div className="absolute inset-0 z-30 bg-stone-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
                <div className="w-14 h-14 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center mb-4 text-amber-400 shadow-lg">
                  <Camera className="h-7 w-7" />
                </div>
                <h4 className="font-display text-lg font-semibold mb-1 text-white">
                  Camera Access Required
                </h4>
                <p className="text-xs text-stone-300 max-w-sm mb-5 leading-relaxed">
                  Please grant camera permission in your browser to try on this frame live on your face in real-time.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => startARPipeline()}
                    className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Retry Camera
                  </button>
                  <a
                    href="/book"
                    onClick={() => onOpenChange(false)}
                    className="px-5 py-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs border border-stone-600 transition-all cursor-pointer"
                  >
                    Book In-Store Eye Test
                  </a>
                </div>
              </div>
            )}

            {/* Floating Available Colors Swatch Bar (Matching Reference Image 4) */}
            <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-lg">
              <span className="text-[9.5px] font-semibold text-stone-300 uppercase tracking-wider px-1">
                Colors
              </span>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  title="24K Royal Gold"
                  onClick={() => handleSelectColor("#d4af37", "24K Royal Gold")}
                  className={cn(
                    "w-6 h-6 rounded-full border transition-all flex items-center justify-center cursor-pointer shadow-xs",
                    frameColorName === "24K Royal Gold" ? "border-white ring-2 ring-amber-400 scale-110" : "border-white/20 opacity-80 hover:opacity-100"
                  )}
                  style={{ backgroundColor: "#d4af37" }}
                >
                  {frameColorName === "24K Royal Gold" && <Check className="h-3 w-3 text-black stroke-[3]" />}
                </button>

                <button
                  type="button"
                  title="Italian Tortoise"
                  onClick={() => handleSelectColor("#6f3d1e", "Italian Tortoise")}
                  className={cn(
                    "w-6 h-6 rounded-full border transition-all flex items-center justify-center cursor-pointer shadow-xs",
                    frameColorName === "Italian Tortoise" ? "border-white ring-2 ring-amber-400 scale-110" : "border-white/20 opacity-80 hover:opacity-100"
                  )}
                  style={{ backgroundColor: "#6f3d1e" }}
                >
                  {frameColorName === "Italian Tortoise" && <Check className="h-3 w-3 text-white stroke-[3]" />}
                </button>

                <button
                  type="button"
                  title="Matte Black Titanium"
                  onClick={() => handleSelectColor("#1c1d21", "Matte Black Titanium")}
                  className={cn(
                    "w-6 h-6 rounded-full border transition-all flex items-center justify-center cursor-pointer shadow-xs",
                    frameColorName === "Matte Black Titanium" ? "border-white ring-2 ring-amber-400 scale-110" : "border-white/20 opacity-80 hover:opacity-100"
                  )}
                  style={{ backgroundColor: "#1c1d21" }}
                >
                  {frameColorName === "Matte Black Titanium" && <Check className="h-3 w-3 text-white stroke-[3]" />}
                </button>

                <button
                  type="button"
                  title="Platinum Silver"
                  onClick={() => handleSelectColor("#cbd5e1", "Platinum Silver")}
                  className={cn(
                    "w-6 h-6 rounded-full border transition-all flex items-center justify-center cursor-pointer shadow-xs",
                    frameColorName === "Platinum Silver" ? "border-white ring-2 ring-amber-400 scale-110" : "border-white/20 opacity-80 hover:opacity-100"
                  )}
                  style={{ backgroundColor: "#cbd5e1" }}
                >
                  {frameColorName === "Platinum Silver" && <Check className="h-3 w-3 text-black stroke-[3]" />}
                </button>
              </div>
            </div>

            {/* Telemetry HUD Pill (Frosted Luxury Theme) */}
            <div className="absolute top-3 right-3 z-20 hidden sm:flex flex-col gap-1 bg-black/60 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10 text-[11px] font-mono text-stone-200 shadow-sm text-right">
              <div className="flex items-center justify-between gap-4">
                <span className="text-stone-400">FRAME:</span>
                <span className="text-white font-bold truncate max-w-[130px]">{selectedProduct.name}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-stone-400">FINISH:</span>
                <span className="text-amber-300 font-semibold">{frameColorName}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-stone-400">EST. PD:</span>
                <span className="text-white font-semibold">{telemetry.pd}</span>
              </div>
            </div>

            {/* Quick Floating Save Photo Action */}
            {cameraActive && (
              <button
                type="button"
                onClick={captureSnapshot}
                className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-2 bg-white/90 hover:bg-white text-stone-900 font-medium px-4 py-2 rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95 text-xs cursor-pointer"
                title="Save photo snapshot"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save Photo</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar: Dedicated Filters, Fit Calibration & Lens Options */}
        <div className="w-full lg:w-96 bg-white text-stone-900 border-t lg:border-t-0 lg:border-l border-stone-200 flex flex-col justify-between overflow-y-auto max-h-[50vh] lg:max-h-none p-5 lg:p-6 space-y-5">
          <div className="space-y-5">
            {/* Active Frame Header */}
            <div className="border-b border-stone-200 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-700">
                  {selectedProduct.category} · {selectedProduct.brand}
                </span>
                <span className="text-xs font-mono text-stone-500">
                  {selectedProduct.dimensions?.lensWidth || 52} □ {selectedProduct.dimensions?.bridge || 18} - {selectedProduct.dimensions?.templeLength || 145} mm
                </span>
              </div>
              <h3 className="font-display text-2xl font-semibold text-stone-900 mt-1">
                {selectedProduct.name}
              </h3>
              <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                {selectedProduct.description}
              </p>
              <div className="flex items-center gap-2.5 mt-2.5">
                <span className="text-2xl font-bold text-stone-900 font-display">{inr(selectedProduct.price)}</span>
                {selectedProduct.compareAt && (
                  <span className="text-xs text-stone-400 line-through">
                    {inr(selectedProduct.compareAt)}
                  </span>
                )}
                <span
                  className={cn(
                    "text-[10px] font-medium px-2.5 py-0.5 rounded-full ml-auto border",
                    selectedProduct.inStock
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : "bg-amber-50 text-amber-800 border-amber-300"
                  )}
                >
                  {selectedProduct.inStock ? "Ready in Showroom" : "Waitlist"}
                </span>
              </div>
            </div>

            {/* 1. Frame Finish Swatches */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-2">
                1. Frame Finish: <span className="text-stone-900 font-bold">{frameColorName}</span>
              </label>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  title="24K Royal Gold"
                  onClick={() => handleSelectColor("#d4af37", "24K Royal Gold")}
                  className={cn(
                    "w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer shadow-xs",
                    frameColorName === "24K Royal Gold" ? "border-stone-900 ring-2 ring-amber-400 scale-105" : "border-stone-200 hover:border-stone-400"
                  )}
                  style={{ backgroundColor: "#d4af37" }}
                >
                  {frameColorName === "24K Royal Gold" && <Check className="h-4 w-4 text-black stroke-[3]" />}
                </button>

                <button
                  type="button"
                  title="Italian Tortoise"
                  onClick={() => handleSelectColor("#6f3d1e", "Italian Tortoise")}
                  className={cn(
                    "w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer shadow-xs",
                    frameColorName === "Italian Tortoise" ? "border-stone-900 ring-2 ring-amber-400 scale-105" : "border-stone-200 hover:border-stone-400"
                  )}
                  style={{ backgroundColor: "#6f3d1e" }}
                >
                  {frameColorName === "Italian Tortoise" && <Check className="h-4 w-4 text-white stroke-[3]" />}
                </button>

                <button
                  type="button"
                  title="Matte Black Titanium"
                  onClick={() => handleSelectColor("#1c1d21", "Matte Black Titanium")}
                  className={cn(
                    "w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer shadow-xs",
                    frameColorName === "Matte Black Titanium" ? "border-stone-900 ring-2 ring-amber-400 scale-105" : "border-stone-200 hover:border-stone-400"
                  )}
                  style={{ backgroundColor: "#1c1d21" }}
                >
                  {frameColorName === "Matte Black Titanium" && <Check className="h-4 w-4 text-white stroke-[3]" />}
                </button>

                <button
                  type="button"
                  title="Platinum Silver"
                  onClick={() => handleSelectColor("#cbd5e1", "Platinum Silver")}
                  className={cn(
                    "w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer shadow-xs",
                    frameColorName === "Platinum Silver" ? "border-stone-900 ring-2 ring-amber-400 scale-105" : "border-stone-200 hover:border-stone-400"
                  )}
                  style={{ backgroundColor: "#cbd5e1" }}
                >
                  {frameColorName === "Platinum Silver" && <Check className="h-4 w-4 text-black stroke-[3]" />}
                </button>
              </div>
            </div>

            {/* 2. Lens Optical Coating */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-2">
                2. Lens Optical Coating
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLensTint("clear")}
                  className={cn(
                    "p-2 rounded-xl border text-center transition-all cursor-pointer shadow-xs",
                    lensTint === "clear"
                      ? "bg-stone-900 text-white border-stone-900 font-semibold"
                      : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                  )}
                >
                  <div className="text-xs">Clear</div>
                  <div className="text-[10px] opacity-75">Optical</div>
                </button>

                <button
                  type="button"
                  onClick={() => setLensTint("bluelight")}
                  className={cn(
                    "p-2 rounded-xl border text-center transition-all cursor-pointer shadow-xs",
                    lensTint === "bluelight"
                      ? "bg-stone-900 text-white border-stone-900 font-semibold"
                      : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                  )}
                >
                  <div className="text-xs">Blue Light</div>
                  <div className="text-[10px] opacity-75">Screen Guard</div>
                </button>

                <button
                  type="button"
                  onClick={() => setLensTint("sunset")}
                  className={cn(
                    "p-2 rounded-xl border text-center transition-all cursor-pointer shadow-xs",
                    lensTint === "sunset"
                      ? "bg-stone-900 text-white border-stone-900 font-semibold"
                      : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                  )}
                >
                  <div className="text-xs">Amber Tint</div>
                  <div className="text-[10px] opacity-75">UV400</div>
                </button>
              </div>
            </div>

            {/* 3. Fit Calibration Controls */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-stone-500" />
                  Fit Calibration
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setScaleMultiplier(1.0);
                    setOffsetY(0);
                  }}
                  className="text-[11px] text-amber-700 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              </div>

              {/* Scale Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-stone-600">
                  <span>Frame Width</span>
                  <span className="font-mono font-medium">{Math.round(scaleMultiplier * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.85"
                  max="1.25"
                  step="0.01"
                  value={scaleMultiplier}
                  onChange={(e) => setScaleMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-stone-900 cursor-pointer"
                />
              </div>

              {/* Vertical Height Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-stone-600">
                  <span>Nose Bridge Height</span>
                  <span className="font-mono font-medium">{offsetY > 0 ? `+${offsetY}` : offsetY} px</span>
                </div>
                <input
                  type="range"
                  min="-25"
                  max="25"
                  step="1"
                  value={offsetY}
                  onChange={(e) => setOffsetY(parseInt(e.target.value, 10))}
                  className="w-full accent-stone-900 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3.5 rounded-full shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Add to Bag • {inr(selectedProduct.price)}</span>
            </button>

            <a
              href="/book"
              onClick={() => onOpenChange(false)}
              className="w-full block text-center border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium py-2 rounded-full text-xs transition-colors"
            >
              Book In-Store Eye Test in Uttam Nagar
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
