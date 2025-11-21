'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, User } from 'lucide-react';

/**
 * Dashboard Shell Layout
 * Task 07: Create dashboard shell layout
 */
export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Metrics', path: '/dashboard/metrics' },
    { name: 'Settings', path: '/dashboard/settings' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-terminal-bg flex flex-col">
      {/* Topbar */}
      <header className="border-b border-terminal-border bg-terminal-bg-soft">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-terminal-green hover:bg-terminal-bg"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-terminal-bg-soft border-terminal-border">
                <nav className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => (
                    <Button
                      key={item.path}
                      variant={isActive(item.path) ? 'default' : 'ghost'}
                      className={`justify-start ${
                        isActive(item.path)
                          ? 'bg-terminal-green text-terminal-bg'
                          : 'text-terminal-text hover:bg-terminal-bg'
                      }`}
                      onClick={() => router.push(item.path)}
                    >
                      {item.name}
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-bold text-terminal-green">Clickit Academy</h1>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-terminal-green hover:bg-terminal-bg"
                >
                  <User className="h-5 w-5 mr-2" />
                  {user?.username || user?.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-terminal-bg-soft border-terminal-border"
              >
                <DropdownMenuLabel className="text-terminal-green">
                  {user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-terminal-border" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-terminal-text hover:bg-terminal-bg cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 border-r border-terminal-border bg-terminal-bg-soft">
          <nav className="flex flex-col gap-2 p-4">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? 'default' : 'ghost'}
                className={`justify-start ${
                  isActive(item.path)
                    ? 'bg-terminal-green text-terminal-bg'
                    : 'text-terminal-text hover:bg-terminal-bg'
                }`}
                onClick={() => router.push(item.path)}
              >
                {item.name}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

