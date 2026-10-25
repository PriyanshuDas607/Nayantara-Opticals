import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Camera,
  X,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  Sliders,
  Check,
  Download,
  Info,
  Maximize2,
  Scan,
  Sun,
  Eye,
  Hand,
  Layers,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PRODUCTS, type Product } from "@/data/catalog";
import { inr } from "@/lib/site";
import { useShop } from "@/store/shop";
import { cn } from "@/lib/utils";

// Types
export type FrameShape = "round" | "aviator" | "wayfarer" | "square" | "rectangle" | "cateye" | "clubmaster" | "hexagon" | "rimless";
export type LensTint = "clear" | "dark" | "bluelight" | "sunset";

export interface VirtualTryOnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialProductId?: string;
  allProducts?: Product[];
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

  if (lower.includes("gold")) return { hex: "#d4af37", name: colName };
  if (lower.includes("tortoise") || lower.includes("amber")) return { hex: "#6f3d1e", name: colName };
  if (lower.includes("matte black") || lower.includes("black") || lower.includes("ink")) return { hex: "#1c1d21", name: colName };
  if (lower.includes("silver") || lower.includes("gunmetal") || lower.includes("titanium")) return { hex: "#cbd5e1", name: colName };
  if (lower.includes("rose") || lower.includes("champagne")) return { hex: "#e6a89c", name: colName };
  return { hex: "#d4af37", name: colName };
}

