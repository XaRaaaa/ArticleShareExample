import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { db } from "./db";
import { users, articles, comments } from "@shared/schema";
import { eq } from "drizzle-orm";
import passport from "passport";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  setupAuth(app);

  // Auth Routes
  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      const { username, email, password } = api.auth.register.input.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(username) || await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).send("Username or email already exists");
      }

      const hashedPassword = await hashPassword(password);
      
      const user = await storage.createUser({ 
        username, 
        email, 
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
       if (err instanceof z.ZodError) {
          return res.status(400).json({
            message: err.errors[0].message,
            field: err.errors[0].path.join('.'),
          });
        }
        next(err);
    }
  });

  app.post(api.auth.login.path, (req, res, next) => {
      // Passport LocalStrategy expects { username, password }
      // Our frontend should send email in the 'username' field
      next();
  }, passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    res.json(req.user || null);
  });

  // Articles List
  app.get(api.articles.list.path, async (req, res) => {
    const articles = await storage.getArticles();
    res.json(articles);
  });

  // Create Article
  app.post(api.articles.create.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    const validatedData = api.articles.create.input.parse(req.body);
    const article = await storage.createArticle({
      ...validatedData,
      authorId: req.user!.id,
    });
    res.status(201).json(article);
  });

  // Delete Article
  app.delete(api.articles.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    const articleId = parseInt(req.params.id);
    const article = await storage.getArticle(articleId);

    if (!article) {
      return res.sendStatus(404);
    }

    // Check permissions: Admin or Author
    if (!req.user!.isAdmin && article.authorId !== req.user!.id) {
      return res.sendStatus(403);
    }

    await storage.deleteArticle(articleId);
    res.sendStatus(204);
  });

  // Create Comment
  app.post(api.comments.create.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    const articleId = parseInt(req.params.articleId);
    const article = await storage.getArticle(articleId);
    if (!article) return res.sendStatus(404);

    const validatedData = api.comments.create.input.parse(req.body);
    const comment = await storage.createComment({
      ...validatedData,
      articleId,
      authorId: req.user!.id,
    });
    res.status(201).json(comment);
  });

  // Delete Comment
  app.delete(api.comments.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    const commentId = parseInt(req.params.id);
    const comment = await storage.getComment(commentId);

    if (!comment) {
      return res.sendStatus(404);
    }

    // Check permissions: Admin or Author
    if (!req.user!.isAdmin && comment.authorId !== req.user!.id) {
      return res.sendStatus(403);
    }

    await storage.deleteComment(commentId);
    res.sendStatus(204);
  });
  
  // Seed Database
  await seed();

  return httpServer;
}

async function seed() {
    const adminEmail = "admin@example.com";
    const [existingAdmin] = await db.select().from(users).where(eq(users.email, adminEmail));
    
    let adminId: number;

    if (!existingAdmin) {
        const hashedPassword = await hashPassword("admin123");
        const [admin] = await db.insert(users).values({
            username: "admin",
            email: adminEmail,
            password: hashedPassword,
            isAdmin: true
        }).returning();
        adminId = admin.id;
        console.log("Admin account created");
    } else {
        adminId = existingAdmin.id;
    }

    const userEmail = "user@example.com";
    const [existingUser] = await db.select().from(users).where(eq(users.email, userEmail));
    
    let userId: number;

    if (!existingUser) {
        const hashedPassword = await hashPassword("user123");
        const [user] = await db.insert(users).values({
            username: "user",
            email: userEmail,
            password: hashedPassword,
            isAdmin: false
        }).returning();
        userId = user.id;
        console.log("User account created");
    } else {
        userId = existingUser.id;
    }

    // Seed Articles if empty
    const existingArticles = await storage.getArticles();
    if (existingArticles.length === 0) {
        const [article1] = await db.insert(articles).values({
            title: "Welcome to the Article Sharing App",
            body: "This is a platform where you can share your thoughts and ideas with the world. Feel free to register and start writing!",
            authorId: adminId
        }).returning();

        const [article2] = await db.insert(articles).values({
            title: "Getting Started with Web Development",
            body: "Web development is an exciting journey. Start with HTML, CSS, and JavaScript, and then explore frameworks like React and Node.js.",
            authorId: userId
        }).returning();

        // Seed Comments
        await db.insert(comments).values([
            {
                content: "Great introduction! Excited to be here.",
                articleId: article1.id,
                authorId: userId
            },
            {
                content: "Thanks! Looking forward to your posts.",
                articleId: article1.id,
                authorId: adminId
            },
            {
                content: "Absolutely agree. The fundamentals are key.",
                articleId: article2.id,
                authorId: adminId
            }
        ]);
        
        console.log("Seeded articles and comments");
    }
}
