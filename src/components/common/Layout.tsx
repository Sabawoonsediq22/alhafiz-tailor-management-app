import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { useLanguage } from "../../hooks/useLanguage";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Package,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Bell,
  Search,
  Globe2,
  ChevronRight,
  User,
  LogOut,
  Menu,
  X,
  Home,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const Layout: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage, isRTL } = useLanguage();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifications] = useState(3);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const navigation: NavItem[] = [
    { name: t("nav.dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { name: t("nav.customers"), href: "/customers", icon: Users },
    { name: t("nav.orders"), href: "/orders", icon: ClipboardList, badge: 5 },
    { name: t("nav.inventory"), href: "/inventory", icon: Package },
    { name: t("nav.reports"), href: "/reports", icon: BarChart3 },
    { name: t("nav.settings"), href: "/settings", icon: Settings },
  ];

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ name: t("dashboard.title"), href: "/dashboard" }];

    let currentPath = "";
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const navItem = navigation.find((item) => item.href === currentPath);
      if (navItem) {
        breadcrumbs.push({ name: navItem.name, href: currentPath });
      }
    });

    return breadcrumbs;
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {sidebarOpen && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Home className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground">
                {t("dashboard.logo")}
              </span>
              <span className="text-[10px] text-sidebar-foreground/60">
                {t("dashboard.title")}
              </span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                !sidebarOpen && "justify-center px-2",
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                    : "bg-sidebar-accent/50 text-sidebar-foreground/70 group-hover:bg-sidebar-accent group-hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
              </div>
              {sidebarOpen && (
                <>
                  <span className="flex-1 font-bold">{item.name}</span>
                  {item.badge && (
                    <span
                      className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${isActive ? "bg-white text-primary" : "bg-primary/10 text-primary"}`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 text-sidebar-primary-foreground/70",
                        isRTL && "rotate-180",
                      )}
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Language Switcher */}
      <div className="border-t border-sidebar-border p-3">
        {sidebarOpen ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
              {t("settings.language")}
            </p>
            <div className="flex items-center gap-1 rounded-lg bg-sidebar-accent/50 p-1">
              {(["ps", "en"] as const).map((lng) => (
                <Button
                  key={lng}
                  variant="ghost"
                  size="sm"
                  onClick={() => setLanguage(lng)}
                  className={cn(
                    "h-7 flex-1 rounded-md text-xs font-medium transition-all",
                    language === lng
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  {lng.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={() => setLanguage(language === "ps" ? "en" : "ps")}
              >
                <Globe2 className="h-4 w-4" />
              </Button>
              <span
                className={cn(
                  "absolute hidden rounded-md bg-gray-900 px-2 py-1 text-xs text-white group-hover:block whitespace-nowrap z-50 bottom-1.5",
                  isRTL ? "right-full mr-2" : "left-full ml-2",
                )}
              >
                {language.toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-sidebar">
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-sidebar-border bg-white transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-16",
        )}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 z-50 w-64 flex flex-col border-r border-sidebar-border bg-white transform transition-transform duration-300 lg:hidden",
          isRTL ? "right-0" : "left-0",
          mobileMenuOpen
            ? "translate-x-0"
            : isRTL
              ? "translate-x-full"
              : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Home className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-sidebar-foreground">
              {t("dashboard.logo")}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
            className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="p-3 space-y-0.5">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-all",
                      isActive
                        ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                        : "bg-sidebar-accent/50",
                    )}
                  >
                    <item.icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[11px] font-semibold text-primary">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
        <div className="border-t border-sidebar-border p-3">
          <div className="space-y-2">
            <p className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
              {t("settings.language")}
            </p>
            <div className="flex items-center gap-1 rounded-lg bg-sidebar-accent/50 p-1">
              {(["ps", "en"] as const).map((lng) => (
                <Button
                  key={lng}
                  variant="ghost"
                  size="sm"
                  onClick={() => setLanguage(lng)}
                  className={cn(
                    "h-7 flex-1 rounded-md text-xs font-medium transition-all",
                    language === lng
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                  )}
                >
                  {lng.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-sidebar-border bg-background/95 px-4 lg:px-6 backdrop-blur supports-backdrop-filter:bg-background/80">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden h-9 w-9"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            {/* Breadcrumbs */}
            <nav className="hidden md:flex items-center gap-1.5 text-sm">
              <NavLink
                to="/dashboard"
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home className="h-3.5 w-3.5" />
              </NavLink>
              {getBreadcrumbs()
                .slice(1)
                .map((crumb, index) => (
                  <React.Fragment key={crumb.href}>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <span
                      className={cn(
                        "flex items-center gap-1.5",
                        index === getBreadcrumbs().length - 2
                          ? "text-foreground font-medium"
                          : "text-muted-foreground",
                      )}
                    >
                      {crumb.name}
                    </span>
                  </React.Fragment>
                ))}
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Search */}
            <div
              className={cn(
                "relative hidden md:flex items-center transition-all duration-200",
                searchFocused ? "w-64" : "w-48",
              )}
            >
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t("common.search") + "..."}
                className="h-9 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Bell className="h-4.5 w-4.5" />
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {notifications}
                </span>
              )}
            </Button>

            {/* Language Toggle - Desktop */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => setLanguage(language === "ps" ? "en" : "ps")}
            >
              <Globe2 className="h-4.5 w-4.5" />
              <span className="sr-only">{t("settings.language")}</span>
            </Button>

            {/* User Profile */}
            <div className="relative group">
              <Button
                variant="ghost"
                className="h-9 gap-2 rounded-xl px-2 hover:bg-accent"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden lg:block text-sm font-medium">
                  Admin
                </span>
              </Button>
              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-sidebar-border bg-popover p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-lg z-50">
                <div className="px-2 py-1.5 border-b border-sidebar-border mb-1">
                  <p className="text-sm font-medium text-foreground">
                    Administrator
                  </p>
                  <p className="text-xs text-muted-foreground">
                    admin@bradaran.com
                  </p>
                </div>
                <NavLink
                  to="/settings"
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  {t("nav.settings")}
                </NavLink>
                <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="h-4 w-4" />
                  {t("common.back")}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-sidebar">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