// Procedural vector rendering engine for 3D Eyewear
export function drawProceduralEyewear(
  ctx: CanvasRenderingContext2D,
  shape: FrameShape,
  options: {
    x?: number;
    y?: number;
    width?: number;
    roll?: number;
    yaw?: number;
    frameColor?: string;
    tintMode?: LensTint;
    drawTemples?: boolean;
    imageElement?: HTMLImageElement | null;
  } = {}
) {
  const {
    x = 0,
    y = 0,
    width = 240,
    roll = 0,
    yaw = 0,
    frameColor = "#d4af37",
    tintMode = "clear",
    drawTemples = true,
    imageElement = null,
  } = options;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(roll);

  const perspectiveScaleX = Math.max(0.78, 1 - Math.abs(yaw) * 0.18);
  const yawShiftX = yaw * width * 0.08;
  ctx.translate(yawShiftX, 0);
  ctx.scale(perspectiveScaleX, 1);

  // If a pre-processed transparent frame image is available, draw that directly with 3D pose
  if (imageElement && imageElement.complete && imageElement.naturalWidth > 0) {
    const imgH = (imageElement.naturalHeight / imageElement.naturalWidth) * width;
    ctx.drawImage(imageElement, -width / 2, -imgH * 0.48, width, imgH);
    ctx.restore();
    return;
  }

  // Calculate lens dimensions tailored strictly to the shape
  const lensW =
    shape === "rectangle" ? width * 0.43 :
    shape === "aviator" ? width * 0.42 :
    shape === "cateye" ? width * 0.41 :
    shape === "round" ? width * 0.39 : width * 0.40;

  const lensH =
    shape === "rectangle" ? lensW * 0.60 : // Slim elegant rectangular rim (e.g. Meridian Gold)
    shape === "round" ? lensW * 0.94 :     // Perfect vintage circular rim (e.g. Aurelia Round)
    shape === "aviator" ? lensW * 0.88 :   // Teardrop pilot curve (e.g. Solstice Aviator)
    shape === "cateye" ? lensW * 0.75 :    // Winged lift (e.g. Amber Cat-Eye)
    shape === "square" ? lensW * 0.84 :    // Squared proportions (e.g. Graphite Squareline)
    shape === "rimless" ? lensW * 0.64 : lensW * 0.74;

  const bridgeW = width * 0.14;
  const leftCenterX = -(bridgeW / 2 + lensW / 2);
  const rightCenterX = bridgeW / 2 + lensW / 2;

  // 1. Temple Arms (connecting to ear with 3D perspective)
  if (drawTemples) {
    ctx.save();
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = shape === "rectangle" ? Math.max(2, width * 0.013) : Math.max(2.8, width * 0.017);
    ctx.lineCap = "round";

    const leftHingeX = leftCenterX - lensW / 2;
    const leftEarX = leftHingeX - width * (0.1 - yaw * 0.12);
    const leftEarY = -lensH * 0.15;
    ctx.beginPath();
    ctx.moveTo(leftHingeX, -lensH * 0.22);
    ctx.quadraticCurveTo(leftEarX, leftEarY - 6, leftEarX - 8, leftEarY + 14);
    ctx.stroke();

    const rightHingeX = rightCenterX + lensW / 2;
    const rightEarX = rightHingeX + width * (0.1 + yaw * 0.12);
    const rightEarY = -lensH * 0.15;
    ctx.beginPath();
    ctx.moveTo(rightHingeX, -lensH * 0.22);
    ctx.quadraticCurveTo(rightEarX, rightEarY - 6, rightEarX + 8, rightEarY + 14);
    ctx.stroke();
    ctx.restore();
  }

  function traceLensPath(cx: number, cy: number, w: number, h: number, isRightLens: boolean) {
    const dir = isRightLens ? 1 : -1;
    const hw = w / 2;
    const hh = h / 2;
    ctx.beginPath();

    if (shape === "round") {
      ctx.ellipse(cx, cy, hw * 0.94, hh * 0.94, 0, 0, Math.PI * 2);
    } else if (shape === "aviator") {
      // Classic Pilot Teardrop
      ctx.moveTo(cx - hw * 0.92, cy - hh * 0.68);
      ctx.quadraticCurveTo(cx, cy - hh * 0.85, cx + hw * 0.92, cy - hh * 0.65);
      ctx.bezierCurveTo(
        cx + dir * hw * 1.12,
        cy + hh * 0.15,
        cx + dir * hw * 0.55,
        cy + hh * 1.15,
        cx - dir * hw * 0.15,
        cy + hh * 1.02
      );
      ctx.bezierCurveTo(
        cx - dir * hw * 0.88,
        cy + hh * 0.85,
        cx - dir * hw * 1.0,
        cy - hh * 0.1,
        cx - hw * 0.92,
        cy - hh * 0.68
      );
      ctx.closePath();
    } else if (shape === "cateye") {
      // Dramatic Swept-Up Winged Corners
      const outerX = cx + dir * hw * 1.12;
      const innerX = cx - dir * hw * 0.88;
      ctx.moveTo(innerX, cy - hh * 0.35);
      ctx.quadraticCurveTo(cx, cy - hh * 0.78, outerX, cy - hh * 1.05);
      ctx.quadraticCurveTo(outerX - dir * hw * 0.08, cy + hh * 0.72, cx, cy + hh * 0.88);
      ctx.quadraticCurveTo(innerX, cy + hh * 0.78, innerX, cy - hh * 0.35);
      ctx.closePath();
    } else if (shape === "rectangle") {
      // Slim Executive Rectangular Metal Rims (Meridian Gold)
      const r = 6;
      ctx.roundRect(cx - hw, cy - hh * 0.85, w, h * 0.90, [r, r, r * 1.2, r * 1.2]);
    } else if (shape === "square") {
      // Bold Square Titanium/Acetate Rims (Graphite Squareline)
      const r = 9;
      ctx.roundRect(cx - hw, cy - hh * 0.82, w, h * 0.92, [r, r, r * 1.3, r * 1.3]);
    } else if (shape === "hexagon") {
      const pts = [
        [cx - hw * 0.75, cy - hh * 0.78],
        [cx + hw * 0.75, cy - hh * 0.78],
        [cx + hw * 1.0, cy - hh * 0.05],
        [cx + hw * 0.68, cy + hh * 0.85],
        [cx - hw * 0.68, cy + hh * 0.85],
        [cx - hw * 1.0, cy - hh * 0.05],
      ];
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
    } else {
      // Wayfarer Default
      const r = w * 0.18;
      ctx.roundRect(cx - hw, cy - hh * 0.82, w, h * 0.92, [r * 0.6, r * 0.6, r * 1.4, r * 1.4]);
    }
  }

  // 2. Lenses + Rims
  [
    { cx: leftCenterX, isRight: false },
    { cx: rightCenterX, isRight: true },
  ].forEach((lens) => {
    ctx.save();
    traceLensPath(lens.cx, lensH * 0.06, lensW, lensH, lens.isRight);

    ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
    ctx.shadowBlur = width * 0.045;
    ctx.shadowOffsetY = width * 0.022;

    const lensGrad = ctx.createLinearGradient(lens.cx, -lensH / 2, lens.cx, lensH / 2);
    if (tintMode === "dark") {
      lensGrad.addColorStop(0, "rgba(15, 20, 26, 0.90)");
      lensGrad.addColorStop(1, "rgba(35, 44, 54, 0.76)");
    } else if (tintMode === "bluelight") {
      lensGrad.addColorStop(0, "rgba(56, 189, 248, 0.28)");
      lensGrad.addColorStop(0.5, "rgba(129, 140, 248, 0.18)");
      lensGrad.addColorStop(1, "rgba(255, 255, 255, 0.08)");
    } else if (tintMode === "sunset") {
      lensGrad.addColorStop(0, "rgba(180, 58, 95, 0.78)");
      lensGrad.addColorStop(0.6, "rgba(234, 138, 85, 0.58)");
      lensGrad.addColorStop(1, "rgba(253, 210, 140, 0.32)");
    } else {
      lensGrad.addColorStop(0, "rgba(255, 255, 255, 0.20)");
      lensGrad.addColorStop(1, "rgba(200, 230, 255, 0.06)");
    }
    ctx.fillStyle = lensGrad;
    ctx.fill();
    ctx.shadowColor = "transparent";

    // Specular Reflection Glare
    ctx.save();
    ctx.clip();
    ctx.fillStyle = tintMode === "bluelight" ? "rgba(165, 243, 252, 0.32)" : "rgba(255, 255, 255, 0.24)";
    ctx.beginPath();
    ctx.moveTo(lens.cx - lensW * 0.35, -lensH * 0.5);
    ctx.lineTo(lens.cx - lensW * 0.08, -lensH * 0.5);
    ctx.lineTo(lens.cx - lensW * 0.42, lensH * 0.6);
    ctx.lineTo(lens.cx - lensW * 0.65, lensH * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Outer Rim Stroke (tailored to frame style)
    traceLensPath(lens.cx, lensH * 0.06, lensW, lensH, lens.isRight);
    if (shape === "rectangle") {
      // Whisper-thin metal wire (Meridian Gold)
      ctx.lineWidth = Math.max(2.2, width * 0.016);
      ctx.strokeStyle = frameColor;
      ctx.stroke();
    } else if (shape === "aviator") {
      // Thin metal rim
      ctx.lineWidth = Math.max(2.4, width * 0.018);
      ctx.strokeStyle = frameColor;
      ctx.stroke();
    } else if (shape === "cateye") {
      // Bold upswept acetate rim
      ctx.lineWidth = Math.max(4.2, width * 0.038);
      ctx.strokeStyle = frameColor;
      ctx.stroke();
    } else if (shape === "round") {
      // Substantial round rim
      ctx.lineWidth = Math.max(3.8, width * 0.034);
      ctx.strokeStyle = frameColor;
      ctx.stroke();
    } else if (shape === "square") {
      // Bold titanium / acetate rim
      ctx.lineWidth = Math.max(4.0, width * 0.036);
      ctx.strokeStyle = frameColor;
      ctx.stroke();
    } else {
      ctx.lineWidth = Math.max(2.8, width * 0.022);
      ctx.strokeStyle = frameColor;
      ctx.stroke();
    }
    ctx.restore();
  });

  // 3. Nose Bridge & Aviator Top Brow Bar
  ctx.save();
  ctx.strokeStyle = shape === "clubmaster" ? "#d4af37" : frameColor;
  ctx.lineCap = "round";
  ctx.lineWidth = shape === "rectangle" ? Math.max(2.2, width * 0.016) : Math.max(2.8, width * 0.020);

  ctx.beginPath();
  if (shape === "round") {
    // High arched keyhole bridge
    ctx.moveTo(-bridgeW * 0.62, -lensH * 0.14);
    ctx.quadraticCurveTo(0, -lensH * 0.42, bridgeW * 0.62, -lensH * 0.14);
  } else {
    ctx.moveTo(-bridgeW * 0.62, -lensH * 0.16);
    ctx.quadraticCurveTo(0, -lensH * 0.32, bridgeW * 0.62, -lensH * 0.16);
  }
  ctx.stroke();

  // Aviator Signature Double Brow Bar
  if (shape === "aviator") {
    ctx.lineWidth = Math.max(2.4, width * 0.016);
    ctx.beginPath();
    ctx.moveTo(leftCenterX + lensW * 0.14, -lensH * 0.40);
    ctx.lineTo(rightCenterX - lensW * 0.14, -lensH * 0.40);
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}

// Stylized Interactive 3D Human Portrait Generator
function renderStylizedPortrait(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: {
    yaw: number;
    roll: number;
    scale: number;
    offsetY: number;
    frameShape: FrameShape;
    frameColor: string;
    tintMode: LensTint;
    showMesh: boolean;
  }
) {
  ctx.clearRect(0, 0, w, h);

  // Background Studio Gradient
  const bgGrad = ctx.createRadialGradient(w / 2, h * 0.45, 30, w / 2, h / 2, w * 0.7);
  bgGrad.addColorStop(0, "#242936");
  bgGrad.addColorStop(1, "#0c0e14");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2 + params.yaw * 18;
  const cy = h * 0.48;
  const headRadiusX = Math.min(w, h) * 0.25;
  const headRadiusY = headRadiusX * 1.28;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(params.roll);

  // Neck & Shoulders
  ctx.fillStyle = "#c89d7d";
  ctx.fillRect(-headRadiusX * 0.42, headRadiusY * 0.65, headRadiusX * 0.84, headRadiusY * 0.6);

  ctx.fillStyle = "#181b24";
  ctx.beginPath();
  ctx.ellipse(0, headRadiusY * 1.32, headRadiusX * 1.65, headRadiusY * 0.55, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Ears
  const earOffset = params.yaw * 12;
  ctx.fillStyle = "#d4a989";
  ctx.beginPath();
  ctx.ellipse(-headRadiusX * 0.98 + earOffset, 0, headRadiusX * 0.13, headRadiusY * 0.22, -0.1, 0, Math.PI * 2);
  ctx.ellipse(headRadiusX * 0.98 + earOffset, 0, headRadiusX * 0.13, headRadiusY * 0.22, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Face Contour
  const faceGrad = ctx.createRadialGradient(-headRadiusX * 0.2, -headRadiusY * 0.2, 10, 0, 0, headRadiusY);
  faceGrad.addColorStop(0, "#f1ccb0");
  faceGrad.addColorStop(0.7, "#dfb08f");
  faceGrad.addColorStop(1, "#b88767");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, headRadiusX, headRadiusY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = "#171515";
  ctx.beginPath();
  ctx.arc(0, -headRadiusY * 0.18, headRadiusX * 1.04, Math.PI * 0.92, Math.PI * 2.08);
  ctx.quadraticCurveTo(headRadiusX * 0.6, -headRadiusY * 0.68, 0, -headRadiusY * 0.62);
  ctx.quadraticCurveTo(-headRadiusX * 0.6, -headRadiusY * 0.68, -headRadiusX * 1.03, -headRadiusY * 0.12);
  ctx.fill();

  const featureShiftX = params.yaw * headRadiusX * 0.25;
  const eyeY = -headRadiusY * 0.08;
  const eyeSpacing = headRadiusX * 0.44;

  // Eyebrows & Eyes
  ctx.strokeStyle = "#2b211b";
  ctx.lineWidth = 4.5;
  ctx.lineCap = "round";
  [-1, 1].forEach((dir) => {
    const ex = dir * eyeSpacing + featureShiftX;
    ctx.beginPath();
    ctx.moveTo(ex - dir * 20, eyeY - headRadiusY * 0.11);
    ctx.quadraticCurveTo(ex, eyeY - headRadiusY * 0.18, ex + dir * 22, eyeY - headRadiusY * 0.11);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(ex, eyeY, headRadiusX * 0.16, headRadiusY * 0.065, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#4a3222";
    ctx.beginPath();
    ctx.arc(ex + params.yaw * 3, eyeY, headRadiusY * 0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#090a0f";
    ctx.beginPath();
    ctx.arc(ex + params.yaw * 3, eyeY, headRadiusY * 0.025, 0, Math.PI * 2);
    ctx.fill();
  });

  // Nose
  ctx.strokeStyle = "rgba(145, 98, 68, 0.55)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(featureShiftX, eyeY - 4);
  ctx.lineTo(featureShiftX * 1.15, headRadiusY * 0.22);
  ctx.quadraticCurveTo(featureShiftX, headRadiusY * 0.27, featureShiftX - 8, headRadiusY * 0.23);
  ctx.stroke();

  // Lips
  ctx.strokeStyle = "#a85d54";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-headRadiusX * 0.24 + featureShiftX * 0.8, headRadiusY * 0.48);
  ctx.quadraticCurveTo(featureShiftX * 0.8, headRadiusY * 0.54, headRadiusX * 0.24 + featureShiftX * 0.8, headRadiusY * 0.48);
  ctx.stroke();

  // Mesh Dots Overlay
  if (params.showMesh) {
    ctx.fillStyle = "rgba(212, 175, 55, 0.85)";
    [
      [featureShiftX, eyeY],
      [-eyeSpacing * 1.35 + featureShiftX, eyeY],
      [eyeSpacing * 1.35 + featureShiftX, eyeY],
      [-headRadiusX * 0.92, eyeY],
      [headRadiusX * 0.92, eyeY],
      [featureShiftX, headRadiusY * 0.22],
    ].forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(px, py, 3.2, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  ctx.restore();

  const bridgeWorldX = cx + Math.cos(params.roll) * featureShiftX - Math.sin(params.roll) * (eyeY + params.offsetY);
  const bridgeWorldY = cy + Math.sin(params.roll) * featureShiftX + Math.cos(params.roll) * (eyeY + params.offsetY);

  drawProceduralEyewear(ctx, params.frameShape, {
    x: bridgeWorldX,
    y: bridgeWorldY,
    width: headRadiusX * 2.08 * params.scale,
    roll: params.roll,
    yaw: params.yaw,
    frameColor: params.frameColor,
    tintMode: params.tintMode,
  });
}

// MediaPipe Script Loader
let scriptsLoadingPromise: Promise<void> | null = null;
function loadMediaPipeScripts(): Promise<void> {
  if (scriptsLoadingPromise) return scriptsLoadingPromise;
  if ((window as any).FaceMesh) return Promise.resolve();

  scriptsLoadingPromise = new Promise((resolve) => {
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
        s.onerror = () => res(); // fallback gracefully
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

  // Filter only wearable eyewear (eyeglasses and sunglasses)
  const availableFrames = useMemo(() => {
    return allProducts.filter(
      (p) => p.category === "eyeglasses" || p.category === "sunglasses"
    );
  }, [allProducts]);

  // Active Category Filter inside AR Studio
  const [categoryFilter, setCategoryFilter] = useState<"all" | "eyeglasses" | "sunglasses">("all");

  const filteredFrames = useMemo(() => {
    if (categoryFilter === "all") return availableFrames;
    return availableFrames.filter((f) => f.category === categoryFilter);
  }, [availableFrames, categoryFilter]);

  // Selected frame
  const [selectedProduct, setSelectedProduct] = useState<Product>(() => {
    if (initialProductId) {
      const match = availableFrames.find(
        (p) => p.id === initialProductId || p.slug === initialProductId || p.name.toLowerCase() === initialProductId.toLowerCase()
      );
      if (match) return match;
    }
    return availableFrames[0] || PRODUCTS[0];
  });

  // Frame Customization State
  const [frameColor, setFrameColor] = useState<string>("#d4af37");
  const [frameColorName, setFrameColorName] = useState<string>("24K Royal Gold");
  const [lensTint, setLensTint] = useState<LensTint>("clear");
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(1.0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  // Sync selected frame & its default styling whenever initialProductId or open changes
  useEffect(() => {
    if (open && initialProductId) {
      const match = availableFrames.find(
        (p) => p.id === initialProductId || p.slug === initialProductId || p.name.toLowerCase() === initialProductId.toLowerCase()
      );
      if (match) {
        setSelectedProduct(match);
        const col = getDefaultColorForProduct(match);
        setFrameColor(col.hex);
        setFrameColorName(col.name);
        setLensTint(getDefaultTintForProduct(match));
        setFlashMessage(`Loaded: ${match.name} (${match.style})`);
        setTimeout(() => setFlashMessage(null), 2500);
      }
    }
  }, [initialProductId, open, availableFrames]);

  // Camera & Tracking State
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [showMeshOverlay, setShowMeshOverlay] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(true);
  const [telemetry, setTelemetry] = useState<{ pd: string; tilt: string; yaw: string }>({
    pd: "63.0 mm",
    tilt: "0.0°",
    yaw: "0.0°",
  });

  // Dynamic Refs to eliminate stale closure values inside 60 FPS FaceMesh callbacks
  const selectedProductRef = useRef(selectedProduct);
  selectedProductRef.current = selectedProduct;

  const frameColorRef = useRef(frameColor);
  frameColorRef.current = frameColor;

  const lensTintRef = useRef(lensTint);
  lensTintRef.current = lensTint;

  const scaleMultiplierRef = useRef(scaleMultiplier);
  scaleMultiplierRef.current = scaleMultiplier;

  const offsetYRef = useRef(offsetY);
  offsetYRef.current = offsetY;

  const showMeshOverlayRef = useRef(showMeshOverlay);
  showMeshOverlayRef.current = showMeshOverlay;

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const faceMeshRef = useRef<any>(null);
  const smoothedPoseRef = useRef({ x: 320, y: 220, eyeDist: 110, roll: 0, yaw: 0, initialized: false });
  const demoHeadRef = useRef({ yaw: 0, roll: 0, isDragging: false, lastX: 0, lastY: 0, autoTime: 0 });

  // Handle Dragging in Demo Portrait Mode
  const handlePointerDown = (clientX: number, clientY: number) => {
    if (!isDemoMode) return;
    demoHeadRef.current.isDragging = true;
    demoHeadRef.current.lastX = clientX;
    demoHeadRef.current.lastY = clientY;
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDemoMode || !demoHeadRef.current.isDragging) return;
    const dx = clientX - demoHeadRef.current.lastX;
    const dy = clientY - demoHeadRef.current.lastY;
    demoHeadRef.current.yaw = Math.max(-0.65, Math.min(0.65, demoHeadRef.current.yaw + dx * 0.005));
    demoHeadRef.current.roll = Math.max(-0.35, Math.min(0.35, demoHeadRef.current.roll + dy * 0.003));
    demoHeadRef.current.lastX = clientX;
    demoHeadRef.current.lastY = clientY;
  };

  const handlePointerUp = () => {
    demoHeadRef.current.isDragging = false;
  };

  // Switch Frame in Carousel
  const handleSelectFrame = (frame: Product) => {
    setSelectedProduct(frame);
    selectedProductRef.current = frame;

    const col = getDefaultColorForProduct(frame);
    setFrameColor(col.hex);
    frameColorRef.current = col.hex;
    setFrameColorName(col.name);

    const tint = getDefaultTintForProduct(frame);
    setLensTint(tint);
    lensTintRef.current = tint;

    setFlashMessage(`Loaded: ${frame.name} (${frame.style})`);
    setTimeout(() => setFlashMessage(null), 2500);
  };

  // Start MediaPipe + Camera
  const startARPipeline = useCallback(async () => {
    if (!open) return;
    setIsCameraLoading(true);

    // Load scripts
    await loadMediaPipeScripts();

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = 960;
    canvas.height = 720;

    // If Demo Mode requested, start portrait loop
    if (isDemoMode) {
      setIsCameraLoading(false);
      startDemoPortraitLoop();
      return;
    }

    try {
      // Initialize FaceMesh if available
      const FaceMeshClass = (window as any).FaceMesh;
      if (FaceMeshClass && !faceMeshRef.current) {
        const fm = new FaceMeshClass({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });
        fm.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.55,
          minTrackingConfidence: 0.55,
        });
        fm.onResults((results: any) => onMediaPipeResults(results));
        faceMeshRef.current = fm;
      }

      // Request User Media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();

      setCameraActive(true);
      setIsCameraLoading(false);

      const processFrame = async () => {
        if (!open) return;
        if (video.readyState >= 2 && faceMeshRef.current) {
          try {
            await faceMeshRef.current.send({ image: video });
          } catch {
            renderWebcamFallback(video, canvas);
          }
        } else if (video.readyState >= 2) {
          renderWebcamFallback(video, canvas);
        }
        animFrameRef.current = requestAnimationFrame(processFrame);
      };

      processFrame();
    } catch {
      // Camera denied or unavailable -> switch to 3D Demo Portrait mode
      setIsDemoMode(true);
      setIsCameraLoading(false);
    }
  }, [open, isDemoMode]);

  // Demo Portrait Loop (Uses dynamic refs for instant frame/color updates)
  const startDemoPortraitLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      if (!open) return;
      if (!demoHeadRef.current.isDragging) {
        demoHeadRef.current.autoTime += 0.022;
        demoHeadRef.current.yaw = Math.sin(demoHeadRef.current.autoTime) * 0.28;
        demoHeadRef.current.roll = Math.cos(demoHeadRef.current.autoTime * 0.7) * 0.05;
      }

      const currentProd = selectedProductRef.current;
      const activeShape = mapProductToShape(currentProd);

      renderStylizedPortrait(ctx, canvas.width, canvas.height, {
        yaw: demoHeadRef.current.yaw,
        roll: demoHeadRef.current.roll,
        scale: scaleMultiplierRef.current,
        offsetY: offsetYRef.current,
        frameShape: activeShape,
        frameColor: frameColorRef.current,
        tintMode: lensTintRef.current,
        showMesh: showMeshOverlayRef.current,
      });

      setTelemetry({
        pd: "63.0 mm",
        tilt: `${(demoHeadRef.current.roll * (180 / Math.PI)).toFixed(1)}°`,
        yaw: `${(demoHeadRef.current.yaw * (180 / Math.PI)).toFixed(1)}°`,
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();
  }, [open]);

  // Handle FaceMesh Results (Always reads current refs for instant reaction)
  const onMediaPipeResults = (results: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Draw webcam mirrored
    ctx.save();
    ctx.clearRect(0, 0, w, h);
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(results.image, 0, 0, w, h);
    ctx.restore();

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      const noseBridge = landmarks[168];
      const leftEyeOuter = landmarks[33];
      const rightEyeOuter = landmarks[263];
      const leftTemple = landmarks[234];
      const rightTemple = landmarks[454];

      const bx = (1 - noseBridge.x) * w;
      const by = noseBridge.y * h;

      const screenLeftEyeX = (1 - rightEyeOuter.x) * w;
      const screenLeftEyeY = rightEyeOuter.y * h;
      const screenRightEyeX = (1 - leftEyeOuter.x) * w;
      const screenRightEyeY = leftEyeOuter.y * h;

      const screenLeftTempleX = (1 - rightTemple.x) * w;
      const screenRightTempleX = (1 - leftTemple.x) * w;

      const outerEyeDist = Math.hypot(screenRightEyeX - screenLeftEyeX, screenRightEyeY - screenLeftEyeY);
      const templeDist = Math.abs(screenRightTempleX - screenLeftTempleX);
      const rollAngle = Math.atan2(screenRightEyeY - screenLeftEyeY, screenRightEyeX - screenLeftEyeX);

      const distToLeftTemple = Math.abs(bx - screenLeftTempleX);
      const distToRightTemple = Math.abs(screenRightTempleX - bx);
      const rawYaw = (distToRightTemple - distToLeftTemple) / Math.max(1, distToRightTemple + distToLeftTemple);

      const alpha = 0.45;
      const targetWidth = Math.max(outerEyeDist * 1.48, templeDist * 1.05);

      const pose = smoothedPoseRef.current;
      if (!pose.initialized) {
        smoothedPoseRef.current = { x: bx, y: by, eyeDist: targetWidth, roll: rollAngle, yaw: rawYaw, initialized: true };
      } else {
        pose.x = pose.x * (1 - alpha) + bx * alpha;
        pose.y = pose.y * (1 - alpha) + by * alpha;
        pose.eyeDist = pose.eyeDist * (1 - alpha) + targetWidth * alpha;
        pose.roll = pose.roll * (1 - alpha) + rollAngle * alpha;
        pose.yaw = pose.yaw * (1 - alpha) + rawYaw * alpha;
      }

      // Draw Face Landmark Points if toggled
      if (showMeshOverlayRef.current) {
        ctx.fillStyle = "rgba(212, 175, 55, 0.75)";
        for (let i = 0; i < landmarks.length; i += 2) {
          const lx = (1 - landmarks[i].x) * w;
          const ly = landmarks[i].y * h;
          ctx.beginPath();
          ctx.arc(lx, ly, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Read current product and draw its distinct shape in real-time
      const currentProd = selectedProductRef.current;
      const activeShape = mapProductToShape(currentProd);

      drawProceduralEyewear(ctx, activeShape, {
        x: pose.x,
        y: pose.y + offsetYRef.current + pose.eyeDist * 0.04,
        width: pose.eyeDist * scaleMultiplierRef.current,
        roll: pose.roll,
        yaw: pose.yaw,
        frameColor: frameColorRef.current,
        tintMode: lensTintRef.current,
      });

      // Update Telemetry
      const estPD = (61 + (outerEyeDist / w) * 8).toFixed(1);
      const tiltDeg = (pose.roll * (180 / Math.PI)).toFixed(1);
      const yawDeg = (pose.yaw * (180 / Math.PI)).toFixed(1);
      setTelemetry({ pd: `${estPD} mm`, tilt: `${tiltDeg}°`, yaw: `${yawDeg}°` });
    }
  };

  // Fallback when landmarks aren't detected
  const renderWebcamFallback = (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const currentProd = selectedProductRef.current;
    const activeShape = mapProductToShape(currentProd);
    drawProceduralEyewear(ctx, activeShape, {
      x: canvas.width / 2,
      y: canvas.height * 0.45 + offsetYRef.current,
      width: 260 * scaleMultiplierRef.current,
      roll: 0,
      yaw: 0,
      frameColor: frameColorRef.current,
      tintMode: lensTintRef.current,
    });
  };

  // Lifecycle
  useEffect(() => {
    if (open) {
      startARPipeline();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      setCameraActive(false);
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [open, isDemoMode, startARPipeline]);

  // Take Snapshot
  const captureSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const snap = document.createElement("canvas");
    snap.width = canvas.width;
    snap.height = canvas.height;
    const sctx = snap.getContext("2d");
    if (!sctx) return;

    sctx.drawImage(canvas, 0, 0);

    // Add Elegant Branding Bar
    sctx.fillStyle = "rgba(11, 12, 16, 0.88)";
    sctx.fillRect(0, snap.height - 72, snap.width, 72);

    sctx.fillStyle = "#d4af37";
    sctx.font = "bold 22px 'Outfit', sans-serif";
    sctx.fillText(`NAYANTARA OPTICALS • ${selectedProduct.name.toUpperCase()}`, 24, snap.height - 30);

    sctx.fillStyle = "#cbd5e1";
    sctx.font = "14px 'Outfit', sans-serif";
    sctx.fillText(
      `${selectedProduct.brand} | ${selectedProduct.style} | Finish: ${frameColorName} | ${inr(selectedProduct.price)}`,
      snap.width - 440,
      snap.height - 30
    );

    const a = document.createElement("a");
    a.download = `Nayantara-TryOn-${selectedProduct.name.replace(/\s+/g, "-")}.png`;
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-[#0e1015] sm:rounded-3xl border border-white/15 shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-screen sm:min-h-[85vh] max-h-screen">
        {/* Left / Center AR Viewport */}
        <div className="relative flex-1 bg-black flex flex-col justify-between overflow-hidden min-h-[460px]">
          {/* Top HUD Floating Bar */}
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "w-2.5 h-2.5 rounded-full animate-pulse",
                  cameraActive ? "bg-emerald-400" : "bg-amber-400"
                )}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-xs sm:text-sm tracking-wide">
                    NAYANTARA 3D AR MIRROR
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    {cameraActive ? "468-Pt Live AR" : isDemoMode ? "Interactive 3D Demo" : "Connecting..."}
                  </span>
                </div>
                <p className="text-[10.5px] text-stone-400 hidden sm:block">
                  {cameraActive
                    ? `Fitting ${selectedProduct.name} (${selectedProduct.style}) on your face`
                    : "Drag portrait to tilt & rotate in 3D"}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMeshOverlay(!showMeshOverlay)}
                className={cn(
                  "px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer",
                  showMeshOverlay
                    ? "bg-amber-500 text-black border-amber-400 font-semibold"
                    : "bg-white/10 hover:bg-white/20 text-stone-200 border-white/10"
                )}
                title="Toggle 468 facial mesh landmarks"
              >
                <Layers className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">468-Pt Mesh</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDemoMode(!isDemoMode);
                  if (!isDemoMode && streamRef.current) {
                    streamRef.current.getTracks().forEach((t) => t.stop());
                    streamRef.current = null;
                    setCameraActive(false);
                  }
                }}
                className="px-2.5 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Scan className="h-3.5 w-3.5 text-emerald-400" />
                <span>{isDemoMode ? "Use Camera" : "3D Portrait"}</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close Studio"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Canvas Viewport Container */}
          <div
            className="relative flex-1 flex items-center justify-center overflow-hidden bg-stone-950 select-none cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
            onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
            onMouseUp={handlePointerUp}
            onTouchStart={(e) => {
              if (e.touches.length === 1) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 1) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchEnd={handlePointerUp}
          >
            <video ref={videoRef} className="hidden" playsInline muted />
            <canvas ref={canvasRef} className="w-full h-full object-contain" />

            {/* Connecting Spinner / Initial Loader */}
            {isCameraLoading && !isDemoMode && (
              <div className="absolute inset-0 z-30 bg-black/75 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
                <p className="text-sm font-semibold text-white">
                  Loading 3D AR Mirror for <span className="text-amber-400">{selectedProduct.name}</span>...
                </p>
                <p className="text-xs text-stone-400">Locking 468 facial landmark mesh</p>
              </div>
            )}

            {/* Instant Flash Notification when switching frames */}
            {flashMessage && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-amber-500 text-black px-4 py-1.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <CheckCircle className="h-3.5 w-3.5 text-black" />
                <span>{flashMessage}</span>
              </div>
            )}

            {/* Telemetry HUD Pill */}
            <div className="absolute top-4 left-4 z-20 hidden sm:flex flex-col gap-1 bg-black/65 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-[11px] font-mono text-stone-300">
              <div className="flex items-center justify-between gap-4">
                <span className="text-stone-400">FRAME:</span>
                <span className="text-amber-300 font-bold truncate max-w-[130px]">{selectedProduct.name}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-stone-400">SHAPE:</span>
                <span className="text-white font-mono uppercase">{mapProductToShape(selectedProduct)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-stone-400">EST. PD:</span>
                <span className="text-amber-300 font-semibold">{telemetry.pd}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-stone-400">HEAD TILT:</span>
                <span className="text-emerald-400 font-semibold">{telemetry.tilt}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-stone-400">STOCK:</span>
                <span className={cn(selectedProduct.inStock ? "text-emerald-300" : "text-amber-400")}>
                  {selectedProduct.inStock ? "In Stock (Uttam Nagar)" : "Waitlist"}
                </span>
              </div>
            </div>

            {/* Interactive Demo Mode Hint */}
            {isDemoMode && (
              <div className="absolute top-4 right-4 z-20 bg-amber-500/20 backdrop-blur-md border border-amber-400/40 text-amber-200 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 animate-pulse">
                <Hand className="h-3.5 w-3.5" />
                <span>Drag screen to turn head in 3D!</span>
              </div>
            )}
          </div>

          {/* Bottom Frame Carousel & Filter Tabs */}
          <div className="relative z-20 p-3 sm:p-4 bg-gradient-to-t from-black via-black/95 to-transparent border-t border-white/10 space-y-2.5">
            {/* Category Filter Tabs */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCategoryFilter("all")}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer",
                    categoryFilter === "all"
                      ? "bg-amber-400 text-black shadow-md font-bold"
                      : "bg-white/10 text-stone-300 hover:bg-white/20"
                  )}
                >
                  All In-Stock ({availableFrames.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("eyeglasses")}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer",
                    categoryFilter === "eyeglasses"
                      ? "bg-amber-400 text-black shadow-md font-bold"
                      : "bg-white/10 text-stone-300 hover:bg-white/20"
                  )}
                >
                  Eyeglasses
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("sunglasses")}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer",
                    categoryFilter === "sunglasses"
                      ? "bg-amber-400 text-black shadow-md font-bold"
                      : "bg-white/10 text-stone-300 hover:bg-white/20"
                  )}
                >
                  Sunglasses
                </button>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 hidden sm:inline">
                Click any frame to try immediately
              </span>
            </div>

            {/* In-Stock Frames Carousel */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pr-2 flex-1 scrollbar-none">
                {filteredFrames.map((frame) => {
                  const isSelected = frame.id === selectedProduct.id;
                  return (
                    <button
                      key={frame.id}
                      type="button"
                      onClick={() => handleSelectFrame(frame)}
                      className={cn(
                        "shrink-0 px-3 py-2 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer",
                        isSelected
                          ? "bg-amber-400/25 border-amber-400 text-white shadow-lg ring-2 ring-amber-400/70 scale-[1.02]"
                          : "bg-white/5 border-white/10 text-stone-300 hover:bg-white/10"
                      )}
                    >
                      <div className="w-8 h-8 rounded-xl bg-black/60 flex items-center justify-center text-amber-400 shrink-0">
                        {frame.category === "sunglasses" ? (
                          <Sun className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold whitespace-nowrap truncate max-w-[130px]">
                          {frame.name}
                        </div>
                        <div className="text-[10px] text-amber-300 font-mono">
                          {inr(frame.price)} · {frame.style}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Snapshot Button */}
              <button
                type="button"
                onClick={captureSnapshot}
                className="shrink-0 inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-black font-bold px-3.5 py-2.5 rounded-xl shadow-lg transition-all hover:scale-105 text-xs sm:text-sm cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Snapshot</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Frame Details, Color Finish, Lens Tint, Fit Sliders */}
        <div className="w-full lg:w-96 bg-[#13161f] text-white border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-between overflow-y-auto max-h-[46vh] lg:max-h-none p-5 space-y-4">
          <div className="space-y-4">
            {/* Header / Active Frame Info */}
            <div className="border-b border-white/10 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  {selectedProduct.category} · {selectedProduct.brand}
                </span>
                <span className="text-xs font-mono text-stone-400">
                  {selectedProduct.dimensions?.lensWidth || 52} □ {selectedProduct.dimensions?.bridge || 18} - {selectedProduct.dimensions?.templeLength || 145} mm
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {selectedProduct.name}
              </h3>
              <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                {selectedProduct.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xl font-bold text-amber-300">{inr(selectedProduct.price)}</span>
                {selectedProduct.compareAt && (
                  <span className="text-xs text-stone-400 line-through">
                    {inr(selectedProduct.compareAt)}
                  </span>
                )}
                <span
                  className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-full ml-auto border",
                    selectedProduct.inStock
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  )}
                >
                  {selectedProduct.inStock ? "In Stock at Showroom" : "Waitlist Only"}
                </span>
              </div>
            </div>

            {/* 1. Frame Finish Swatches */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-300 block mb-2">
                1. Frame Finish: <span className="text-amber-300 font-normal">{frameColorName}</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  title="24K Royal Gold"
                  onClick={() => {
                    setFrameColor("#d4af37");
                    frameColorRef.current = "#d4af37";
                    setFrameColorName("24K Royal Gold");
                  }}
                  className={cn(
                    "w-7 h-7 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-500 to-amber-700 transition-transform hover:scale-110 cursor-pointer",
                    frameColor === "#d4af37" ? "ring-2 ring-white ring-offset-2 ring-offset-[#13161f]" : "opacity-80"
                  )}
                />
                <button
                  type="button"
                  title="Matte Obsidian"
                  onClick={() => {
                    setFrameColor("#1c1d21");
                    frameColorRef.current = "#1c1d21";
                    setFrameColorName("Matte Obsidian");
                  }}
                  className={cn(
                    "w-7 h-7 rounded-full bg-gradient-to-br from-stone-600 to-black transition-transform hover:scale-110 cursor-pointer",
                    frameColor === "#1c1d21" ? "ring-2 ring-white ring-offset-2 ring-offset-[#13161f]" : "opacity-80"
                  )}
                />
                <button
                  type="button"
                  title="Brushed Titanium"
                  onClick={() => {
                    setFrameColor("#cbd5e1");
                    frameColorRef.current = "#cbd5e1";
                    setFrameColorName("Brushed Titanium");
                  }}
                  className={cn(
                    "w-7 h-7 rounded-full bg-gradient-to-br from-white via-slate-300 to-slate-500 transition-transform hover:scale-110 cursor-pointer",
                    frameColor === "#cbd5e1" ? "ring-2 ring-white ring-offset-2 ring-offset-[#13161f]" : "opacity-80"
                  )}
                />
                <button
                  type="button"
                  title="Rose Champagne"
                  onClick={() => {
                    setFrameColor("#e6a89c");
                    frameColorRef.current = "#e6a89c";
                    setFrameColorName("Rose Champagne");
                  }}
                  className={cn(
                    "w-7 h-7 rounded-full bg-gradient-to-br from-rose-200 via-rose-400 to-amber-700 transition-transform hover:scale-110 cursor-pointer",
                    frameColor === "#e6a89c" ? "ring-2 ring-white ring-offset-2 ring-offset-[#13161f]" : "opacity-80"
                  )}
                />
                <button
                  type="button"
                  title="Havana Tortoise"
                  onClick={() => {
                    setFrameColor("#6f3d1e");
                    frameColorRef.current = "#6f3d1e";
                    setFrameColorName("Havana Tortoise");
                  }}
                  className={cn(
                    "w-7 h-7 rounded-full bg-gradient-to-br from-amber-600 via-amber-900 to-stone-900 transition-transform hover:scale-110 cursor-pointer",
                    frameColor === "#6f3d1e" ? "ring-2 ring-white ring-offset-2 ring-offset-[#13161f]" : "opacity-80"
                  )}
                />
              </div>
            </div>

            {/* 2. Lens Coating & Tint */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-300 block mb-2">
                2. Lens Coating & Tint
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setLensTint("clear");
                    lensTintRef.current = "clear";
                  }}
                  className={cn(
                    "px-3 py-2 rounded-xl border text-stone-300 font-medium flex items-center gap-2 transition-all cursor-pointer",
                    lensTint === "clear"
                      ? "border-amber-400 bg-amber-400/20 text-white font-semibold"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  )}
                >
                  <span className="w-3 h-3 rounded-full bg-white/80 border border-white" />
                  Clear Optical
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLensTint("dark");
                    lensTintRef.current = "dark";
                  }}
                  className={cn(
                    "px-3 py-2 rounded-xl border text-stone-300 font-medium flex items-center gap-2 transition-all cursor-pointer",
                    lensTint === "dark"
                      ? "border-amber-400 bg-amber-400/20 text-white font-semibold"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  )}
                >
                  <span className="w-3 h-3 rounded-full bg-stone-900 border border-white/40" />
                  Polarized Dark
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLensTint("bluelight");
                    lensTintRef.current = "bluelight";
                  }}
                  className={cn(
                    "px-3 py-2 rounded-xl border text-stone-300 font-medium flex items-center gap-2 transition-all cursor-pointer",
                    lensTint === "bluelight"
                      ? "border-amber-400 bg-amber-400/20 text-white font-semibold"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  )}
                >
                  <span className="w-3 h-3 rounded-full bg-cyan-400/70 border border-cyan-300" />
                  Blue-Cut AR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLensTint("sunset");
                    lensTintRef.current = "sunset";
                  }}
                  className={cn(
                    "px-3 py-2 rounded-xl border text-stone-300 font-medium flex items-center gap-2 transition-all cursor-pointer",
                    lensTint === "sunset"
                      ? "border-amber-400 bg-amber-400/20 text-white font-semibold"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  )}
                >
                  <span className="w-3 h-3 rounded-full bg-gradient-to-b from-amber-500 to-rose-500" />
                  Sunset Gradient
                </button>
              </div>
            </div>

            {/* 3. Micro-Fit Calibration */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                  3. Micro-Fit Calibration
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setScaleMultiplier(1.0);
                    scaleMultiplierRef.current = 1.0;
                    setOffsetY(0);
                    offsetYRef.current = 0;
                  }}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  Reset
                </button>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                  <span>Frame Width Scale</span>
                  <span className="font-mono text-amber-300">{Math.round(scaleMultiplier * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.80"
                  max="1.25"
                  step="0.01"
                  value={scaleMultiplier}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setScaleMultiplier(val);
                    scaleMultiplierRef.current = val;
                  }}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                  <span>Nose Bridge Height</span>
                  <span className="font-mono text-amber-300">
                    {offsetY > 0 ? `+${offsetY}` : offsetY} px
                  </span>
                </div>
                <input
                  type="range"
                  min="-25"
                  max="25"
                  step="1"
                  value={offsetY}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setOffsetY(val);
                    offsetYRef.current = val;
                  }}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Add to Bag CTA */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Select {selectedProduct.name} & Add to Bag</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
