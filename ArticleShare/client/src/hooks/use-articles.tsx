import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertArticle, type InsertComment } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useArticles() {
  const { toast } = useToast();
  return useQuery({
    queryKey: [api.articles.list.path],
    queryFn: async () => {
      const res = await fetch(api.articles.list.path);
      if (!res.ok) throw new Error("Failed to fetch articles");
      return api.articles.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (article: InsertArticle) => {
      const res = await fetch(api.articles.create.path, {
        method: api.articles.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(article),
      });
      if (!res.ok) throw new Error("Failed to publish article");
      return api.articles.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.articles.list.path] });
      toast({
        title: "Article Published",
        description: "Your story has been shared with the world.",
      });
    },
    onError: (err: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to publish",
        description: err.message,
      });
    }
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.articles.delete.path, { id });
      const res = await fetch(url, { method: api.articles.delete.method });
      if (!res.ok) throw new Error("Failed to delete article");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.articles.list.path] });
      toast({
        title: "Article Deleted",
        description: "The article has been permanently removed.",
      });
    },
    onError: (err: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ articleId, ...data }: InsertComment & { articleId: number }) => {
      const url = buildUrl(api.comments.create.path, { articleId });
      const res = await fetch(url, {
        method: api.comments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      return api.comments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.articles.list.path] });
      toast({
        title: "Comment Added",
        description: "Your thought has been posted.",
      });
    },
    onError: (err: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.comments.delete.path, { id });
      const res = await fetch(url, { method: api.comments.delete.method });
      if (!res.ok) throw new Error("Failed to delete comment");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.articles.list.path] });
      toast({
        title: "Comment Deleted",
        description: "The comment has been removed.",
      });
    },
    onError: (err: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  });
}
