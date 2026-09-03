import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

export const storyStatus = pgEnum("story_status", [
  "draft",
  "scheduled",
  "published",
  "archived",
])

export const subscriberStatus = pgEnum("subscriber_status", [
  "pending",
  "active",
  "unsubscribed",
  "bounced",
  "complained",
])

export const campaignStatus = pgEnum("campaign_status", [
  "draft",
  "scheduled",
  "sending",
  "sent",
  "cancelled",
])

export const media = pgTable(
  "media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storageKey: text("storage_key").notNull().unique(),
    url: text("url").notNull(),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    bytes: integer("bytes").notNull(),
    width: integer("width"),
    height: integer("height"),
    altText: text("alt_text").notNull().default(""),
    caption: text("caption"),
    focalPoint: jsonb("focal_point").$type<{ x: number; y: number }>(),
    uploadedBy: text("uploaded_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("media_created_at_idx").on(table.createdAt)],
)

export const stories = pgTable(
  "stories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    excerpt: text("excerpt").notNull(),
    body: text("body").notNull(),
    format: text("format").notNull().default("Prose"),
    series: text("series"),
    seriesSlug: text("series_slug"),
    status: storyStatus("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    coverImageId: uuid("cover_image_id").references(() => media.id, {
      onDelete: "set null",
    }),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    canonicalUrl: text("canonical_url"),
    ogImageId: uuid("og_image_id").references(() => media.id, { onDelete: "set null" }),
    readingMinutes: integer("reading_minutes").notNull().default(1),
    wordCount: integer("word_count").notNull().default(0),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdBy: text("created_by"),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("stories_status_published_idx").on(table.status, table.publishedAt),
    index("stories_featured_idx").on(table.featured),
    index("stories_scheduled_idx").on(table.scheduledFor),
  ],
)

export const storyRevisions = pgTable(
  "story_revisions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storyId: uuid("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    revision: integer("revision").notNull(),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
    note: text("note"),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("story_revision_unique_idx").on(table.storyId, table.revision),
    index("story_revisions_story_idx").on(table.storyId, table.createdAt),
  ],
)

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const storyTags = pgTable(
  "story_tags",
  {
    storyId: uuid("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.storyId, table.tagId] })],
)

export const subscribers = pgTable(
  "subscribers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().unique(),
    status: subscriberStatus("status").notNull().default("pending"),
    source: text("source").notNull().default("first-entry-modal"),
    preferences: jsonb("preferences")
      .$type<{ newStories: boolean; occasionalLetters: boolean }>()
      .notNull()
      .default({ newStories: true, occasionalLetters: false }),
    consentAt: timestamp("consent_at", { withTimezone: true }).defaultNow().notNull(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
    lastNotifiedAt: timestamp("last_notified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("subscribers_status_idx").on(table.status),
    index("subscribers_created_idx").on(table.createdAt),
  ],
)

export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storyId: uuid("story_id").references(() => stories.id, { onDelete: "set null" }),
    subject: text("subject").notNull(),
    previewText: text("preview_text"),
    bodyHtml: text("body_html").notNull(),
    status: campaignStatus("status").notNull().default("draft"),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("campaigns_status_idx").on(table.status, table.scheduledFor)],
)

export const campaignDeliveries = pgTable(
  "campaign_deliveries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    subscriberId: uuid("subscriber_id")
      .notNull()
      .references(() => subscribers.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("queued"),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    openedAt: timestamp("opened_at", { withTimezone: true }),
    clickedAt: timestamp("clicked_at", { withTimezone: true }),
    bouncedAt: timestamp("bounced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("campaign_subscriber_unique_idx").on(table.campaignId, table.subscriberId),
    index("campaign_deliveries_status_idx").on(table.status),
  ],
)

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name"),
    email: text("email"),
    message: text("message").notNull(),
    deviceType: text("device_type"),
    operatingSystem: text("operating_system"),
    ipAddress: text("ip_address"),
    status: text("status").notNull().default("unread"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => [index("contact_messages_status_idx").on(table.status, table.createdAt)],
)

export const requestRateLimits = pgTable(
  "request_rate_limits",
  {
    key: text("key").primaryKey(),
    action: text("action").notNull(),
    count: integer("count").notNull().default(1),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("request_rate_limits_updated_idx").on(table.updatedAt)],
)

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: text("actor_id"),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("audit_logs_entity_idx").on(table.entityType, table.entityId, table.createdAt)],
)

export type StoryRecord = typeof stories.$inferSelect
export type NewStoryRecord = typeof stories.$inferInsert
export type SubscriberRecord = typeof subscribers.$inferSelect

export const seriesMetadata = pgTable("series_metadata", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})
