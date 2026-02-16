import { z } from 'zod';
import { insertUserSchema, insertArticleSchema, insertCommentSchema, users, articles, comments } from './schema';

// Shared Error Schemas
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect | null>(),
      },
    },
  },
  articles: {
    list: {
      method: 'GET' as const,
      path: '/api/articles' as const,
      responses: {
        200: z.array(z.custom<typeof articles.$inferSelect & { author: typeof users.$inferSelect, comments: (typeof comments.$inferSelect & { author: typeof users.$inferSelect })[] }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/articles' as const,
      input: insertArticleSchema,
      responses: {
        201: z.custom<typeof articles.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/articles/:id' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        403: errorSchemas.unauthorized, // Forbidden
        404: errorSchemas.notFound,
      },
    },
  },
  comments: {
    create: {
      method: 'POST' as const,
      path: '/api/articles/:articleId/comments' as const,
      input: insertCommentSchema,
      responses: {
        201: z.custom<typeof comments.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/comments/:id' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        403: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
