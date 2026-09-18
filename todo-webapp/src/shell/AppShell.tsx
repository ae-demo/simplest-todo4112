import {
  AppShell as OxygenAppShell,
  ColorSchemeToggle,
  Divider,
  Footer,
  Header,
  Sidebar,
  UserMenu,
  version as OXYGEN_UI_VERSION,
} from "@wso2/oxygen-ui";
import { ListTodo, LogOut } from "@wso2/oxygen-ui-icons-react";
import type { JSX } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { APP_NAME } from "../appName";
import { Can, useAuthz } from "../authz/gates";
import { signOut } from "../authz/session";
import { SCREEN_ROUTES } from "../authz/screens";

/** The one signed-in shell every gated screen renders inside (react-webapp /
 * oxygen-ui-design-system: AppShell.Navbar + AppShell.Sidebar + AppShell.Main
 * + AppShell.Footer, never a screen-owned layout). */
export function AppShell(): JSX.Element {
  const { pathname } = useLocation();
  const { username } = useAuthz();

  return (
    <OxygenAppShell>
      <OxygenAppShell.Navbar>
        <Header>
          <Header.Toggle />
          <Header.Brand>
            <Header.BrandTitle>{APP_NAME}</Header.BrandTitle>
          </Header.Brand>
          <Header.Spacer />
          <Header.Actions>
            <ColorSchemeToggle />
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            <UserMenu>
              <UserMenu.Trigger name={username || "Signed in"} />
              <UserMenu.Header name={username || "Signed in"} email={username || ""} />
              <UserMenu.Divider />
              <UserMenu.Logout icon={<LogOut />} onClick={() => void signOut()} />
            </UserMenu>
          </Header.Actions>
        </Header>
      </OxygenAppShell.Navbar>

      <OxygenAppShell.Sidebar>
        <Sidebar activeItem={SCREEN_ROUTES.find((s) => s.path === pathname)?.key ?? SCREEN_ROUTES[0].key}>
          <Sidebar.Nav>
            <Sidebar.Category>
              {SCREEN_ROUTES.map((screen) =>
                screen.loads === null ? (
                  <Sidebar.Item key={screen.key} id={screen.key} link={<Link to={screen.path} />}>
                    <Sidebar.ItemIcon>
                      <ListTodo />
                    </Sidebar.ItemIcon>
                    <Sidebar.ItemLabel>{screen.label}</Sidebar.ItemLabel>
                  </Sidebar.Item>
                ) : (
                  <Can key={screen.key} op={screen.loads}>
                    <Sidebar.Item id={screen.key} link={<Link to={screen.path} />}>
                      <Sidebar.ItemIcon>
                        <ListTodo />
                      </Sidebar.ItemIcon>
                      <Sidebar.ItemLabel>{screen.label}</Sidebar.ItemLabel>
                    </Sidebar.Item>
                  </Can>
                ),
              )}
            </Sidebar.Category>
          </Sidebar.Nav>
        </Sidebar>
      </OxygenAppShell.Sidebar>

      <OxygenAppShell.Main>
        <Outlet />
      </OxygenAppShell.Main>

      <OxygenAppShell.Footer>
        <Footer>
          <Footer.Copyright>© {new Date().getFullYear()} WSO2 LLC.</Footer.Copyright>
          <Footer.Divider />
          <Footer.Version>oxygen-ui-v{OXYGEN_UI_VERSION}</Footer.Version>
        </Footer>
      </OxygenAppShell.Footer>
    </OxygenAppShell>
  );
}
