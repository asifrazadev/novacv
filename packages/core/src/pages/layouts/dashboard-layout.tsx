"use client"

import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/shared/ui/sidebar"
import { ThemeToggle } from "@/components/shared/theme/theme-toggle"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Check if we are in the builder (e.g., /dashboard/resumes/[id])
  const isBuilder = pathname?.includes("/dashboard/resumes/")

  if (isBuilder) {
    return <div className="h-screen w-full flex flex-col">{children}</div>
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1 h-full min-h-screen !mt-0 !rounded-none bg-background relative">
        {/* Subtle dynamic background glow */}
        <div className="absolute top-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-background to-background dark:from-blue-900/20 -z-10 pointer-events-none" />

        {/* Mobile Header (Hidden on Desktop) */}
        <header className="md:hidden sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/90 backdrop-blur-xl px-4 w-full shadow-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 p-2 cursor-pointer touch-none" />
            <span className="font-semibold text-sm tracking-tight text-foreground/90">Dashboard</span>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 w-full flex flex-col pt-6 md:pt-8 pb-16 px-4 sm:px-8 lg:px-12 z-0">
          <div className="mx-auto w-full max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
