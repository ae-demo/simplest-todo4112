// ROUTING STRUCTURE (thunder-authentication's App.example.tsx pattern):
//
//   NoAccess sits ABOVE the shell route and REPLACES it — a caller who
//   unlocks nothing gets no navbar and no empty sidebar.
//
//   Forbidden sits INSIDE the shell — the caller holds other scopes (in this
//   app, todos:read and todos:manage always travel together, but the pattern
//   stays faithful regardless) and the rail stays.
//
//   /forbidden is wired into authz/client once, from the router.
//
//   The one gated route is wrapped in <RequireOperation>, with the operation
//   taken from SCREEN_ROUTES — never typed here.
//
//   /callback is routed OUTSIDE the provider: there is no session to read
//   until the redirect has been processed.
//
// This app declares no public screen — the one flow, "Manage shared todos",
// carries a `role` line, so TodoList sits behind the sign-in guard.

import { useEffect, type ReactElement } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AuthzProvider, Forbidden, NoAccess, RequireOperation, useAuthz, useScopes } from "./authz/gates";
import { SCREEN_ROUTES, reachableScreens, hasScopedReach } from "./authz/screens";
import { setForbiddenNavigator } from "./authz/client";
import { signIn } from "./authz/session";
import { AppShell } from "./shell/AppShell";
import { CallbackPage } from "./pages/Callback";
import { TodoListPage } from "./pages/TodoListPage";
import { APP_NAME } from "./appName";

const PAGE_BY_KEY: Record<string, ReactElement> = {
  todolist: <TodoListPage />,
};

export function App(): ReactElement {
  return (
    <BrowserRouter>
      <ForbiddenWiring />
      <Routes>
        <Route path="/callback" element={<CallbackPage />} />
        <Route
          path="*"
          element={
            <AuthzProvider fallback={<Splash />}>
              <SignedIn />
            </AuthzProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * Hands src/authz/client.ts the route a refusal goes to. ONCE, from inside
 * the router and above every route.
 */
function ForbiddenWiring(): null {
  const navigate = useNavigate();
  useEffect(() => {
    setForbiddenNavigator(() => navigate("/forbidden", { replace: true }));
  }, [navigate]);
  return null;
}

function Splash(): ReactElement {
  return (
    <main>
      <h1>{APP_NAME}</h1>
      <p>Checking your session…</p>
    </main>
  );
}

function SignedIn(): ReactElement {
  const { signedIn } = useAuthz();
  const scopes = useScopes();

  // The load-time guard. Only a MISSING session starts a sign-in.
  useEffect(() => {
    if (!signedIn) void signIn();
  }, [signedIn]);

  if (!signedIn) return <Splash />;

  const reachable = reachableScreens(scopes, signedIn);

  // NoAccess REPLACES the shell — returned above the <Routes> that carry it.
  if (!hasScopedReach(scopes, signedIn)) return <NoAccess appName={APP_NAME} />;

  const landing = (reachable.find((s) => !s.public && s.loads !== null) ?? reachable[0]).path;

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to={landing} replace />} />
        {SCREEN_ROUTES.map((screen) => {
          if (screen.public) return null;
          const page = PAGE_BY_KEY[screen.key];
          if (screen.loads === null) {
            return <Route key={screen.key} path={screen.path} element={page} />;
          }
          return (
            <Route
              key={screen.key}
              element={<RequireOperation op={screen.loads} screen={screen.label} />}
            >
              <Route path={screen.path} element={page} />
            </Route>
          );
        })}
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<Navigate to={landing} replace />} />
      </Route>
    </Routes>
  );
}
