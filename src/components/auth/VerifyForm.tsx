import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { verifyEmail } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const verifySchema = z.object({
  email: z.string().min(1, "Email is required").email("Must be a valid email"),
  code: z
    .string()
    .min(1, "Verification code is required")
    .regex(/^[0-9]{6}$/, "Enter the 6-digit code"),
})

type VerifyFormValues = z.infer<typeof verifySchema>

export function VerifyForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const presetEmail = (location.state as { email?: string } | null)?.email ?? ""

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { email: presetEmail, code: "" },
  })

  async function onSubmit(data: VerifyFormValues) {
    try {
      await verifyEmail(data.email, data.code)
      navigate("/login", { state: { verified: true } })
    } catch (err) {
      setError("root", {
        message:
          err instanceof Error ? err.message : "Verification failed. Try again.",
      })
    }
  }

  return (
    <div className="w-full max-w-md">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            Enter the 6-digit code we sent to your email address.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            {errors.root && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errors.root.message}
              </p>
            )}

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register("email")}
                className={cn(errors.email && "border-destructive")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                autoComplete="one-time-code"
                {...register("code")}
                className={cn(
                  "tracking-[0.4em]",
                  errors.code && "border-destructive"
                )}
              />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isSubmitSuccessful}
            >
              Verify Email
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Back to{" "}
        <Link
          to="/login"
          className="font-medium underline underline-offset-4 hover:text-primary"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
