import { Sparkles, Camera, BellRing } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function TryOnDialog({
  open,
  onOpenChange,
  productName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden border-border/70 p-0">
        <div className="bg-lens relative isolate px-6 pt-10 pb-6">
          <div
            aria-hidden="true"
            className="animate-float absolute -top-10 -right-8 h-40 w-40 rounded-full bg-primary/15 blur-2xl"
          />
          <div className="relative flex flex-col items-center text-center">
            <span className="animate-pulse-ring grid h-16 w-16 place-items-center rounded-full bg-card shadow-soft">
              <Camera className="h-7 w-7 text-primary" aria-hidden="true" />
            </span>
            <Badge variant="secondary" className="mt-5 gap-1 rounded-full">
              <Sparkles className="h-3 w-3" aria-hidden="true" /> Phase 2
            </Badge>
            <DialogHeader className="mt-4 space-y-2">
              <DialogTitle className="text-2xl">Virtual Try-On is coming</DialogTitle>
              <DialogDescription className="text-balance-pretty">
                Live camera try-on for {productName ? <strong>{productName}</strong> : "our frames"}{" "}
                is being built for the next release. Until then, walk into the store — every frame on
                this site is on the shelf in Uttam Nagar.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>
        <div className="space-y-3 px-6 pt-2 pb-6">
          <Button
            variant="hero"
            size="pill"
            className="w-full"
            onClick={() => {
              toast.success("You're on the try-on early list", {
                description: "Demo only — no data leaves this device yet.",
              });
              onOpenChange(false);
            }}
          >
            <BellRing className="h-4 w-4" aria-hidden="true" />
            Notify me when it launches
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Demo interaction — no camera is accessed in this phase.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
