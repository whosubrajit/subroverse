export type MessageDevice = {
  deviceType: "Phone" | "Tablet" | "Desktop" | "Unknown"
  operatingSystem: "Android" | "iOS" | "iPadOS" | "Windows" | "macOS" | "ChromeOS" | "Linux" | "Unknown"
}

// Coarse, best-effort labels only. Never retain raw headers or device identifiers.
export function getMessageDevice(headers: Headers): MessageDevice {
  const ua = (headers.get("user-agent") ?? "").slice(0, 1024)
  const platform = (headers.get("sec-ch-ua-platform") ?? "").replaceAll('"', "").trim().toLowerCase()
  const mobile = headers.get("sec-ch-ua-mobile") === "?1"
  let operatingSystem: MessageDevice["operatingSystem"] = "Unknown"

  if (/iPad/i.test(ua)) operatingSystem = "iPadOS"
  else if (/iPhone|iPod/i.test(ua)) operatingSystem = "iOS"
  else if (platform === "android" || /Android/i.test(ua)) operatingSystem = "Android"
  else if (platform === "ios") operatingSystem = "iOS"
  else if (platform === "windows" || /Windows NT/i.test(ua)) operatingSystem = "Windows"
  else if (platform === "chrome os" || /CrOS/i.test(ua)) operatingSystem = "ChromeOS"
  else if (platform === "macos" || /Macintosh|Mac OS X/i.test(ua)) operatingSystem = "macOS"
  else if (platform === "linux" || /Linux/i.test(ua)) operatingSystem = "Linux"

  let deviceType: MessageDevice["deviceType"] = "Unknown"
  if (operatingSystem === "iPadOS" || /Tablet/i.test(ua)) deviceType = "Tablet"
  else if (mobile || /Mobi|iPhone|iPod/i.test(ua) || operatingSystem === "iOS") deviceType = "Phone"
  else if (operatingSystem === "Android") deviceType = /Android/i.test(ua) ? "Tablet" : "Unknown"
  else if (operatingSystem !== "Unknown") deviceType = "Desktop"

  return { deviceType, operatingSystem }
}
