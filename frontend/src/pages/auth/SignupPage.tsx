import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Wrench,
  Home,
  Check,
} from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { zodSafeResolver } from "@/lib/zod-resolver";
import type { UserRole } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  role: z.enum(["customer", "provider"]),
});

type FormValues = z.infer<typeof schema>;

const roleOptions: {
  value: "customer" | "provider";
  label: string;
  subtitle: string;
  icon: typeof Home;
}[] = [
  {
    value: "customer",
    label: "I need services",
    subtitle: "Book trusted professionals",
    icon: Home,
  },
  {
    value: "provider",
    label: "I offer services",
    subtitle: "Grow your business",
    icon: Wrench,
  },
];

const passwordChecks = [
  { label: "8+ characters", test: (v: string) => v.length >= 8 },
  { label: "Uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Number", test: (v: string) => /[0-9]/.test(v) },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodSafeResolver(schema),
    defaultValues: { role: "customer" },
  });

  const selectedRole = useWatch({ control, name: "role" }) ?? "customer";
  const passwordValue = useWatch({ control, name: "password" }) ?? "";
  const passwordTouched = passwordValue.length > 0;

  async function onSubmit(values: FormValues) {
    setServerError(null);

    const { data, error } = await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      ...(values.role && { role: values.role }),
      ...(values.phone && { phone: values.phone }),
    } as Parameters<typeof signUp.email>[0]);

    if (error) {
      setServerError(error.message ?? "Could not create account. Try again.");
      return;
    }

    if (data?.user) {
      const role: UserRole = values.role;
      if (role === "provider") {
        navigate("/provider/profile", { replace: true });
      } else {
        navigate("/customer/dashboard", { replace: true });
      }
    }
  }

  return (
    <Card className="w-full shadow-sm ring-1 ring-foreground/6">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle
          className="text-[1.5rem] leading-tight font-semibold tracking-tight"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Create your account
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Join Nearly and get things done.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-3">
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          {/* Role selector */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">I want to…</Label>
            <div className="grid grid-cols-2 gap-2">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setValue("role", option.value, { shouldValidate: true })
                  }
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all",
                    "hover:border-primary/40 hover:bg-primary/3",
                    selectedRole === option.value
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex size-7 items-center justify-center rounded-lg shrink-0",
                        selectedRole === option.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <option.icon className="size-3.5" />
                    </div>
                    <span className="text-sm font-medium text-foreground leading-tight">
                      {option.label}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground pl-9">
                    {option.subtitle}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Name + Email side-by-side on wider screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name" className="text-sm font-medium">
                Full name
              </Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                autoFocus
                placeholder="Arjun Sharma"
                aria-invalid={!!errors.name}
                {...register("name")}
                className={cn(
                  "h-9",
                  errors.name &&
                    "border-destructive focus-visible:ring-destructive/30",
                )}
              />
              {errors.name && (
                <p className="text-xs text-destructive flex items-start gap-1">
                  <span className="mt-px">⚠</span>
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                {...register("email")}
                className={cn(
                  "h-9",
                  errors.email &&
                    "border-destructive focus-visible:ring-destructive/30",
                )}
              />
              {errors.email && (
                <p className="text-xs text-destructive flex items-start gap-1">
                  <span className="mt-px">⚠</span>
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone" className="text-sm font-medium">
              Mobile number{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <div className="flex">
              <span className="inline-flex h-9 items-center rounded-lg rounded-r-none border border-r-0 border-input bg-muted px-2.5 text-sm text-muted-foreground select-none">
                +91
              </span>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="98765 43210"
                aria-invalid={!!errors.phone}
                {...register("phone")}
                className={cn(
                  "h-9 rounded-l-none",
                  errors.phone &&
                    "border-destructive focus-visible:ring-destructive/30",
                )}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-destructive flex items-start gap-1">
                <span className="mt-px">⚠</span>
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a strong password"
                aria-invalid={!!errors.password}
                {...register("password")}
                className={cn(
                  "h-9 pr-10",
                  errors.password &&
                    !passwordTouched &&
                    "border-destructive focus-visible:ring-destructive/30",
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>

            {/* Live password requirement chips */}
            {passwordTouched && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {passwordChecks.map((c) => {
                  const ok = c.test(passwordValue);
                  return (
                    <span
                      key={c.label}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium transition-colors",
                        ok
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-muted text-muted-foreground border border-border",
                      )}
                    >
                      {ok ? (
                        <Check className="size-2.5 stroke-3" />
                      ) : (
                        <span className="size-2.5 inline-block rounded-full bg-current opacity-40" />
                      )}
                      {c.label}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Only show the error text if the user hasn't typed yet (edge case from submit) */}
            {errors.password && !passwordTouched && (
              <p className="text-xs text-destructive flex items-start gap-1">
                <span className="mt-px">⚠</span>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <div className="rounded-lg bg-destructive/8 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
              {serverError}
            </div>
          )}

          {/* Legal */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            By signing up you agree to our{" "}
            <a
              href="#"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Privacy Policy
            </a>
            .
          </p>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 w-full gap-2 font-medium"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                Create account
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>

          {/* Sign in link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
