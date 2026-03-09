import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Plus, Sprout } from "lucide-react";

export function NavBar() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          data-ocid="nav.home_link"
        >
          <Sprout className="w-5 h-5 text-primary shrink-0" />
          <span className="font-serif text-lg leading-tight hidden sm:block">
            Lehmberg Knowledge Wiki
          </span>
          <span className="font-serif text-base leading-tight sm:hidden">
            Lehmberg Wiki
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/new" })}
            className="gap-1.5 text-sm font-body border-border"
            data-ocid="nav.new_page_button"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Page</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/" })}
            className="gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">All Pages</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
