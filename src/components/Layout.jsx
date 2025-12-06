
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Calendar, Users, Menu, X, Sun, Moon, Clock, HelpCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const navItems = [
    { name: "仪表盘", path: "/", icon: LayoutDashboard },
    { name: "任务管理", path: "/tasks", icon: CheckSquare },
    { name: "活动流程", path: "/program", icon: Clock },
    { name: "时间轴", path: "/timeline", icon: Calendar },
    { name: "筹委会", path: "/team", icon: Users },
    { name: "使用说明", path: "/help", icon: HelpCircle },
];

export default function Layout({ children }) {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="h-screen bg-gray-50 dark:bg-[#111111] flex text-gray-900 dark:text-gray-100 overflow-hidden transition-colors duration-200">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#1f1f1f] border-r border-gray-200 dark:border-[#2d2d2d] transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-[#2d2d2d]">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">134周年晚宴</h1>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#2d2d2d] transition-colors"
                    >
                        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
                <nav className="p-2 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-blue-50 text-blue-700 dark:bg-[#2d2d2d] dark:text-white"
                                        : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-[#2d2d2d] dark:hover:text-white"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 mr-3", isActive ? "text-blue-700 dark:text-white" : "text-gray-400")} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 dark:bg-[#111111] transition-colors duration-200">
                {/* Mobile Header */}
                <header className="md:hidden h-16 bg-white dark:bg-[#1f1f1f] border-b border-gray-200 dark:border-[#2d2d2d] flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] rounded-md"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="ml-4 text-lg font-semibold text-gray-900 dark:text-white">134周年晚宴</span>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#2d2d2d] transition-colors"
                    >
                        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </header>

                <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
