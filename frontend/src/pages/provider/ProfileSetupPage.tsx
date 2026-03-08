import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import useSWR from "swr";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodSafeResolver } from "@/lib/zod-resolver";
import {
  User,
  DollarSign,
  ImageIcon,
  X,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes";
import type {
  ServiceCategory,
  ProviderProfile,
  ListResponse,
  SingleResponse,
} from "@/types";
import { api } from "@/lib/api";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  bio: z.string().optional(),
  city: z.string().min(2, "Enter your city"),
  area: z.string().min(2, "Enter your area / locality"),
  hourlyRate: z
    .string()
    .optional()
    .refine(
      (v) => !v || (!isNaN(Number(v)) && Number(v) > 0),
      "Enter a valid hourly rate",
    ),
  categoryIds: z
    .array(z.string())
    .min(1, "Select at least one service category"),
  availabilityStatus: z.enum(["available", "busy", "unavailable"]),
});

type FormData = z.infer<typeof schema>;

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchCategories(): Promise<ServiceCategory[]> {
  const res = await api.get<ListResponse<ServiceCategory>>("/categories");
  return res.data.data;
}

async function fetchOwnProfile(): Promise<ProviderProfile | null> {
  try {
    const res =
      await api.get<SingleResponse<ProviderProfile>>("/provider/profile");
    return res.data.data;
  } catch {
    return null;
  }
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
  required,
  hint,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
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
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProviderProfileSetupPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: existingProfile, isLoading: profileLoading } = useSWR(
    "/provider/profile/own",
    fetchOwnProfile,
    { revalidateOnFocus: false },
  );

  const { data: categories, isLoading: catLoading } = useSWR(
    "/categories",
    fetchCategories,
    { revalidateOnFocus: false },
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodSafeResolver(schema),
    defaultValues: {
      bio: "",
      city: "",
      area: "",
      hourlyRate: "",
      categoryIds: [],
      availabilityStatus: "available",
    },
  });

  // Pre-fill form when existing profile loads
  useEffect(() => {
    if (existingProfile) {
      reset({
        bio: existingProfile.bio ?? "",
        city: existingProfile.city,
        area: existingProfile.area,
        hourlyRate: existingProfile.hourlyRate ?? "",
        categoryIds: existingProfile.services?.map((s) => s.id) ?? [],
        availabilityStatus: existingProfile.availabilityStatus,
      });
      if (existingProfile.coverPhotoUrl) {
        setCoverPreview(existingProfile.coverPhotoUrl);
      }
    }
  }, [existingProfile, reset]);

  const selectedCategoryIds = watch("categoryIds");
  const isEditing = !!existingProfile;

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPhoto(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    if (data.bio) formData.append("bio", data.bio);
    formData.append("city", data.city);
    formData.append("area", data.area);
    if (data.hourlyRate) formData.append("hourlyRate", data.hourlyRate);
    data.categoryIds.forEach((id) => formData.append("categoryIds[]", id));
    if (coverPhoto) formData.append("coverPhoto", coverPhoto);

    try {
      setSubmitting(true);
      if (isEditing) {
        await api.put("/provider/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        // Update availability separately if needed
        await api.patch("/provider/profile/availability", {
          status: data.availabilityStatus,
        });
      } else {
        await api.post("/provider/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      navigate(ROUTES.PROVIDER_DASHBOARD);
    } finally {
      setSubmitting(false);
    }
  };

  if (profileLoading || catLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-10 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-semibold text-foreground"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          {isEditing ? "Edit your profile" : "Set up your profile"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isEditing
            ? "Update your details — changes reflect immediately once approved."
            : "Complete your profile to start receiving bookings from customers."}
        </p>
      </div>

      {/* Approval notice if pending */}
      {isEditing && !existingProfile?.isApproved && (
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <RefreshCw className="size-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            Your profile is pending admin approval. You'll start receiving
            bookings once approved.
          </p>
        </div>
      )}
      {isEditing && existingProfile?.isApproved && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          Your profile is approved and visible to customers.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* ── Cover photo ──────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="size-4 text-[var(--brand-orange)]" />
              Cover photo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />
            {coverPreview ? (
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="h-40 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverPhoto(null);
                    setCoverPreview(null);
                  }}
                  className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 rounded-lg bg-black/50 text-white text-xs px-2.5 py-1 hover:bg-black/70 transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border py-10 text-center transition-colors hover:border-[var(--brand-orange)]/50 hover:bg-[var(--brand-orange)]/5"
              >
                <ImageIcon className="size-8 text-muted-foreground/40" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Add a cover photo
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Shows on your public profile — JPG, PNG, up to 5 MB
                  </p>
                </div>
              </button>
            )}
          </CardContent>
        </Card>

        {/* ── Basic info ────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="size-4 text-[var(--brand-orange)]" />
              Basic information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field
              label="Bio"
              error={errors.bio?.message}
              hint="Tell customers about your experience, specialities, and what sets you apart."
            >
              <Textarea
                {...register("bio")}
                placeholder="e.g. I've been a licensed electrician for 8 years…"
                className="min-h-24 resize-none"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="City" error={errors.city?.message} required>
                <Input
                  {...register("city")}
                  placeholder="Mumbai"
                  className="h-9"
                  aria-invalid={!!errors.city}
                />
              </Field>
              <Field
                label="Area / Locality"
                error={errors.area?.message}
                required
              >
                <Input
                  {...register("area")}
                  placeholder="Andheri West"
                  className="h-9"
                  aria-invalid={!!errors.area}
                />
              </Field>
            </div>

            <Field
              label="Hourly rate (₹)"
              error={errors.hourlyRate?.message}
              hint="This is your base hourly rate. Final pricing is confirmed after job completion."
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ₹
                </span>
                <Input
                  {...register("hourlyRate")}
                  type="number"
                  min="0"
                  step="50"
                  placeholder="500"
                  className="h-9 pl-7"
                  aria-invalid={!!errors.hourlyRate}
                />
              </div>
            </Field>

            {isEditing && (
              <Field
                label="Availability"
                error={errors.availabilityStatus?.message}
              >
                <Controller
                  control={control}
                  name="availabilityStatus"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">🟢 Available</SelectItem>
                        <SelectItem value="busy">🟡 Busy</SelectItem>
                        <SelectItem value="unavailable">
                          🔴 Unavailable
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            )}
          </CardContent>
        </Card>

        {/* ── Services ──────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="size-4 text-[var(--brand-orange)]" />
              Services you offer
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {selectedCategoryIds.length} selected
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {catLoading ? (
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : (
              <Controller
                control={control}
                name="categoryIds"
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {categories?.map((cat) => {
                      const checked = field.value.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            field.onChange(
                              checked
                                ? field.value.filter((id) => id !== cat.id)
                                : [...field.value, cat.id],
                            );
                          }}
                          className={cn(
                            "flex items-start gap-2 rounded-xl border p-3 text-left transition-all focus-visible:ring-2 focus-visible:ring-ring",
                            checked
                              ? "border-[var(--brand-orange)] bg-[var(--brand-orange)]/5 ring-1 ring-[var(--brand-orange)]"
                              : "border-border hover:border-[var(--brand-orange)]/30 hover:bg-muted/30",
                          )}
                        >
                          <span className="text-lg leading-none mt-0.5 shrink-0">
                            {cat.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground leading-tight">
                              {cat.name}
                            </p>
                            {cat.basePrice && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                From ₹
                                {Number(cat.basePrice).toLocaleString("en-IN")}
                              </p>
                            )}
                          </div>
                          {checked && (
                            <CheckCircle2 className="size-3.5 text-[var(--brand-orange)] shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            )}
            {errors.categoryIds && (
              <p className="text-xs text-destructive mt-2">
                {errors.categoryIds.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-10 bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 text-white gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {isEditing ? "Saving…" : "Creating profile…"}
            </>
          ) : isEditing ? (
            "Save changes"
          ) : (
            "Create profile"
          )}
        </Button>
      </form>
    </div>
  );
}
