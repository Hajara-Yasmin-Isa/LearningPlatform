"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

//Basic component for Dashboard Navigator
export default function DashboardNav(){
    //The card calls for "Active State Styling", so this should satisfy it
    const pathname = usePathname();

    //This shows what page your on. So if you're on the dashboard page then Dashboard will light
    // up in the navigation bar
    const linkStyle = (path: string) =>
        pathname === path
        ? "font-semibold text-blue-600"
        : "text-gray-600 hover:text-black"

    //Return statement. Nav bar with Links in them. Uses 
    return (
        <nav className="w-full border-b bg-white">
            <div className="max-w-6xl mx-auto flex gap-6 p-4">
                <Link href="/dashboard" className={linkStyle("/dashboard")}>Dashboard</Link>
                <Link href="/profile" className={linkStyle("/profile")}>Profile</Link>
                <Link href="/settings" className={linkStyle("/settings")}>Settings</Link>
            </div>
        </nav>
    )
}