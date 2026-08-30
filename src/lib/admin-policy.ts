type AdminEnvironment = { ADMIN_EMAILS?: string; ADMIN_EMAIL?: string }

export function isAdminEmail(email: string, environment: AdminEnvironment = {
  ADMIN_EMAILS: process.env.ADMIN_EMAILS,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
}) {
  const allowedEmails = [
    ...(environment.ADMIN_EMAILS?.split(",") ?? []),
    environment.ADMIN_EMAIL ?? "",
  ].map((value) => value.trim().toLowerCase()).filter(Boolean)

  return allowedEmails.includes(email.trim().toLowerCase())
}
