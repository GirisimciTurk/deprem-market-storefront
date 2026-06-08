"use client"

import React, { useState, useActionState, useTransition } from "react"
import { login, initiateGoogleLogin } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)
  const [isPending, startTransition] = useTransition()
  const [googleError, setGoogleError] = useState<string | null>(null)

  const handleGoogleLogin = () => {
    setGoogleError(null)
    startTransition(async () => {
      try {
        const { location } = await initiateGoogleLogin()
        if (location) {
          window.location.href = location
        } else {
          // Already authenticated — reload to pick up the session.
          window.location.reload()
        }
      } catch (err) {
        setGoogleError(
          err instanceof Error ? err.message : "Google ile giriş yapılamadı."
        )
      }
    })
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight mb-2">
        Tekrar Hoş Geldiniz
      </h1>
      <p className="text-center text-sm text-gray-500 mb-6">
        Gelişmiş bir deprem hazırlık alışveriş deneyimi için oturum açın.
      </p>

      {/* Main Credentials Login Form */}
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-3">
          <Input
            label="E-posta Adresi"
            name="email"
            type="email"
            title="Geçerli bir e-posta girin."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Şifre"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-5 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-lg shadow-sm transition-colors border-0">
          Giriş Yap
        </SubmitButton>
      </form>

      {/* Divider */}
      <div className="w-full flex items-center justify-center my-5 gap-x-3 text-xs text-gray-400 font-bold uppercase select-none">
        <div className="h-px bg-gray-200 flex-1" />
        <span>veya</span>
        <div className="h-px bg-gray-200 flex-1" />
      </div>

      {/* Google Sign-in Button */}
      {googleError && (
        <div className="w-full mb-3 bg-red-50 border border-red-150 text-red-700 text-xs font-semibold p-3 rounded-lg">
          {googleError}
        </div>
      )}
      <button
        onClick={handleGoogleLogin}
        disabled={isPending}
        type="button"
        className="w-full flex items-center justify-center gap-x-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-4 border border-gray-250 rounded-lg shadow-sm transition-all hover:scale-[1.01] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg
          className="w-5 h-5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            fill="#EA4335"
          />
        </svg>
        <span>Google ile Giriş Yap</span>
      </button>

      <span className="text-center text-gray-500 text-xs mt-6 select-none">
        Üye değil misiniz?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="text-orange-600 font-bold hover:underline"
          data-testid="register-button"
        >
          Kayıt Olun
        </button>
      </span>

    </div>
  )
}

export default Login
