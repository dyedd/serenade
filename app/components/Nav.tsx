import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import {
  BookOpen,
  FileText,
  House,
  Menu,
  Rocket,
  Search as SearchIcon,
  Users,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Button } from '~/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet';
import { DarkModeToggle } from './DarkModeToggle';
import { SearchBox } from './SearchBox';
import { SearchHotkey, SEARCH_HOTKEY } from './SearchHotkey';
import { siteConfig } from '~/lib/site-config';
import { cn } from '~/lib/utils';

interface NavLinkSpec {
  to: string;
  label: string;
  icon: typeof House;
  end?: boolean;
}

const primaryLinks: NavLinkSpec[] = [
  { to: '/', label: '首页', icon: House, end: true },
  { to: '/posts', label: '文章', icon: FileText },
  { to: '/columns', label: '专栏', icon: BookOpen },
  { to: '/projects', label: '项目', icon: Rocket },
];

const friendLinks: NavLinkSpec[] = [
  { to: '/friends', label: '友链', icon: Users },
  { to: '/moments', label: '朋友圈', icon: Users },
];

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
    isActive
      ? 'bg-(--brand-soft) font-semibold text-(--brand)'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  );
}

export function Nav() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!SEARCH_HOTKEY.isMatch(e)) return;
      e.preventDefault();
      setSearchOpen((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-6 py-2.5">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5"
            aria-label={siteConfig.title}
          >
            <img
              src={siteConfig.profile.avatar}
              alt=""
              className="size-8 shrink-0 rounded-lg object-cover ring-1 ring-border"
            />
            <span className="font-heading hidden text-sm font-semibold tracking-tight sm:inline">
              {siteConfig.title}
            </span>
          </Link>

          <nav className="ml-2 hidden items-center gap-0.5 md:flex" aria-label="主导航">
            {primaryLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={navClass} end={link.end}>
                <link.icon className="size-4" />
                {link.label}
              </NavLink>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none data-[state=open]:bg-muted data-[state=open]:text-foreground',
                  (location.pathname.startsWith('/friends') ||
                    location.pathname.startsWith('/moments')) &&
                    'bg-(--brand-soft) font-semibold text-(--brand)',
                )}
              >
                <Users className="size-4" />
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

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSearchOpen(true)}
              aria-label="搜索"
              className="relative z-50 rounded-full text-muted-foreground"
            >
              <SearchIcon data-icon="inline-start" />
              <span className="hidden font-mono text-xs sm:inline">
                <span className="mr-1 text-(--brand)">$</span>find
              </span>
              <SearchHotkey className="hidden sm:inline-flex" />
            </Button>
            <DarkModeToggle />
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="打开菜单"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2.5">
                    <img
                      src={siteConfig.profile.avatar}
                      alt=""
                      className="size-8 shrink-0 rounded-lg object-cover ring-1 ring-border"
                    />
                    {siteConfig.title}
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-3 pb-6" aria-label="移动导航">
                  {[...primaryLinks, ...friendLinks].map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={navClass}
                      end={link.end}
                    >
                      <link.icon className="size-4" />
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
