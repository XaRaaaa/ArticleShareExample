import { useState } from "react";
import { format } from "date-fns";
import { Article, User, Comment } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useDeleteArticle, useCreateComment, useDeleteComment } from "@/hooks/use-articles";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Trash2, Calendar, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ArticleWithRelations = Article & {
  author: User;
  comments: (Comment & { author: User })[];
};

interface ArticleCardProps {
  article: ArticleWithRelations;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { user } = useAuth();
  const deleteArticle = useDeleteArticle();
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const isAuthor = user?.id === article.authorId;
  const isAdmin = user?.isAdmin;
  const canDelete = isAuthor || isAdmin;

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    createComment.mutate({
      articleId: article.id,
      content: newComment,
    }, {
      onSuccess: () => setNewComment("")
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group"
    >
      <Card className="overflow-hidden border-border/60 bg-card/50 backdrop-blur-sm transition-all hover:border-border hover:shadow-md">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-display font-bold leading-tight text-foreground tracking-tight">
                {article.title}
              </h2>
              <div className="flex items-center text-sm text-muted-foreground gap-3">
                <span className="flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5" />
                  {article.author.username}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(article.createdAt!), "MMM d, yyyy")}
                </span>
              </div>
            </div>
            
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Article?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your article and all its comments.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => deleteArticle.mutate(article.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground">
            <p className="whitespace-pre-wrap leading-relaxed">{article.body}</p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-stretch bg-muted/30 border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="self-start gap-2 mb-2"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="w-4 h-4" />
            {article.comments.length} Comments
          </Button>

          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden w-full space-y-4"
              >
                <div className="space-y-4 py-2">
                  {article.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 text-sm group/comment">
                      <Avatar className="w-8 h-8 mt-1 border">
                        <AvatarFallback className="text-xs">
                          {comment.author.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-background p-3 rounded-lg border shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-foreground">{comment.author.username}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.createdAt!), "MMM d, HH:mm")}
                            </span>
                            {(user?.id === comment.authorId || user?.isAdmin) && (
                              <button
                                onClick={() => deleteComment.mutate(comment.id)}
                                className="text-muted-foreground hover:text-destructive opacity-0 group-hover/comment:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-muted-foreground">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {article.comments.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm italic py-2">
                      No comments yet. Be the first to share your thoughts.
                    </p>
                  )}
                </div>

                {user ? (
                  <form onSubmit={handleSubmitComment} className="flex gap-2 pb-2">
                    <Textarea
                      placeholder="Write a thoughtful comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[60px] resize-none bg-background"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      className="h-[60px] w-[60px] shrink-0"
                      disabled={createComment.isPending || !newComment.trim()}
                    >
                      <MessageSquare className="w-5 h-5" />
                    </Button>
                  </form>
                ) : (
                  <div className="bg-muted/50 p-3 rounded-md text-center text-sm text-muted-foreground mb-2">
                    Please log in to leave a comment.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
