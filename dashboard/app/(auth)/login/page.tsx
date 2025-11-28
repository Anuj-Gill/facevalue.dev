import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-3 self-center font-semibold text-xl">
          {/* Logo placeholder */}
          <div className="bg-orange-500 text-white flex size-8 items-center justify-center rounded-xl">
            <span className="text-sm font-bold">M</span>
          </div>
          <span className="text-white">MemeExchange</span>
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
