import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PenSquare, LogOut, User } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold tracking-tight text-primary">
                Chronicle
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/new-article">
                  <Button variant="ghost" className="hidden sm:flex items-center gap-2">
                    <PenSquare className="h-4 w-4" />
                    Write
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-offset-background transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <Avatar className="h-9 w-9 border">
                        <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.isAdmin ? 'Administrator' : 'Member'}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="sm:hidden" asChild>
                       <Link href="/new-article" className="flex w-full items-center">
                         <PenSquare className="mr-2 h-4 w-4" />
                         <span>Write Article</span>
                       </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => logout.mutate()} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
