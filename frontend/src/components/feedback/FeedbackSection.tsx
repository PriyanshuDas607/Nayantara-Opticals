import { useMemo, useState } from "react";
import { CheckCircle2, MessageSquareQuote, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionHeading } from "@/components/common/SectionHeading";
import { StarRating } from "@/components/common/StarRating";
import { Reveal } from "@/components/common/Reveal";
import { TESTIMONIALS } from "@/data/content";
import { cn } from "@/lib/utils";

const SUBJECTS = [
  "Eyeglasses & frames",
  "Sunglasses",
  "Prescription lenses",
  "Contact lenses",
  "Hearing aids",
  "Vision aids",
  "Eye check / consultation",
  "In-store experience",
] as const;

type Feedback = {
  id: string;
  name: string;
  location?: string;
  subject: string;
  rating: number;
  text: string;
};

type Errors = Partial<Record<"name" | "rating" | "subject" | "text" | "contact", string>>;

function StarInput({
  value,
  onChange,
  error,
}: {
  value: number;
  onChange: (value: number) => void;
  error?: string | undefined;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div>
      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label="Your rating out of 5"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(star)}
            onFocus={() => setHover(star)}
            onBlur={() => setHover(0)}
            onClick={() => onChange(star)}
            className="rounded-md p-1 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Star
              className={cn(
                "h-7 w-7 transition-colors",
                star <= active
                  ? "fill-champagne text-champagne"
                  : "fill-transparent text-muted-foreground/45",
              )}
              aria-hidden="true"
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground" aria-live="polite">
          {value ? `${value} / 5` : "Tap a star"}
        </span>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FeedbackSection({ id = "feedback" }: { id?: string }) {
  const [submitted, setSubmitted] = useState<Feedback[]>([]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [subject, setSubject] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState<Feedback | null>(null);

  const reviews = useMemo(
    () => [
      ...submitted,
      ...TESTIMONIALS.map((t, i) => ({
        id: `seed-${i}`,
        name: t.name,
        location: t.location,
        subject: "Verified in-store visit",
        rating: t.rating,
        text: t.text,
      })),
    ],
    [submitted],
  );

  const average = useMemo(
    () => reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
    [reviews],
  );

  const validate = () => {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Please enter your name (at least 2 characters).";
    if (!rating) next.rating = "Please choose a rating from 1 to 5 stars.";
    if (!subject) next.subject = "Please tell us what your feedback is about.";
    if (text.trim().length < 15) next.text = "Please write at least 15 characters.";
    const trimmedContact = contact.trim();
    if (
      trimmedContact &&
      !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(trimmedContact) &&
      !/^\+?[\d\s-]{7,15}$/.test(trimmedContact)
    ) {
      next.contact = "Enter a valid email or phone number, or leave this blank.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    const entry: Feedback = {
      id: `local-${Date.now()}`,
      name: name.trim(),
      subject,
      rating,
      text: text.trim(),
      location: "Your review",
    };
    setSubmitted((prev) => [entry, ...prev]);
    setSuccess(entry);
    setName("");
    setContact("");
    setSubject("");
    setRating(0);
    setText("");
    setErrors({});
    toast.success("Thank you — your feedback has been added.");
  };

  return (
    <section id={id} className="border-y border-border bg-aurora">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Ratings & feedback"
            title="Trusted through generations."
            description="Read what customers say, then share your own experience with a rating out of five."
            align="center"
          />
        </Reveal>

        <Reveal delay={60}>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm">
            <StarRating value={average} size={18} />
            <span className="font-display text-base font-semibold">{average.toFixed(1)} / 5</span>
            <span className="text-muted-foreground text-xs sm:text-sm">
              from {reviews.length} shared experiences
            </span>
          </div>
        </Reveal>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_1.05fr] lg:gap-8">
          <Reveal>
            <div className="rounded-2xl border border-border bg-card p-7 shadow-soft sm:p-9">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10">
                  <MessageSquareQuote className="h-5 w-5 text-primary" aria-hidden="true" />
                </span>
                <h3 className="text-xl font-semibold">Rate your experience</h3>
              </div>

              {success ? (
                <div className="mt-7" aria-live="polite">
                  <CheckCircle2 className="h-9 w-9 text-primary" aria-hidden="true" />
                  <h4 className="mt-4 text-lg font-semibold">Thank you, {success.name}.</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Your {success.rating}-star feedback on {success.subject.toLowerCase()} now
                    appears alongside the reviews on this page.
                  </p>
                  <Button variant="quiet" className="mt-6" onClick={() => setSuccess(null)}>
                    Write another review
                  </Button>
                </div>
              ) : (
                <form className="mt-7 grid gap-5" onSubmit={onSubmit} noValidate>
                  <div className="grid gap-2">
                    <Label>Your rating</Label>
                    <StarInput value={rating} onChange={setRating} error={errors.rating} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="fb-name">Name</Label>
                    <Input
                      id="fb-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. R. Sharma"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "fb-name-error" : undefined}
                    />
                    {errors.name ? (
                      <p id="fb-name-error" className="text-sm text-destructive" role="alert">
                        {errors.name}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="fb-contact">
                      Email or phone{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id="fb-contact"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Only if you'd like a reply"
                      aria-invalid={!!errors.contact}
                      aria-describedby={errors.contact ? "fb-contact-error" : undefined}
                    />
                    {errors.contact ? (
                      <p id="fb-contact-error" className="text-sm text-destructive" role="alert">
                        {errors.contact}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="fb-subject">What is this about?</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger id="fb-subject" aria-invalid={!!errors.subject}>
                        <SelectValue placeholder="Choose a service or product" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subject ? (
                      <p className="text-sm text-destructive" role="alert">
                        {errors.subject}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="fb-text">Your feedback</Label>
                    <Textarea
                      id="fb-text"
                      rows={4}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="What went well, and what could be better?"
                      aria-invalid={!!errors.text}
                      aria-describedby={errors.text ? "fb-text-error" : undefined}
                    />
                    {errors.text ? (
                      <p id="fb-text-error" className="text-sm text-destructive" role="alert">
                        {errors.text}
                      </p>
                    ) : null}
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full sm:w-fit">
                    Submit feedback
                  </Button>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Reviews shared here stay on this device in the current phase of the site.
                  </p>
                </form>
              )}
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:content-start">
            {reviews.slice(0, 6).map((review, index) => (
              <Reveal key={review.id} delay={index * 50}>
                <figure className="h-full rounded-2xl border border-border bg-card/70 p-6 shadow-soft">
                  <StarRating value={review.rating} />
                  <blockquote className="text-balance-pretty mt-4 text-sm leading-relaxed">
                    “{review.text}”
                  </blockquote>
                  <figcaption className="mt-5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{review.name}</span>
                    {review.location ? ` · ${review.location}` : ""}
                    <span className="mt-1 block">{review.subject}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
