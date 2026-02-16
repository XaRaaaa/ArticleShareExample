import { users, articles, comments, type User, type InsertUser, type Article, type InsertArticle, type Comment, type InsertComment } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getArticles(): Promise<(Article & { author: User, comments: (Comment & { author: User })[] })[]>;
  getArticle(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  deleteArticle(id: number): Promise<void>;

  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<void>;
  getComment(id: number): Promise<Comment | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getArticles(): Promise<(Article & { author: User, comments: (Comment & { author: User })[] })[]> {
    // This is a bit complex with Drizzle's query builder to get nested relations efficiently
    // Ideally we use db.query.articles.findMany(...)
    const results = await db.query.articles.findMany({
      orderBy: [desc(articles.createdAt)],
      with: {
        author: true,
        comments: {
          with: {
            author: true
          },
          orderBy: [desc(comments.createdAt)]
        }
      }
    });
    return results;
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db.insert(articles).values(insertArticle).returning();
    return article;
  }

  async deleteArticle(id: number): Promise<void> {
    await db.delete(comments).where(eq(comments.articleId, id)); // Cascade manually if needed
    await db.delete(articles).where(eq(articles.id, id));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    return comment;
  }

  async deleteComment(id: number): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  async getComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment;
  }
}

export const storage = new DatabaseStorage();
