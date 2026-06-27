"use client"

import { FileText, User, LogOut, Briefcase, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import TextLogo from "@/components/shared/logotext"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/shared/ui/sidebar"
import { logout } from "@/actions/auth"

const items = [
  {
    title: "Resume",
    url: "/dashboard",
    icon: FileText,
  },
  {
    title: "Tracker",
    url: "/dashboard/tracker",
    icon: Briefcase,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Security",
    url: "/dashboard/security",
    icon: ShieldCheck,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar
      collapsible="offcanvas"
      variant="inset"
      className="border-r-0 !sticky top-0 shadow-sm relative overflow-hidden truncate"
      id="tour-sidebar"
    >
      <SidebarHeader className="pt-6 pb-2 px-4 flex flex-row items-center gap-2 z-10 bg-transparent overflow-hidden">
        <Link href="/dashboard" className="hover:opacity-90 transition-opacity">
          <TextLogo className="w-32 h-10" />
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-sidebar via-sidebar to-sidebar/90 backdrop-blur-sm z-10 pt-4">
        <SidebarGroup>
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="gap-1.5">
              {items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.url

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      onClick={handleLinkClick}
                      className={`h-11 px-3 transition-all duration-200 rounded-md
                        ${isActive
                          ? 'bg-primary/10 dark:bg-primary/10 text-primary font-semibold shadow-sm ring-1 ring-primary/20'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`}
                      isActive={isActive}
                    >
                      <Link href={item.url}>
                        <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-[14.5px]">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 z-10 flex">
        <SidebarMenu>
          <SidebarMenuItem>
            <form action={logout} className="w-full">
              <SidebarMenuButton
                type="submit"
                onClick={handleLinkClick}
                className="h-11 px-3 w-full text-destructive hover:bg-destructive/10 transition-colors"
                tooltip="Log out"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-[14.5px] font-medium">Log out</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Decorative Sidebar Background Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-primary/5 to-transparent pointer-events-none z-0" />
    </Sidebar>
  )
}
