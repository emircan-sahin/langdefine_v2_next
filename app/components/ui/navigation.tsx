'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Globe, 
  Settings, 
  FileText, 
  LogOut, 
  Menu,
  X,
  Home,
  FolderOpen
} from 'lucide-react'

interface NavigationItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview of your projects'
  },
  {
    title: 'Projects',
    href: '/dashboard/projects',
    icon: FolderOpen,
    description: 'Manage your translation projects'
  },
  {
    title: 'Documentation',
    href: '/documentation',
    icon: FileText,
    description: 'Learn how to use LangDefine'
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Configure your account'
  }
]

interface NavigationProps {
  className?: string
  onLogout?: () => void
}

export function Navigation({ className, onLogout }: NavigationProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={cn('hidden md:flex flex-col space-y-2', className)}>
        <div className="flex items-center space-x-2 px-4 py-2">
          <Globe className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold gradient-text">LangDefine</span>
        </div>
        
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground',
                  isActive 
                    ? 'bg-accent text-accent-foreground shadow-sm' 
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className={cn(
                  'h-4 w-4 transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                )} />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </div>

        <div className="mt-auto pt-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
            <nav className="fixed right-0 top-0 h-full w-64 bg-card border-l shadow-lg p-4">
              <div className="flex items-center space-x-2 px-4 py-2 mb-6">
                <Globe className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold gradient-text">LangDefine</span>
              </div>
              
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'group flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground',
                        isActive 
                          ? 'bg-accent text-accent-foreground shadow-sm' 
                          : 'text-muted-foreground'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className={cn(
                        'h-4 w-4 transition-colors duration-200',
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                      )} />
                      <span>{item.title}</span>
                    </Link>
                  )
                })}
              </div>

              <div className="mt-auto pt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    onLogout?.()
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </>
  )
} 