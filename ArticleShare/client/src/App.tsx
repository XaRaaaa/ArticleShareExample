import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/Navbar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NewArticle from "@/pages/NewArticle";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/new-article" component={NewArticle} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Navbar />
        <main>
          <Router />
        </main>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
