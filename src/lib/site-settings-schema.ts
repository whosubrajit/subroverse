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
  aboutBioName: z.string().trim().min(1).max(100),
  aboutBioTitle: z.string().trim().min(1).max(100),
  aboutBioText: z.string().trim().min(1).max(2000),
  aboutSiteEyebrow: z.string().trim().min(1).max(100),
  aboutSiteTitle: z.string().trim().min(1).max(150),
  aboutSiteText: z.string().trim().min(1).max(2000),
  aboutSiteQuote: z.string().trim().min(1).max(500),
}).strict()

export type PublicSiteSettings = z.infer<typeof siteSettingsSchema>

export const defaultSiteSettings: PublicSiteSettings = {
  homeEyebrow: "a coping mechanism named",
  homeIntroduction: "Subrajit's Letters that became too long, observations that became too precise, and feelings that refused to stay feeling.",
  newsletterEnabled: true,
  newsletterTitle: "The story is moving, but its honesty remains.",
  newsletterDescription: "SubroVerse is shifting platforms. Leave your email and I’ll send you a quiet note whenever a new piece is published—nothing more, nothing noisy.",
  newsletterDelaySeconds: 0.9,
  newsletterConfirmation: "You’re in. I’ll write when something new is published.",
  profileName: "Subrajit",
  profileTitle: "Author",
  profileHandle: "subrajit",
  profileContactText: "Contact Me",
  profileContactUrl: "https://subro.openinapp.co/insta",
  aboutBioName: "Subrajit",
  aboutBioTitle: "Writer · Dhaka",
  aboutBioText: "Subro writes because the feeling is always larger than the silence it lives in. These stories began as private notes — observations too precise to discard, letters too long to send — and became something quieter than confession and louder than a diary.\n\nHe is interested in the small liturgies of loving someone: the counterclockwise stir, the second laugh, the paper that says don't forget. He writes in Bengali and English, sometimes in the same sentence, because neither language alone is sufficient.\n\nThis site is not meant to be found. If you are here, you understand.",
  aboutSiteEyebrow: "about this place",
  aboutSiteTitle: "A garden of\nquiet devotion",
  aboutSiteText: "I write because loving her has made the language feel insufficient, and I keep trying anyway. This site is not meant to be found. If you are here, you are either her, or you understand what it means to feel something too large for silence.\n\nEverything here is true. The names are changed. The feelings are not.",
  aboutSiteQuote: "\"She is the metaphor I keep reaching for and never quite finishing.\"",
}
