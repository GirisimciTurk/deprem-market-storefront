/**
 * Üst menünün hesap bağlantısının etiketi (nav mesajlarının anahtarı): oturum
 * açıksa "Hesabım", değilse "Giriş Yap".
 */
export function accountLinkLabelKey(signedIn: boolean): "account" | "loginLabel" {
  return signedIn ? "account" : "loginLabel"
}
