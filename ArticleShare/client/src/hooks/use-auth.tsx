import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertUser } from "@shared/routes";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const res = await fetch(api.auth.me.path);
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return await res.json() as User | null;
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }
      return await res.json() as User;
    },
    onSuccess: (user) => {
      queryClient.setQueryData([api.auth.me.path], user);
      toast({
        title: "Welcome back",
        description: `Logged in as ${user.username}`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (newUser: InsertUser) => {
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registration failed");
      }
      return await res.json() as User;
    },
    onSuccess: () => {
      // Don't auto-login after register, or do if backend supports it. 
      // Assuming backend sessions require explicit login or register logs in automatically.
      // Usually passport setup might login automatically or require separate login.
      // For simplicity let's assume user needs to login or we redirect to login.
      toast({
        title: "Account created",
        description: "You can now log in with your credentials.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message,
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch(api.auth.logout.path, { method: api.auth.logout.method });
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      toast({
        title: "Logged out",
        description: "See you next time!",
      });
    },
  });

  return {
    user,
    isLoading,
    error,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
  };
}
