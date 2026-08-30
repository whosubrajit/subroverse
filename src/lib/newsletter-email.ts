import { z } from "zod"

export const newsletterEmailError = "Please use a valid @gmail.com or @icloud.com email address."

export const newsletterEmailSchema = z.string().trim().toLowerCase()
  .pipe(z.email().max(320))
  .refine(email => {
    const domain = email.split("@")[1]
    return domain === "gmail.com" || domain === "icloud.com"
  }, newsletterEmailError)
