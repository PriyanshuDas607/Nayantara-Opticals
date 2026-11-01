import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Camera,
  X,
  ShoppingBag,
  RotateCcw,
  Sliders,
  Check,
  Download,
  Info,
  Maximize2,
  Sun,
  Eye,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { PRODUCTS, type Product } from "@/data/catalog";
import { inr } from "@/lib/site";
import { useShop } from "@/store/shop";
import { cn } from "@/lib/utils";

// Real High-Definition Front-Facing Cutout Assets
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

  if (lower.includes("gold")) return { hex: "#d4af37", name: colName };
  if (lower.includes("tortoise") || lower.includes("amber")) return { hex: "#6f3d1e", name: colName };
  if (lower.includes("matte black") || lower.includes("black") || lower.includes("ink")) return { hex: "#1c1d21", name: colName };
  if (lower.includes("silver") || lower.includes("gunmetal") || lower.includes("titanium")) return { hex: "#cbd5e1", name: colName };
  if (lower.includes("rose") || lower.includes("champagne")) return { hex: "#e6a89c", name: colName };
  return { hex: "#d4af37", name: colName };
}

// Draw Eyewear on Canvas (uses Real Photographic Cutouts for photorealism)
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

      // In real eyewear, from direct front view (yaw ~ 0), temples recede straight back into the screen (z-axis)
      // and are naturally hidden behind the front frame rims.
      // As head rotates (yaw), the temple arm on the turning side comes into view with realistic perspective.
      // yaw > 0: user turned right (facing screen right in mirror), exposing RIGHT temple arm (screen right, x > 0).
      // yaw < 0: user turned left (facing screen left in mirror), exposing LEFT temple arm (screen left, x < 0).
      const rightVisibility = Math.max(0, Math.min(1, (yaw - 0.035) / 0.12));
      const leftVisibility = Math.max(0, Math.min(1, (-yaw - 0.035) / 0.12));

      // Temple reach dynamically expands as head turns towards profile view (as seen in reference image)
      const dynamicReach = width * (0.18 + Math.min(0.42, absYaw * 0.55));
      const leftEarLocal = transformToLocal(earLeft, leftHingeX - dynamicReach);
      const rightEarLocal = transformToLocal(earRight, rightHingeX + dynamicReach);

      // Frame styling attributes
      const isAcetateOrBold =
        shape === "square" ||
        shape === "wayfarer" ||
        shape === "round" ||
        shape === "cateye";

      const templeStemWidth = isAcetateOrBold
        ? Math.max(3.8, width * 0.024)
        : Math.max(2.4, width * 0.013);
      const templeHingeWidth = isAcetateOrBold
        ? Math.max(4.8, width * 0.030)
        : Math.max(3.0, width * 0.016);

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Left Temple Arm ("Dandi") -> goes from left hinge OUTWARD to left ear
      if (leftVisibility > 0) {
        ctx.globalAlpha = leftVisibility;

        // STRICT GUARANTEE: targetX is strictly to the LEFT of the hinge (outward towards the ear, NEVER inside the lens)
        const targetX = Math.min(leftHingeX - width * 0.06, leftEarLocal.x);
        const targetY = Math.max(hingeY - width * 0.04, Math.min(hingeY + width * 0.05, leftEarLocal.y));
        const midX = leftHingeX + (targetX - leftHingeX) * 0.5;
        const midY = hingeY + (targetY - hingeY) * 0.45;

        // Ear curve tip (curves downward behind ear as in reference image)
        const tipX = targetX - width * 0.028;
        const tipY = targetY + width * 0.065;

        // 1. Soft skin/hair drop shadow behind temple arm
        ctx.beginPath();
        ctx.moveTo(leftHingeX, hingeY + 2.5);
        ctx.quadraticCurveTo(midX, midY + 2.5, targetX, targetY + 2.5);
        ctx.quadraticCurveTo(targetX - 2, targetY + width * 0.035 + 2.5, tipX, tipY + 2.5);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.28)";
        ctx.lineWidth = templeStemWidth + 1.6;
        ctx.stroke();

        // 2. Main temple arm stem (from frame hinge straight to top of ear)
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
        ctx.lineWidth = Math.max(2.0, templeStemWidth * 0.85);
        ctx.stroke();

        // 4. Specular highlight line along upper edge
        ctx.beginPath();
        ctx.moveTo(leftHingeX, hingeY - 1.0);
        ctx.quadraticCurveTo(midX, midY - 1.0, targetX, targetY - 1.0);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.50)";
        ctx.lineWidth = Math.max(0.8, width * 0.005);
        ctx.stroke();

        // 5. Designer metallic hinge bracket / accent rivet (matching reference image)
        ctx.fillStyle = frameColor;
        ctx.fillRect(leftHingeX - 3.5, hingeY - templeHingeWidth / 2, 4.5, templeHingeWidth);
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.fillRect(leftHingeX - 2.5, hingeY - 1.0, 3.0, 2.0);
      }

      // Right Temple Arm ("Dandi") -> goes from right hinge OUTWARD to right ear
      if (rightVisibility > 0) {
        ctx.globalAlpha = rightVisibility;

        // STRICT GUARANTEE: targetX is strictly to the RIGHT of the hinge (outward towards the ear, NEVER inside the lens)
        const targetX = Math.max(rightHingeX + width * 0.06, rightEarLocal.x);
        const targetY = Math.max(hingeY - width * 0.04, Math.min(hingeY + width * 0.05, rightEarLocal.y));
        const midX = rightHingeX + (targetX - rightHingeX) * 0.5;
        const midY = hingeY + (targetY - hingeY) * 0.45;

        // Ear curve tip (curves downward behind ear as in reference image)
        const tipX = targetX + width * 0.028;
        const tipY = targetY + width * 0.065;

        // 1. Soft skin/hair drop shadow behind temple arm
        ctx.beginPath();
        ctx.moveTo(rightHingeX, hingeY + 2.5);
        ctx.quadraticCurveTo(midX, midY + 2.5, targetX, targetY + 2.5);
        ctx.quadraticCurveTo(targetX + 2, targetY + width * 0.035 + 2.5, tipX, tipY + 2.5);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.28)";
        ctx.lineWidth = templeStemWidth + 1.6;
        ctx.stroke();

        // 2. Main temple arm stem (from frame hinge straight to top of ear)
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
        ctx.lineWidth = Math.max(2.0, templeStemWidth * 0.85);
        ctx.stroke();

        // 4. Specular highlight line along upper edge
        ctx.beginPath();
        ctx.moveTo(rightHingeX, hingeY - 1.0);
        ctx.quadraticCurveTo(midX, midY - 1.0, targetX, targetY - 1.0);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.50)";
        ctx.lineWidth = Math.max(0.8, width * 0.005);
        ctx.stroke();

        // 5. Designer metallic hinge bracket / accent rivet (matching reference image)
        ctx.fillStyle = frameColor;
        ctx.fillRect(rightHingeX - 1.0, hingeY - templeHingeWidth / 2, 4.5, templeHingeWidth);
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.fillRect(rightHingeX - 0.5, hingeY - 1.0, 3.0, 2.0);
      }

      ctx.restore();
    }

    // Use offscreen canvas to isolate glasses pixels so tint only affects the frame, not the video
    const needsTint = tintMode === "bluelight" || tintMode === "sunset";

    if (needsTint) {
      // Render glasses + tint on an isolated offscreen canvas
      const offW = Math.ceil(width);
      const offH = Math.ceil(imgH);
      const offscreen = document.createElement("canvas");
      offscreen.width = offW;
      offscreen.height = offH;
      const offCtx = offscreen.getContext("2d")!;

      // Draw glasses image on offscreen canvas (centered)
      offCtx.drawImage(imageElement, 0, 0, offW, offH);

      // Apply tint ONLY on glasses pixels using source-atop
      offCtx.globalCompositeOperation = "source-atop";
      if (tintMode === "bluelight") {
        offCtx.fillStyle = "rgba(100, 180, 255, 0.18)";
      } else {
        offCtx.fillStyle = "rgba(245, 158, 11, 0.22)";
      }
      offCtx.fillRect(0, 0, offW, offH);

      // Draw the tinted result onto main canvas
      ctx.save();
      if (mirrored) ctx.scale(-1, 1);
      ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      ctx.shadowOffsetX = yaw * 2;
      ctx.drawImage(offscreen, -width / 2, -imgH * 0.48, width, imgH);
      ctx.restore();
    } else {
      // No tint — draw glasses directly with shadow
      ctx.save();
      if (mirrored) ctx.scale(-1, 1);
      ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      ctx.shadowOffsetX = yaw * 2;
      ctx.drawImage(imageElement, -width / 2, -imgH * 0.48, width, imgH);
      ctx.restore();
    }

    ctx.restore();
    return;
  }

  // Fallback vector outline if image still loading
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

  // Lenses with specular glare
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

  // Filter only wearable eyewear (eyeglasses and sunglasses) from the shop catalog
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
        (p) => p.id === initialProductId || p.name.toLowerCase() === initialProductId.toLowerCase()
      );
      if (match) return match;
    }
    return (availableFrames[0] ?? PRODUCTS[0])!;
  });

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
  const [frameColor, setFrameColor] = useState<string>("#d4af37");
  const [frameColorName, setFrameColorName] = useState<string>("24K Royal Gold");
  const [lensTint, setLensTint] = useState<LensTint>("clear");
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(1.0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  // Sync selected frame & default styling
  useEffect(() => {
    if (open && initialProductId) {
      const match = availableFrames.find(
        (p) => p.id === initialProductId || p.name.toLowerCase() === initialProductId.toLowerCase()
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
  const animFrameRef = useRef<number | null>(null);

  const selectedProductRef = useRef(selectedProduct);
  const frameColorRef = useRef(frameColor);
  const lensTintRef = useRef(lensTint);
  const scaleMultiplierRef = useRef(scaleMultiplier);
  const offsetYRef = useRef(offsetY);

  // EMA smoothing state for jitter-free tracking (like competitors)
  const smoothedRef = useRef<{
    x: number; y: number; roll: number; yaw: number; eyeDist: number;
  } | null>(null);
  const EMA_ALPHA = 0.35; // Higher = more responsive, lower = smoother

  // Synchronize refs on every render
  selectedProductRef.current = selectedProduct;
  frameColorRef.current = frameColor;
  lensTintRef.current = lensTint;
  scaleMultiplierRef.current = scaleMultiplier;
  offsetYRef.current = offsetY;

  // Select frame handler
  const handleSelectFrame = (product: Product) => {
    setSelectedProduct(product);
    const col = getDefaultColorForProduct(product);
    setFrameColor(col.hex);
    setFrameColorName(col.name);
    setLensTint(getDefaultTintForProduct(product));

    const url = getProductCutoutUrl(product);
    let img = imageCacheRef.current[url];
    if (!img) {
      img = new Image();
      img.src = url;
      imageCacheRef.current[url] = img;
    }
    activeImageRef.current = img;

    setFlashMessage(`Active: ${product.name} (${product.style})`);
    setTimeout(() => setFlashMessage(null), 2500);
  };

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

      // Get RAW (un-mirrored) landmark coordinates for roll/yaw computation
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

      // Use RAW coordinates for roll angle — this avoids ALL mirror confusion
      const raw33 = getRawPt(33);   // subject's right eye outer, camera-left
      const raw263 = getRawPt(263); // subject's left eye outer, camera-right
      const rawDx = raw263.x - raw33.x;
      const rawDy = raw263.y - raw33.y;
      const outerEyeDist = Math.sqrt(rawDx * rawDx + rawDy * rawDy);

      // Roll angle from raw coordinates
      let rollAngle = Math.atan2(rawDy, rawDx);
      rollAngle = -rollAngle;
      const MAX_ROLL = Math.PI / 4;
      rollAngle = Math.max(-MAX_ROLL, Math.min(MAX_ROLL, rollAngle));

      // Yaw from nose-tip offset relative to eye center (in screen space)
      const eyeCenterMidX = (eyeLeftScreen.x + eyeRightScreen.x) / 2;
      const yawRatio = Math.max(-0.6, Math.min(0.6, (noseTipScreen.x - eyeCenterMidX) / (outerEyeDist * 0.4)));

      // Raw tracking values
      const rawBridge = {
        x: noseBridgeScreen.x,
        y: noseBridgeScreen.y,
        roll: rollAngle,
        yaw: yawRatio,
        eyeDist: outerEyeDist * 1.82,
      };

      // Apply EMA smoothing for jitter-free, silky tracking
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

      // Draw Eyewear with Real Photographic Cutout & 3D Pose
      const currentProd = selectedProductRef.current;
      const activeShape = mapProductToShape(currentProd);

      // Ears: Landmark 356 is left ear root (screen left in mirror), 127 is right ear root (screen right)
      drawProceduralEyewear(ctx, activeShape, {
        x: bridgeCenter.x,
        y: bridgeCenter.y + offsetYRef.current + bridgeCenter.eyeDist * 0.02,
        width: bridgeCenter.eyeDist * scaleMultiplierRef.current,
        roll: bridgeCenter.roll,
        yaw: bridgeCenter.yaw,
        frameColor: frameColorRef.current,
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
      imageElement: activeImageRef.current,
    });
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
        // Fallback animation loop
        setCameraActive(true);
        setIsCameraLoading(false);
        const fallbackLoop = () => {
          if (videoRef.current && canvasRef.current) {
            renderWebcamFallback(videoRef.current, canvasRef.current);
          }
          animFrameRef.current = requestAnimationFrame(fallbackLoop);
        };
        animFrameRef.current = requestAnimationFrame(fallbackLoop);
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

  // Lifecycle Management
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-[#FCFAF7] rounded-2xl sm:rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[92vh] sm:min-h-[85vh] max-h-[96vh]">
        
        {/* Left / Center AR Studio Viewport */}
        <div className="relative flex-1 bg-[#F5F2EB] flex flex-col justify-between overflow-hidden min-h-[460px] border-b lg:border-b-0 lg:border-r border-stone-200">
          
          {/* Top Brand & Controls Header */}
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4 bg-[#FCFAF7]/95 backdrop-blur-md border-b border-stone-200">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-stone-900 text-xs sm:text-sm tracking-wide">
                    NAYANTARA LIVE AR MIRROR
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                    {cameraActive ? "Live AR Mirror" : isCameraLoading ? "Starting Camera..." : "Webcam Required"}
                  </span>
                </div>
                <p className="text-[10.5px] text-stone-500 hidden sm:block">
                  {cameraActive
                    ? `Live Real-Frame Fitting: ${selectedProduct.name} (${selectedProduct.style})`
                    : "Live optical fitting directly on your face"}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
                title="Close Mirror"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Canvas Viewport Frame */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-stone-100 m-2 sm:m-3 rounded-2xl border border-stone-300 shadow-inner select-none">
            <video ref={videoRef} className="hidden" playsInline muted />
            <canvas ref={canvasRef} className="w-full h-full object-contain" />

            {/* Connecting Spinner / Initial Loader */}
            {isCameraLoading && (
              <div className="absolute inset-0 z-30 bg-stone-900/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                <p className="text-sm font-semibold text-white">
                  Loading AR Mirror for <span className="text-amber-300">{selectedProduct.name}</span>...
                </p>
                <p className="text-xs text-stone-200">Aligning precision facial tracking</p>
              </div>
            )}

            {/* Camera Permission / Error Banner */}
            {cameraError && !isCameraLoading && (
              <div className="absolute inset-0 z-30 bg-stone-900/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
                <div className="w-14 h-14 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center mb-4 text-amber-400 shadow-lg">
                  <Camera className="h-7 w-7" />
                </div>
                <h4 className="font-display text-lg font-semibold mb-1 text-white">
                  Camera Access Required
                </h4>
                <p className="text-xs text-stone-300 max-w-sm mb-5 leading-relaxed">
                  Please enable camera permissions in your browser to try on frames live on your face in real-time.
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

            {/* Instant Flash Notification when switching frames */}
            {flashMessage && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-stone-900 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>{flashMessage}</span>
              </div>
            )}

            {/* Telemetry HUD Pill (Frosted Luxury Theme) */}
            <div className="absolute top-3 left-3 z-20 hidden sm:flex flex-col gap-1 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-stone-200 text-[11px] font-mono text-stone-700 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-stone-400">FRAME:</span>
                <span className="text-stone-900 font-bold truncate max-w-[130px]">{selectedProduct.name}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-stone-400">SHAPE:</span>
                <span className="text-stone-800 uppercase font-medium">{mapProductToShape(selectedProduct)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-stone-400">EST. PD:</span>
                <span className="text-stone-900 font-semibold">{telemetry.pd}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-stone-400">HEAD TILT:</span>
                <span className="text-stone-900 font-semibold">{telemetry.tilt}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-stone-400">SHOWROOM:</span>
                <span className={cn("font-medium", selectedProduct.inStock ? "text-emerald-700" : "text-amber-700")}>
                  {selectedProduct.inStock ? "In Stock (Uttam Nagar)" : "Waitlist"}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Frame Carousel & Filter Tabs */}
          <div className="relative z-20 p-3 sm:p-4 bg-[#FCFAF7]/95 backdrop-blur-md border-t border-stone-200 space-y-2.5">
            {/* Category Filter Tabs */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCategoryFilter("all")}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer",
                    categoryFilter === "all"
                      ? "bg-stone-900 text-white font-semibold shadow-xs"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  )}
                >
                  All In-Stock ({availableFrames.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("eyeglasses")}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer",
                    categoryFilter === "eyeglasses"
                      ? "bg-stone-900 text-white font-semibold shadow-xs"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  )}
                >
                  Eyeglasses
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("sunglasses")}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer",
                    categoryFilter === "sunglasses"
                      ? "bg-stone-900 text-white font-semibold shadow-xs"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  )}
                >
                  Sunglasses
                </button>
              </div>
              <span className="text-[11px] font-medium text-emerald-700 hidden sm:inline">
                Click any frame to try on your face
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
                        "shrink-0 px-2.5 py-2 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer",
                        isSelected
                          ? "bg-amber-500/10 border-2 border-amber-600 text-stone-900 shadow-sm ring-2 ring-amber-400/30 scale-[1.02]"
                          : "bg-white border-stone-200 text-stone-700 hover:border-stone-300 shadow-xs"
                      )}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                        <img
                          src={frame.image}
                          alt={frame.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 pr-1">
                        <div className="text-xs font-semibold whitespace-nowrap truncate max-w-[120px]">
                          {frame.name}
                        </div>
                        <div className="text-[10.5px] text-stone-500 font-mono">
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
                className="shrink-0 inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white font-medium px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 text-xs sm:text-sm cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Save Photo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Frame Details, Color Finish, Lens Tint, Fit Sliders */}
        <div className="w-full lg:w-96 bg-white text-stone-900 border-t lg:border-t-0 lg:border-l border-stone-200 flex flex-col justify-between overflow-y-auto max-h-[48vh] lg:max-h-none p-5 lg:p-6 space-y-5">
          <div className="space-y-4">
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
                1. Frame Finish: <span className="text-stone-900 font-medium">{frameColorName}</span>
              </label>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  title="24K Royal Gold"
                  onClick={() => {
                    setFrameColor("#d4af37");
                    setFrameColorName("24K Royal Gold");
                  }}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer shadow-xs",
                    frameColor === "#d4af37" ? "border-stone-900 ring-2 ring-amber-400" : "border-stone-200"
                  )}
                  style={{ backgroundColor: "#d4af37" }}
                >
                  {frameColor === "#d4af37" && <Check className="h-3.5 w-3.5 text-black stroke-[3]" />}
                </button>

                <button
                  type="button"
                  title="Italian Tortoise"
                  onClick={() => {
                    setFrameColor("#6f3d1e");
                    setFrameColorName("Italian Tortoise");
                  }}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer shadow-xs",
                    frameColor === "#6f3d1e" ? "border-stone-900 ring-2 ring-amber-400" : "border-stone-200"
                  )}
                  style={{ backgroundColor: "#6f3d1e" }}
                >
                  {frameColor === "#6f3d1e" && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                </button>

                <button
                  type="button"
                  title="Matte Black Titanium"
                  onClick={() => {
                    setFrameColor("#1c1d21");
                    setFrameColorName("Matte Black Titanium");
                  }}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer shadow-xs",
                    frameColor === "#1c1d21" ? "border-stone-900 ring-2 ring-amber-400" : "border-stone-200"
                  )}
                  style={{ backgroundColor: "#1c1d21" }}
                >
                  {frameColor === "#1c1d21" && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                </button>

                <button
                  type="button"
                  title="Platinum Silver"
                  onClick={() => {
                    setFrameColor("#cbd5e1");
                    setFrameColorName("Platinum Silver");
                  }}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer shadow-xs",
                    frameColor === "#cbd5e1" ? "border-stone-900 ring-2 ring-amber-400" : "border-stone-200"
                  )}
                  style={{ backgroundColor: "#cbd5e1" }}
                >
                  {frameColor === "#cbd5e1" && <Check className="h-3.5 w-3.5 text-black stroke-[3]" />}
                </button>
              </div>
            </div>

            {/* 2. Lens Options */}
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
                  onChange={(e) => setOffsetY(parseInt(e.target.value))}
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
