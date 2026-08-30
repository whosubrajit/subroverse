import { z } from "zod"

export const siteSettingsSchema = z.object({
  homeEyebrow: z.string().trim().min(1).max(120),
  homeIntroduction: z.string().trim().min(1).max(1200),
  newsletterEnabled: z.boolean(),
  newsletterTitle: z.string().trim().min(1).max(180),
  newsletterDescription: z.string().trim().min(1).max(1200),
  newsletterDelaySeconds: z.number().finite().min(0).max(60),
  newsletterConfirmation: z.string().trim().min(1).max(500),
  profileName: z.string().trim().min(1).max(100),
  profileTitle: z.string().trim().min(1).max(100),
  profileHandle: z.string().trim().min(1).max(100),
  profileContactText: z.string().trim().min(1).max(50),
  profileContactUrl: z.string().trim().url(),
}).strict()

export type PublicSiteSettings = z.infer<typeof siteSettingsSchema>

export const defaultSiteSettings: PublicSiteSettings = {
  homeEyebrow: "a coping mechanism named",
  homeIntroduction: "These are not published stories. They are letters that became too long, observations that became too precise, and feelings that refused to stay feeling.",
  newsletterEnabled: true,
  newsletterTitle: "The story is moving, but its honesty remains.",
  newsletterDescription: "SubroVerse is shifting platforms. Leave your email and I’ll send you a quiet note whenever a new piece is published—nothing more, nothing noisy.",
  newsletterDelaySeconds: 0.9,
  newsletterConfirmation: "You’re in. I’ll write when something new is published.",
  profileName: "Subroooo",
  profileTitle: "Author",
  profileHandle: "subra.lmao",
  profileContactText: "Contact Me",
  profileContactUrl: "https://subro.openinapp.co/insta",
}
