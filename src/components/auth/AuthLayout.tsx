import { cn } from "@/lib/utils"

interface AuthLayoutProps {
  children: React.ReactNode
}

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80"

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left panel — hidden on mobile, visible md+ */}
      <div
        className={cn(
          "relative hidden md:flex md:w-1/2",
          "flex-col justify-end overflow-hidden"
        )}
      >
        {/* Hero image */}
        <img
          src={HERO_IMAGE_URL}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"
          aria-hidden="true"
        />

        {/* Branding — bottom-left, above the overlay */}
        <div className="relative z-10 p-10 pb-12">
          <p className="text-3xl font-bold tracking-tight text-white">Sandy</p>
          <p className="mt-1.5 text-base text-white/80">
            Your workspace, your way.
          </p>
        </div>
      </div>

      {/* Right panel — full width on mobile, half on md+ */}
      <div
        className={cn(
          "flex w-full md:w-1/2",
          "items-center justify-center",
          "bg-background px-6 py-12 sm:px-10"
        )}
      >
        {children}
      </div>
    </div>
  )
}
