import { Menu, Search as SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { siteConfig } from "~/lib/site-config";
import { cn } from "~/lib/utils";
import { SearchBox } from "./SearchBox";
import { SEARCH_HOTKEY, SearchHotkey } from "./SearchHotkey";
import { DarkModeToggle } from "./DarkModeToggle";

interface NavLinkSpec {
  to: string;
  label: string;
  end?: boolean;
}

const primaryLinks: NavLinkSpec[] = [
  { to: "/", label: "首页", end: true },
  { to: "/posts", label: "文章" },
  { to: "/projects", label: "项目" },
];

const friendLinks: NavLinkSpec[] = [
  { to: "/friends", label: "友链" },
  { to: "/moments", label: "朋友圈" },
];

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    "rounded-lg px-3 py-2 text-sm font-medium text-black/60 no-underline transition-colors duration-200 ease hover:text-black hover:no-underline",
    isActive && "text-black",
  );
}

export function Nav() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const friendsActive =
    location.pathname.startsWith("/friends") ||
    location.pathname.startsWith("/moments");

  useEffect(() => {
    setMenuOpen(false);
    setScrolled(window.scrollY > 16);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!SEARCH_HOTKEY.isMatch(e)) return;
      e.preventDefault();
      setSearchOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40">
        <div
          className={cn(
            "mx-auto flex min-w-0 max-w-4xl items-center gap-2 border border-transparent px-6 transition-[height,background-color,border-color,border-radius] duration-200 ease",
            scrolled
              ? "h-14 rounded-b-xl border-black/10 bg-white/80 backdrop-blur-xl"
              : "h-20 bg-transparent",
          )}
        >
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 text-base font-semibold tracking-tight text-foreground"
            aria-label={siteConfig.title}
          >
            <img
              src="/favicon-96x96.png"
              alt=""
              width={20}
              height={20}
              className="size-5 shrink-0 object-contain"
            />
            <span className="min-w-0 truncate">{siteConfig.title}</span>
          </Link>

          <nav
            className="ml-auto hidden items-center md:flex"
            aria-label="主导航"
          >
            {primaryLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={navClass}
                end={link.end}
              >
                {link.label}
              </NavLink>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-black/60 transition-colors duration-200 ease hover:text-black focus-visible:outline-none data-[state=open]:text-black",
                  friendsActive && "text-black",
                )}
              >
                朋友
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={8}>
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/friends">友链</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/moments">朋友圈</Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(true)}
              aria-label="搜索"
              className="text-black/60 transition-colors duration-200 ease hover:text-black"
            >
              <SearchIcon data-icon="inline-start" />
              <span className="hidden sm:inline">搜索</span>
              <SearchHotkey className="hidden sm:inline-flex" />
            </Button>
            <DarkModeToggle />
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-black/60 transition-colors duration-200 ease hover:text-black md:hidden"
                  aria-label="打开菜单"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="max-w-72 p-0">
                <SheetHeader>
                  <SheetTitle>{siteConfig.title}</SheetTitle>
                </SheetHeader>
                <nav
                  className="flex flex-col gap-1 px-3 pb-6"
                  aria-label="移动导航"
                >
                  {[...primaryLinks, ...friendLinks].map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={navClass}
                      end={link.end}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <SearchBox open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
