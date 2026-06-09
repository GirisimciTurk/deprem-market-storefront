// Fallback for the implicit `children` slot on the base /account route, so the
// layout can safely render {children} for explicit segments like google-callback.
export default function Default() {
  return null
}
