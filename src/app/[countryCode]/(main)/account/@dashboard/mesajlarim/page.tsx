import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { listConversations } from "@lib/data/messages"
import Messages from "@modules/account/components/messages"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("messagesTitle"),
    description: t("messagesDescription"),
  }
}

export default async function MessagesPage() {
  const t = await getTranslations("messages")
  const { conversations } = await listConversations()

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-extrabold text-ui-fg-base flex items-center gap-2">
          💬 {t("title")}
        </h1>
        <p className="text-xs text-ui-fg-muted mt-1">{t("subtitle")}</p>
      </div>

      <Messages
        initialConversations={conversations}
        labels={{
          empty: t("empty"),
          emptyHint: t("emptyHint"),
          selectPrompt: t("selectPrompt"),
          placeholder: t("placeholder"),
          send: t("send"),
          sending: t("sending"),
          you: t("you"),
          seller: t("seller"),
          order: t("order"),
          sendError: t("sendError"),
          loading: t("loading"),
        }}
      />
    </div>
  )
}
