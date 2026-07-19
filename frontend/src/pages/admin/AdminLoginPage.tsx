import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, Mail, Snowflake } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../../contexts/AuthContext";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const { login, status, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function onSubmit(values: LoginFormValues) {
    setLoginError("");

    try {
      await login(values);
      navigate("/admin/dashboard", { replace: true });
    } catch {
      setLoginError("Invalid email or password.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-cyan-400 text-slate-950">
            <Snowflake className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-bold">RRDS Admin</p>
            <p className="text-sm text-slate-300">Airconditioning Services</p>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white p-6 text-slate-950 shadow-2xl sm:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Secure Access
            </p>
            <h1 className="mt-2 text-2xl font-bold">Sign in to dashboard</h1>
          </div>

          <form className="space-y-5" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
            <div>
              <label className="text-sm font-semibold text-slate-800" htmlFor="email">
                Email
              </label>
              <div className="mt-2 flex min-h-12 items-center gap-3 rounded-md border border-slate-300 bg-white px-3 focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-100">
                <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
                  {...register("email")}
                />
              </div>
              {errors.email ? (
                <p className="mt-2 text-sm font-medium text-red-700">{errors.email.message}</p>
              ) : null}
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-800" htmlFor="password">
                Password
              </label>
              <div className="mt-2 flex min-h-12 items-center gap-3 rounded-md border border-slate-300 bg-white px-3 focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-100">
                <LockKeyhole className="h-5 w-5 text-slate-400" aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
                  {...register("password")}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((isShown) => !isShown)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password ? (
                <p className="mt-2 text-sm font-medium text-red-700">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            {loginError ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {loginError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
