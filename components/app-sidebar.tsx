'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CreditCard, PieChart, Settings, LogOut, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signOut } from '@/actions/auth'
import { ModeToggle } from "@/components/mode-toggle"

const sidebarItems = [
    {
        title: "Panel",
        href: "/",
        icon: Home
    },
    {
        title: "Krediler",
        href: "/loans",
        icon: Wallet
    },
    {
        title: "Ödemeler",
        href: "/payments",
        icon: CreditCard
    },
    {
        title: "Raporlar",
        href: "/reports",
        icon: PieChart
    },
    {
        title: "Ayarlar",
        href: "/settings",
        icon: Settings
    }
]

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <div className="hidden border-r bg-muted/40 md:block w-[220px] lg:w-[280px] h-full fixed top-0 left-0">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Wallet className="h-6 w-6" />
                        <span className="">FinTrack</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {sidebarItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="mt-auto p-4 border-t flex items-center justify-between">
                    <form action={signOut} className="flex-1 mr-2">
                        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-red-500">
                            <LogOut className="h-4 w-4" />
                            Çıkış Yap
                        </Button>
                    </form>
                    <ModeToggle />
                </div>
            </div>
        </div>
    )
}
