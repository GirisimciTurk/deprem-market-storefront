import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import LoginTemplate from "@modules/account/templates/login-template"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("loginTitle"),
    description: t("loginDescription"),
  }
}

export default function Login() {
  return <LoginTemplate />
}
