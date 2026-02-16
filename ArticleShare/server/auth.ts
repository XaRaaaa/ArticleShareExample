import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import MemoryStore from "memorystore";

const scryptAsync = promisify(scrypt);
const SessionStore = MemoryStore(session);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "r8q,+&1LM3)CD*zAGpx1xm{NeQhc;#",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 },
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      // Requirements say "Login with email + password"
      // The form will send the email in the 'username' field
      const user = await storage.getUserByEmail(username);
      if (!user) {
        return done(null, false);
      } else {
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });
}
