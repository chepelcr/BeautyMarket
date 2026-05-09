import {
  ArrowRight, ArrowUpRight, ChevronDown, ChevronLeft, Check, X, Minus, Plus,
  Receipt, ShoppingCart, Package, CreditCard, Wallet, Banknote, Store, Scan,
  Tag, Boxes, ShieldCheck, FileSignature, FileText, BadgeCheck, Building2,
  Users, BarChart2, Layers, Zap, Cloud, Lock, Smartphone, Monitor, Wifi, Battery,
  Home, Trash, Globe, Sparkles, Sun, Moon, Menu, Search, Star, Quote,
  Settings, Save, Eye, EyeOff, RefreshCw, Plus as PlusIcon, Pencil, Palette,
  Languages, DollarSign, LayoutDashboard, type LucideProps,
} from 'lucide-react';

export type IconName =
  | 'ArrowRight' | 'ArrowUpRight' | 'ChevronDown' | 'ChevronLeft'
  | 'Check' | 'X' | 'Minus' | 'Plus' | 'Receipt' | 'ShoppingCart'
  | 'Package' | 'CreditCard' | 'Wallet' | 'Banknote' | 'Store' | 'Scan'
  | 'Tag' | 'Boxes' | 'ShieldCheck' | 'FileSignature' | 'FileText'
  | 'BadgeCheck' | 'Building2' | 'Users' | 'BarChart2' | 'Layers'
  | 'Zap' | 'Cloud' | 'Lock' | 'Smartphone' | 'Monitor' | 'Wifi' | 'Battery'
  | 'Home' | 'Trash' | 'Globe' | 'Sparkles' | 'Sun' | 'Moon' | 'Menu'
  | 'Search' | 'Star' | 'Quote' | 'Settings' | 'Save' | 'Eye' | 'EyeOff'
  | 'RefreshCw' | 'Pencil' | 'Palette' | 'Languages' | 'DollarSign' | 'LayoutDashboard';

const ICONS: Record<IconName, React.FC<LucideProps>> = {
  ArrowRight, ArrowUpRight, ChevronDown, ChevronLeft, Check, X, Minus, Plus,
  Receipt, ShoppingCart, Package, CreditCard, Wallet, Banknote, Store, Scan,
  Tag, Boxes, ShieldCheck, FileSignature, FileText, BadgeCheck, Building2,
  Users, BarChart2, Layers, Zap, Cloud, Lock, Smartphone, Monitor, Wifi, Battery,
  Home, Trash, Globe, Sparkles, Sun, Moon, Menu, Search, Star, Quote,
  Settings, Save, Eye, EyeOff, RefreshCw, Pencil, Palette, Languages,
  DollarSign, LayoutDashboard,
};

interface IconProps extends LucideProps {
  name: IconName;
}

export function Icon({ name, ...props }: IconProps) {
  const Comp = ICONS[name];
  if (!Comp) return null;
  return <Comp strokeWidth={1.75} {...props} />;
}
