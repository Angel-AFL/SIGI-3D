import {
  ClipboardList,
  Eye,
  Factory,
  Home,
  Package,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/inventario", label: "Inventario", icon: Package },
  { href: "/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/produccion", label: "Producción", icon: Factory },
  { href: "/modelos", label: "Visor 3D", icon: Eye },
];
