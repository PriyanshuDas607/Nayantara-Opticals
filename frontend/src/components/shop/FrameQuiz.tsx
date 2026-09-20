import { useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRODUCTS, type Product } from "@/data/catalog";
import { inr } from "@/lib/site";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "face",
    question: "Which face shape sounds most like you?",
    hint: "Not sure? Pick the closest — we confirm the fit in store.",
    options: ["Round", "Oval", "Square", "Heart", "Diamond"],
  },
  {
    id: "style",
    question: "What frame shape are you drawn to?",
    hint: "Frame silhouette sets the whole tone.",
    options: ["Round", "Rectangle", "Square", "Aviator", "Cat-Eye"],
  },
  {
    id: "size",
    question: "What size and fit works best?",
    hint: "Based on how your current glasses sit across your face.",
    options: ["Small", "Medium", "Large", "Not sure"],
  },
  {
    id: "color",
    question: "Which colour family suits you?",
    hint: "Warm tortoise and champagne, or cooler ink and gunmetal.",
    options: ["Tortoise", "Ink", "Champagne", "Gold", "Gunmetal", "No preference"],
  },
  {
    id: "material",
    question: "How should the frame feel?",
    hint: "Acetate is warm and sculptural; titanium is featherweight.",
    options: ["Acetate", "Metal", "Titanium", "No preference"],
  },
  {
    id: "budget",
    question: "What budget range are you planning for?",
    hint: "Frame only — lens packages are quoted separately in store.",
    options: ["Under ₹3,500", "₹3,500 – ₹5,000", "₹5,000 +", "Flexible"],
  },
] as const;

const BUDGET_RANGE: Record<string, [number, number]> = {
  "Under ₹3,500": [0, 3500],
  "₹3,500 – ₹5,000": [3500, 5000],
  "₹5,000 +": [5000, Number.POSITIVE_INFINITY],
};

function evaluate(product: Product, answers: Record<string, string>) {
  let value = 0;
  const reasons: string[] = [];

  const face = answers["face"];
  if (face && product.faceShapes.includes(face)) {
    value += 3;
    reasons.push(`Balances a ${face.toLowerCase()} face shape`);
  }

  const style = answers["style"];
  if (style && product.style === style) {
    value += 3;
    reasons.push(`${style} silhouette you picked`);
  }

  const size = answers["size"];
  if (size && size !== "Not sure" && product.sizes.includes(size)) {
    value += 2;
    reasons.push(`Available in a ${size.toLowerCase()} fit`);
  }

  const color = answers["color"];
  if (color && color !== "No preference") {
    const match = product.colors.find((c) => c.name === color);
    if (match) {
      value += 2;
      reasons.push(`Comes in ${match.name}`);
    }
  }

  const material = answers["material"];
  if (material && material !== "No preference" && product.material === material) {
    value += 2;
    reasons.push(`${material} build for the feel you wanted`);
  }

  const budget = answers["budget"];
  const range = budget ? BUDGET_RANGE[budget] : undefined;
  if (range) {
    if (product.price >= range[0] && product.price < range[1]) {
      value += 2;
      reasons.push(`Within your ${budget} budget`);
    } else {
      value -= 2;
    }
  }

  return { value, reasons };
}

export function FrameQuiz({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (product: Product) => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const done = step >= STEPS.length;

  const results = PRODUCTS.filter((p) => p.category === "eyeglasses" || p.category === "sunglasses")
    .map((p) => ({ product: p, ...evaluate(p, answers) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const reset = () => {
    setStep(0);
    setAnswers({});
  };

  const current = STEPS[step];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setTimeout(reset, 200);
      }}
    >
      <DialogContent className="max-h-[92dvh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <Badge variant="secondary" className="w-fit gap-1 rounded-full">
            <Sparkles className="h-3 w-3" aria-hidden="true" /> Find your frame
          </Badge>
          <DialogTitle className="mt-2 text-2xl">
            {done ? "Three frames worth trying" : current?.question}
          </DialogTitle>
          <DialogDescription>
            {done ? "Matched to your answers. Final fit is always confirmed in store." : current?.hint}
          </DialogDescription>
        </DialogHeader>

        <div
          className="mt-1 flex gap-1.5"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={STEPS.length}
          aria-valuenow={Math.min(step, STEPS.length)}
          aria-label="Quiz progress"
        >
          {STEPS.map((s, index) => (
            <span
              key={s.id}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                index < step ? "bg-primary" : "bg-border",
              )}
            />
          ))}
        </div>

        {!done && current ? (
          <div className="mt-5 grid gap-2">
            {current.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setAnswers((prev) => ({ ...prev, [current.id]: option }));
                  setStep((prev) => prev + 1);
                }}
                className={cn(
                  "flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-soft focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  answers[current.id] === option && "border-primary",
                )}
              >
                {option}
                <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {results.map(({ product, reasons }) => (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  onSelect?.(product);
                  onOpenChange(false);
                }}
                className="flex items-start gap-4 rounded-xl border border-border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <img
                  src={product.image}
                  alt=""
                  loading="lazy"
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="block truncate text-sm font-semibold">{product.name}</span>
                    <span className="font-display shrink-0 text-sm font-semibold">{inr(product.price)}</span>
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {product.style} · {product.material}
                  </span>
                  {reasons.length ? (
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      {reasons.slice(0, 3).map((reason) => (
                        <span
                          key={reason}
                          className="rounded-full bg-secondary px-2 py-0.5 text-[11px] leading-4 text-secondary-foreground"
                        >
                          {reason}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="mt-2 block text-[11px] text-muted-foreground">
                      A well-rounded option to try alongside your picks.
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
          </Button>
          {done ? (
            <Button variant="quiet" size="sm" onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Start again
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
