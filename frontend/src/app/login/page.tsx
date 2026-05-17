"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

const demoAccounts = [
  { email: "admin@imbizo.co.za", password: "Admin@123", role: "Admin" },
  { email: "manager@imbizo.co.za", password: "Manager@123", role: "Store Manager" },
  { email: "receiver@imbizo.co.za", password: "Receiver@123", role: "Receiver" },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "manager@imbizo.co.za", password: "Manager@123" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await login(data.email, data.password);
      setAuth(response);
      toast.success(`Welcome back, ${response.fullName}`);
      router.push("/dashboard");
    } catch {
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-black p-12 lg:flex">
        <div className="absolute inset-0 gold-gradient opacity-10" />
        <Image src="/logo-full.png" alt="Imbizo Shisanyama" width={280} height={80} className="relative z-10" />
        <div className="relative z-10 max-w-md space-y-4">
          <h2 className="text-3xl font-bold text-gold">Enterprise Inventory</h2>
          <p className="text-zinc-400">
            Digitize stock receiving, approvals, and inventory tracking for your shisanyama operations.
          </p>
        </div>
        <p className="relative z-10 text-sm text-zinc-600">© 2026 Imbizo Shisanyama</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <Card className="w-full max-w-md border-gold/20 bg-card/80 backdrop-blur">
          <CardHeader className="text-center">
            <Image src="/logo-icon.png" alt="" width={56} height={56} className="mx-auto mb-2 lg:hidden" />
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>Access the inventory management portal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Demo accounts (click to fill)</p>
              {demoAccounts.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  className="w-full rounded-lg border border-border px-3 py-2 text-left text-xs hover:border-gold/40 hover:bg-gold/5"
                  onClick={() => { setValue("email", a.email); setValue("password", a.password); }}
                >
                  <span className="font-medium text-gold">{a.role}</span>
                  <span className="text-muted-foreground"> — {a.email}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
