import { BookOpen, Bookmark, Compass, Grid2X2, Home, LayoutGrid } from "lucide-react";
import Link from "next/link";

type SidebarIcon = "home" | "dots" | "bookmark" | "compass" | "apps";

interface LeftIconSidebarProps {
  activeIcon?: SidebarIcon;
  isDark?: boolean;
}

const items: Array<{ id: SidebarIcon; href: string; label: string; icon: typeof Home }> = [
  { id: "home", href: "/surah/1", label: "Home", icon: Home },
  { id: "dots", href: "#", label: "Sections", icon: LayoutGrid },
  { id: "bookmark", href: "#", label: "Bookmarks", icon: Bookmark },
  { id: "compass", href: "#", label: "Qibla", icon: Compass },
  { id: "apps", href: "#", label: "Apps", icon: Grid2X2 },
];

export function LeftIconSidebar({
  activeIcon = "home",
  isDark = false,
}: LeftIconSidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 hidden h-screen w-14 flex-col items-center gap-5 border-r py-4 md:flex ${
        isDark ? "border-zinc-800 bg-dark-sidebar" : "border-zinc-200 bg-[#f1f3f3]"
      }`}
    >
      <div
        className={`grid h-9 w-9 place-items-center rounded-lg ${
          isDark ? "bg-primary/20 text-primary" : "bg-primary text-white"
        }`}
      >
        <BookOpen size={16} />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        {items.map(({ id, href, label, icon: Icon }) => (
          <Link
            key={id}
            href={href}
            aria-label={label}
            className={`rounded-lg p-2 transition ${
              activeIcon === id
                ? "bg-primary text-white"
                : isDark
                  ? "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <Icon size={18} />
          </Link>
        ))}
      </div>
    </aside>
  );
}
