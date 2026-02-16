import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(), // Added email as per requirements
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  authorId: serial("author_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  articleId: serial("article_id").references(() => articles.id).notNull(),
  authorId: serial("author_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
  comments: many(comments),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  article: one(articles, {
    fields: [comments.articleId],
    references: [articles.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, isAdmin: true });
export const insertArticleSchema = createInsertSchema(articles).omit({ id: true, createdAt: true, authorId: true }); // authorId comes from session
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true, authorId: true, articleId: true }); // authorId from session, articleId from params

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
