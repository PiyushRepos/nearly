import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodSafeResolver } from "@/lib/zod-resolver";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";
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
import type { UserRole } from "@/types";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from
    ?.pathname;

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodSafeResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const { data, error } = await signIn.email({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setServerError(error.message ?? "Invalid email or password.");
      return;
    }

    if (data?.user) {
      const role = (data.user as { role?: UserRole }).role;
      const dashboardMap: Record<NonNullable<UserRole>, string> = {
        customer: "/customer/dashboard",
        provider: "/provider/dashboard",
        admin: "/admin",
      };
      navigate(from ?? (role ? dashboardMap[role] : "/"), { replace: true });
    }
  }

  return (
    <Card className="w-full shadow-sm ring-1 ring-foreground/6">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle
          className="text-[1.6rem] leading-tight font-semibold tracking-tight"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Welcome back
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Sign in to your Nearly account to continue.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-5"
        >
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              {...register("email")}
              className="h-9"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                {...register("password")}
                className="h-9 pr-10"
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
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <div className="rounded-lg bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
              {serverError}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-9 w-full gap-2 font-medium"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">
                Don&apos;t have an account?
              </span>
            </div>
          </div>

          <Button variant="outline" asChild className="h-9 w-full font-medium">
            <Link to="/auth/signup">Create an account</Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
