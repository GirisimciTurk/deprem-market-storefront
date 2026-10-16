"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import ForgotPassword from "@modules/account/components/forgot-password"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
  FORGOT_PASSWORD = "forgot-password",
}

const LoginTemplate = () => {
  // "?view=register": "Üye ol" bağlantıları doğrudan kayıt formunu açar.
  const initialView =
    useSearchParams().get("view") === LOGIN_VIEW.REGISTER
      ? LOGIN_VIEW.REGISTER
      : LOGIN_VIEW.SIGN_IN
  const [currentView, setCurrentView] = useState<string>(initialView)

  return (
    <div className="w-full flex justify-start px-8 py-8">
      {currentView === "sign-in" && <Login setCurrentView={setCurrentView} />}
      {currentView === "register" && <Register setCurrentView={setCurrentView} />}
      {currentView === "forgot-password" && (
        <ForgotPassword setCurrentView={setCurrentView} />
      )}
    </div>
  )
}

export default LoginTemplate
