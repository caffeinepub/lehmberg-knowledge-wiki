import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { Toaster } from "@/components/ui/sonner";
import { TypographyProvider } from "@/contexts/TypographyContext";
import { useActor } from "@/hooks/useActor";
import { useInitialize } from "@/hooks/useQueries";
import { IndexPage } from "@/pages/IndexPage";
import { NewPageView } from "@/pages/NewPageView";
import { SettingsPage } from "@/pages/SettingsPage";
import { TagIndexPage } from "@/pages/TagIndexPage";
import { WikiPageView } from "@/pages/WikiPageView";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";

function RootLayout() {
  const { actor } = useActor();
  const initialize = useInitialize();
  const initCalledRef = useRef(false);

  useEffect(() => {
    if (actor && !initCalledRef.current) {
      initCalledRef.current = true;
      initialize.mutate();
    }
  }, [actor, initialize]);

  return (
    <div className="min-h-screen flex flex-col bg-background paper-texture">
      <NavBar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexPage,
});
const pageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/page/$slug",
  component: WikiPageView,
});
const tagRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tag/$tag",
  component: TagIndexPage,
});
const newPageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/new",
  component: NewPageView,
});
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  pageRoute,
  tagRoute,
  newPageRoute,
  settingsRoute,
]);
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <TypographyProvider>
      <RouterProvider router={router} />
      <Toaster />
    </TypographyProvider>
  );
}
