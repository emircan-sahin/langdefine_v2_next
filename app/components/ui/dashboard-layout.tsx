'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Navigation } from '@/components/ui/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
  onLogout?: () => void
}

export function DashboardLayout({ 
  children, 
  className,
  onLogout 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      
      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow border-r bg-card/50 backdrop-blur-sm">
            <Navigation onLogout={onLogout} className="flex-1 p-4" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          <main className={cn(
            'flex-1 p-4 md:p-6 lg:p-8',
            className
          )}>
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
} 