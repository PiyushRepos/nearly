"use no memo";

import { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import useSWR from "swr";
import { useForm, Controller, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodSafeResolver } from "@/lib/zod-resolver";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  MapPin,
  FileText,
  CheckCircle2,
  Clock,
  ImageIcon,
  X,
  Loader2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn, getAvatarPlaceholder } from "@/lib/utils";
import { r, ROUTES } from "@/config/routes";
import type { ProviderProfile, SingleResponse } from "@/types";
import { api } from "@/lib/api";

// ─── Schemas per step ─────────────────────────────────────────────────────────

const step1Schema = z.object({
  categoryId: z.string().min(1, "Please select a service"),
  scheduledDate: z.date({ error: "Please pick a date" }),
  scheduledTime: z.string().min(1, "Please pick a time slot"),
});

const step2Schema = z.object({
  address: z.string().min(5, "Enter a full address"),
  city: z.string().min(2, "Enter your city"),
  area: z.string().min(2, "Enter your area / locality"),
});

const step3Schema = z.object({
  notes: z.string().optional(),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;
type Step3 = z.infer<typeof step3Schema>;

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

const STEPS = [
  { label: "Service & Schedule", icon: CalendarDays },
  { label: "Address", icon: MapPin },
  { label: "Details", icon: FileText },
  { label: "Confirm", icon: CheckCircle2 },
];

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function fetchProvider(url: string): Promise<ProviderProfile> {
  const res = await api.get<SingleResponse<ProviderProfile>>(url);
  return res.data.data;
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="space-y-2">
      <Progress
        value={((current + 1) / STEPS.length) * 100}
        className="h-1.5"
      />
      <div className="flex justify-between">
        {STEPS.map((s, i) => {
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium transition-colors",
                i === current
                  ? "text-brand-orange"
                  : i < current
                    ? "text-emerald-600"
                    : "text-muted-foreground",
              )}
            >
              <div
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border text-[10px] font-semibold shrink-0",
                  i === current
                    ? "border-brand-orange bg-(--brand-orange)/10 text-brand-orange"
                    : i < current
                      ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                      : "border-border bg-transparent text-muted-foreground",
                )}
              >
                {i < current ? "✓" : i + 1}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Provider summary card ────────────────────────────────────────────────────

function ProviderMini({ provider }: { provider: ProviderProfile }) {
  const initials =
    provider.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "??";

  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3 border border-border">
      <Avatar className="size-10 shrink-0">
        <AvatarImage
          src={provider.image ?? getAvatarPlaceholder(provider.name ?? "")}
        />
        <AvatarFallback className="text-xs bg-(--brand-orange)/10 text-brand-orange font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p
          className="text-sm font-semibold text-foreground truncate"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          {provider.name ?? "Service Professional"}
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="size-3 shrink-0" />
          {provider.area}, {provider.city}
        </p>
      </div>
      {provider.hourlyRate && (
        <div className="ml-auto text-right shrink-0">
          <p className="text-sm font-bold text-brand-orange">
            ₹{Number(provider.hourlyRate).toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-muted-foreground">/hour</p>
        </div>
      )}
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
  required,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        className={cn(
          "text-sm",
          required && "after:ml-0.5 after:text-destructive after:content-['*']",
        )}
      >
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookServicePage() {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Collect values across steps
  const [s1Data, setS1Data] = useState<Step1 | null>(null);
  const [s2Data, setS2Data] = useState<Step2 | null>(null);
  const [s3Data, setS3Data] = useState<Step3 | null>(null);

  const { data: provider, isLoading } = useSWR(
    providerId ? `/providers/${providerId}` : null,
    fetchProvider,
  );

  // ── Step 1 form ────────────────────────────────────────────────────────────
  const form1 = useForm<Step1>({
    resolver: zodSafeResolver(step1Schema),
    defaultValues: s1Data ?? { categoryId: "", scheduledTime: "" },
  });
  const selectedDate = useWatch({
    control: form1.control,
    name: "scheduledDate",
  });
  const selectedCategoryId = useWatch({
    control: form1.control,
    name: "categoryId",
  });

  // ── Step 2 form ────────────────────────────────────────────────────────────
  const form2 = useForm<Step2>({
    resolver: zodSafeResolver(step2Schema),
    defaultValues: s2Data ?? { address: "", city: "", area: "" },
  });

  // ── Step 3 form ────────────────────────────────────────────────────────────
  const form3 = useForm<Step3>({
    resolver: zodSafeResolver(step3Schema),
    defaultValues: s3Data ?? { notes: "" },
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  const handleNext1 = form1.handleSubmit((data) => {
    setS1Data(data);
    setStep(1);
  });

  const handleNext2 = form2.handleSubmit((data) => {
    setS2Data(data);
    setStep(2);
  });

  const handleNext3 = form3.handleSubmit((data) => {
    setS3Data(data);
    setStep(3);
  });

  const handleBack = () => setStep((p) => Math.max(0, p - 1));

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!s1Data || !s2Data) return;

    const scheduledAt = new Date(s1Data.scheduledDate);
    const [h, m] = s1Data.scheduledTime.split(":").map(Number);
    scheduledAt.setHours(h, m, 0, 0);

    const formData = new FormData();
    formData.append("providerId", providerId!);
    formData.append("categoryId", s1Data.categoryId);
    formData.append("scheduledAt", scheduledAt.toISOString());
    formData.append("address", s2Data.address);
    formData.append("city", s2Data.city);
    formData.append("area", s2Data.area);
    if (s3Data?.notes) formData.append("notes", s3Data.notes);
    if (attachment) formData.append("attachment", attachment);

    try {
      setSubmitting(true);
      setSubmitError(null);
      await api.post("/customer/bookings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(ROUTES.CUSTOMER_BOOKINGS + "?booked=1");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Something went wrong. Please try again.";
      setSubmitError(msg);
      setSubmitting(false);
    }
  };

  // ── Selected service name ──────────────────────────────────────────────────

  const selectedService = provider?.services?.find(
    (s) => s.id === selectedCategoryId,
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 space-y-5">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p
          className="text-lg font-semibold"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Provider not found
        </p>
        <Button variant="outline" asChild>
          <Link to={ROUTES.BROWSE}>Back to browse</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link
        to={r(ROUTES.PROVIDER_PROFILE, { id: providerId! })}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back to profile
      </Link>

      {/* Page title */}
      <div>
        <h1
          className="text-2xl font-semibold text-foreground"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Book a service
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {STEPS[step].label} — Step {step + 1} of {STEPS.length}
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator current={step} />

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        {/* ── Left column: forms ──────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Provider summary — mobile only */}
          <div className="lg:hidden">
            <ProviderMini provider={provider} />
          </div>

          {/* ── Step 1: Service & Schedule ─────────────────────────────────── */}
          {step === 0 && (
            <form onSubmit={handleNext1} className="space-y-5">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarDays className="size-4 text-brand-orange" />
                    Choose a service
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {provider.services && provider.services.length > 0 ? (
                    <Controller
                      control={form1.control}
                      name="categoryId"
                      render={({ field }) => (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {provider.services!.map((svc) => {
                            const selected = field.value === svc.id;
                            return (
                              <button
                                key={svc.id}
                                type="button"
                                onClick={() => field.onChange(svc.id)}
                                className={cn(
                                  "relative flex flex-col rounded-2xl border bg-card text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring overflow-hidden",
                                  selected
                                    ? "border-brand-orange ring-1 ring-brand-orange shadow-md"
                                    : "border-border hover:border-(--brand-orange)/40 hover:shadow-sm",
                                )}
                              >
                                {/* Category badge – top right */}
                                <span className="absolute top-3 right-3 max-w-32 truncate rounded-full border border-border bg-background/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                  {svc.name}
                                </span>

                                {/* Top content */}
                                <div className="flex-1 space-y-2.5 px-4 pt-4 pb-3">
                                  {/* Icon bubble */}
                                  <div className="size-12 rounded-xl bg-muted/60 flex items-center justify-center text-2xl leading-none">
                                    {svc.icon ?? "🔧"}
                                  </div>

                                  {/* Name + description */}
                                  <div className="space-y-1 pr-14">
                                    <p
                                      className="text-base font-semibold text-foreground leading-snug"
                                      style={{ fontFamily: "Fraunces, serif" }}
                                    >
                                      {svc.name}
                                    </p>
                                    {svc.description && (
                                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                        {svc.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Bottom bar */}
                                <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
                                  {/* Price */}
                                  <div>
                                    {svc.basePrice ? (
                                      <>
                                        <p className="text-sm font-bold text-foreground">
                                          From ₹
                                          {Number(svc.basePrice).toLocaleString(
                                            "en-IN",
                                          )}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                          base price
                                        </p>
                                      </>
                                    ) : (
                                      <p className="text-xs text-muted-foreground">
                                        Price on request
                                      </p>
                                    )}
                                  </div>

                                  {/* Rating + CTA */}
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      <Star className="size-3.5 fill-amber-400 text-amber-400 shrink-0" />
                                      <span className="text-xs font-semibold text-foreground">
                                        {Number(provider.avgRating).toFixed(1)}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground">
                                        ({provider.totalReviews})
                                      </span>
                                    </div>
                                    <span
                                      className={cn(
                                        "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                                        selected
                                          ? "bg-emerald-500 text-white"
                                          : "bg-brand-orange text-white",
                                      )}
                                    >
                                      {selected ? "✓ Selected" : "Book Now"}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      This provider has no services listed yet.
                    </p>
                  )}
                  {form1.formState.errors.categoryId && (
                    <p className="text-xs text-destructive mt-2">
                      {form1.formState.errors.categoryId.message}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="size-4 text-brand-orange" />
                    Pick a date & time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Controller
                    control={form1.control}
                    name="scheduledDate"
                    render={({ field }) => (
                      <div>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          className="mx-auto"
                        />
                        {form1.formState.errors.scheduledDate && (
                          <p className="text-xs text-destructive mt-1">
                            {form1.formState.errors.scheduledDate.message}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  {selectedDate && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Available time slots for{" "}
                        {selectedDate.toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                      <Controller
                        control={form1.control}
                        name="scheduledTime"
                        render={({ field }) => (
                          <div className="grid grid-cols-4 gap-1.5">
                            {TIME_SLOTS.map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => field.onChange(t)}
                                className={cn(
                                  "rounded-lg border py-1.5 text-xs font-medium transition-colors",
                                  field.value === t
                                    ? "border-brand-orange bg-brand-orange text-white"
                                    : "border-border hover:border-(--brand-orange)/40 text-foreground",
                                )}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        )}
                      />
                      {form1.formState.errors.scheduledTime && (
                        <p className="text-xs text-destructive mt-1">
                          {form1.formState.errors.scheduledTime.message}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="w-full h-10 bg-brand-orange hover:bg-(--brand-orange)/90 text-white gap-2"
              >
                Continue
                <ArrowRight className="size-4" />
              </Button>
            </form>
          )}

          {/* ── Step 2: Address ────────────────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleNext2} className="space-y-5">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="size-4 text-brand-orange" />
                    Service address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Field
                    label="Full address"
                    error={form2.formState.errors.address?.message}
                    required
                  >
                    <Textarea
                      {...form2.register("address")}
                      placeholder="Flat / house no., building, street…"
                      className="min-h-20 resize-none"
                      aria-invalid={!!form2.formState.errors.address}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="City"
                      error={form2.formState.errors.city?.message}
                      required
                    >
                      <Input
                        {...form2.register("city")}
                        placeholder="Mumbai"
                        className="h-9"
                        aria-invalid={!!form2.formState.errors.city}
                      />
                    </Field>
                    <Field
                      label="Area / Locality"
                      error={form2.formState.errors.area?.message}
                      required
                    >
                      <Input
                        {...form2.register("area")}
                        placeholder="Bandra West"
                        className="h-9"
                        aria-invalid={!!form2.formState.errors.area}
                      />
                    </Field>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 flex-1"
                  onClick={handleBack}
                >
                  <ArrowLeft className="size-4 mr-1" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="h-10 flex-1 bg-brand-orange hover:bg-(--brand-orange)/90 text-white gap-2"
                >
                  Continue
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          )}

          {/* ── Step 3: Notes & Photo ──────────────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleNext3} className="space-y-5">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="size-4 text-brand-orange" />
                    Additional details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Field
                    label="Notes for the professional"
                    error={form3.formState.errors.notes?.message}
                  >
                    <Textarea
                      {...form3.register("notes")}
                      placeholder="Describe the issue, size of the job, specific requirements…"
                      className="min-h-28 resize-none"
                    />
                  </Field>

                  <div>
                    <Label className="mb-1.5 block">
                      Attach a photo (optional)
                    </Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setAttachment(e.target.files?.[0] ?? null)
                      }
                    />
                    {attachment ? (
                      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                        <div className="size-12 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={URL.createObjectURL(attachment)}
                            alt="preview"
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(attachment.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAttachment(null)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-8 text-center transition-colors hover:border-(--brand-orange)/50 hover:bg-(--brand-orange)/5"
                      >
                        <ImageIcon className="size-8 text-muted-foreground/50" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Upload a photo
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            JPG, PNG or WebP up to 5 MB
                          </p>
                        </div>
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 flex-1"
                  onClick={handleBack}
                >
                  <ArrowLeft className="size-4 mr-1" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="h-10 flex-1 bg-brand-orange hover:bg-(--brand-orange)/90 text-white gap-2"
                >
                  Review
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          )}

          {/* ── Step 4: Review & Confirm ───────────────────────────────────── */}
          {step === 3 && s1Data && s2Data && (
            <div className="space-y-5">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-brand-orange" />
                    Review your booking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {/* Service */}
                  <ConfirmRow
                    icon="🔧"
                    label="Service"
                    value={selectedService?.name ?? s1Data.categoryId}
                  />
                  <Separator />

                  {/* Date & Time */}
                  <ConfirmRow
                    icon="📅"
                    label="Date & time"
                    value={`${s1Data.scheduledDate.toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })} at ${s1Data.scheduledTime}`}
                  />
                  <Separator />

                  {/* Address */}
                  <ConfirmRow
                    icon="📍"
                    label="Address"
                    value={`${s2Data.address}, ${s2Data.area}, ${s2Data.city}`}
                  />
                  <Separator />

                  {/* Notes */}
                  {s3Data?.notes && (
                    <>
                      <ConfirmRow
                        icon="📝"
                        label="Notes"
                        value={s3Data.notes}
                      />
                      <Separator />
                    </>
                  )}

                  {/* Photo */}
                  {attachment && (
                    <>
                      <ConfirmRow
                        icon="🖼️"
                        label="Attachment"
                        value={attachment.name}
                      />
                      <Separator />
                    </>
                  )}

                  {/* Estimated cost */}
                  {provider.hourlyRate && (
                    <div className="rounded-xl bg-(--brand-orange)/5 border border-(--brand-orange)/20 px-4 py-3 space-y-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        Estimated cost
                      </p>
                      <p className="text-xl font-bold text-brand-orange">
                        ₹{Number(provider.hourlyRate).toLocaleString("en-IN")}
                        <span className="text-sm font-normal text-muted-foreground">
                          /hour
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Final price confirmed after the job is completed.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Error */}
              {submitError && (
                <p className="text-sm text-destructive text-center bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                  {submitError}
                </p>
              )}

              {/* T&Cs note */}
              <p className="text-xs text-muted-foreground text-center leading-relaxed px-2">
                By booking, you agree to Nearly's{" "}
                <span className="underline cursor-pointer">
                  Terms of Service
                </span>
                . You can cancel for free before the provider confirms.
              </p>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 flex-1"
                  onClick={handleBack}
                >
                  <ArrowLeft className="size-4 mr-1" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="h-10 flex-1 bg-brand-orange hover:bg-(--brand-orange)/90 text-white gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Booking…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
        {/* end left column */}

        {/* ── Right column: sticky summary (desktop only) ─────────────── */}
        <div className="hidden lg:flex flex-col gap-4 sticky top-20">
          <ProviderMini provider={provider} />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                Booking summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!selectedCategoryId && !s1Data ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Complete the steps to see your summary
                </p>
              ) : (
                <>
                  {(selectedCategoryId || s1Data) && (
                    <div className="flex items-start gap-2.5">
                      <span className="text-base shrink-0 mt-0.5">🔧</span>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                          Service
                        </p>
                        <p className="text-sm font-semibold text-foreground truncate">
                          {selectedService?.name ?? s1Data?.categoryId ?? "—"}
                        </p>
                      </div>
                    </div>
                  )}
                  {s1Data && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-2.5">
                        <span className="text-base shrink-0 mt-0.5">📅</span>
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                            Date & time
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {s1Data.scheduledDate.toLocaleDateString("en-IN", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}{" "}
                            at {s1Data.scheduledTime}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  {s2Data && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-2.5">
                        <span className="text-base shrink-0 mt-0.5">📍</span>
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                            Address
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {s2Data.area}, {s2Data.city}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {s2Data.address}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {provider.hourlyRate && (
                <>
                  <Separator />
                  <div className="rounded-lg bg-(--brand-orange)/5 border border-(--brand-orange)/15 px-3 py-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-0.5">
                      Estimated rate
                    </p>
                    <p className="text-xl font-bold text-brand-orange">
                      ₹{Number(provider.hourlyRate).toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        /hr
                      </span>
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* end grid */}
    </div>
  );
}

function ConfirmRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="text-base leading-none mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium mb-0.5">
          {label}
        </p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}
