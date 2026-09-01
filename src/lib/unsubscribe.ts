export function unsubscribeUrl(origin: string) {
  return new URL("/unsubscribe", origin).toString()
}
