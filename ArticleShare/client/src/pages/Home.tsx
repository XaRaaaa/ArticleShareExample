import { useArticles } from "@/hooks/use-articles";
import { ArticleCard } from "@/components/ArticleCard";
import { Loader2, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { data: articles, isLoading, error } = useArticles();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center p-4">
        <h3 className="text-xl font-bold text-destructive mb-2">Something went wrong</h3>
        <p className="text-muted-foreground">Failed to load articles. Please try again later.</p>
      </div>
    );
  }

  const sortedArticles = articles?.sort((a, b) => 
    new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <header className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
          Thoughts & Perspectives
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A collection of ideas, stories, and conversations. Read, share, and connect.
        </p>
      </header>

      {sortedArticles?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
          <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
            <PenLine className="h-full w-full" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No articles yet</h3>
          <p className="text-muted-foreground mt-1 mb-6">Be the first to publish a story.</p>
          {user ? (
            <Link href="/new-article">
              <Button>Start Writing</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="outline">Log in to write</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {sortedArticles?.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
