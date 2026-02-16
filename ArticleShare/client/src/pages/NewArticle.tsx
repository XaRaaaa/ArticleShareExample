import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertArticleSchema } from "@shared/schema";
import { z } from "zod";
import { useCreateArticle } from "@/hooks/use-articles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NewArticle() {
  const [_, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const createArticle = useCreateArticle();

  // Redirect if not logged in
  if (!isLoading && !user) {
    setLocation("/login");
    return null;
  }

  const form = useForm<z.infer<typeof insertArticleSchema>>({
    resolver: zodResolver(insertArticleSchema),
    defaultValues: {
      title: "",
      body: "",
    },
  });

  function onSubmit(values: z.infer<typeof insertArticleSchema>) {
    createArticle.mutate(values, {
      onSuccess: () => setLocation("/"),
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/">
        <Button variant="ghost" className="mb-6 pl-0 hover:pl-0 hover:text-primary gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to feed
        </Button>
      </Link>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Write a New Story</h1>
          <p className="text-muted-foreground mt-2">
            Share your ideas with the community. Markdown is supported.
          </p>
        </div>

        <Card className="border-border/50 shadow-md">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Give your story a great title..." 
                          className="text-lg font-medium"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell your story..." 
                          className="min-h-[400px] text-base leading-relaxed resize-y font-normal"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4 pt-2">
                  <Link href="/">
                    <Button type="button" variant="outline">Cancel</Button>
                  </Link>
                  <Button 
                    type="submit" 
                    className="min-w-[120px]"
                    disabled={createArticle.isPending}
                  >
                    {createArticle.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      "Publish Article"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
