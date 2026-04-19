/**
 * Tempo Flow — icon set.
 *
 * @source docs/design/claude-export/design-system/components.jsx:L6-L91
 *
 * 1.5px stroke, currentColor, Lucide-shaped. Accepts standard SVG props.
 * Every icon is tree-shakable via named import.
 */

import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  strokeWidth?: number;
};

function Base({
  size = 18,
  strokeWidth = 1.5,
  fill = "none",
  children,
  ...rest
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const Home = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </Base>
);
export const Check = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Base>
);
export const CheckSquare = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <path d="m8 12 3 3 5-6" />
  </Base>
);
export const Notebook = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4z" />
    <path d="M4 8h-2" />
    <path d="M4 12h-2" />
    <path d="M4 16h-2" />
    <path d="M10 4v16" />
  </Base>
);
export const BookOpen = (p: IconProps) => (
  <Base {...p}>
    <path d="M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2z" />
    <path d="M22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z" />
  </Base>
);
export const Calendar = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </Base>
);
export const Sparkles = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3 13.5 9 20 10.5 13.5 12 12 18 10.5 12 4 10.5 10.5 9z" />
    <path d="M18 18l.8 2L21 20.8 18.8 21.6 18 24l-.8-2.4L15 21l2.2-1z" />
  </Base>
);
export const Flame = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 2c3 4 5 6 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4-1 4 1 5 2 5 0-3 1-6 1-11z" />
  </Base>
);
export const Target = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" />
  </Base>
);
export const Folder = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </Base>
);
export const Repeat = (p: IconProps) => (
  <Base {...p}>
    <path d="M17 2l3 3-3 3" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h13" />
    <path d="M7 22l-3-3 3-3" />
    <path d="M21 13v1a4 4 0 0 1-4 4H4" />
  </Base>
);
export const Chart = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 3v18h18" />
    <path d="M7 14l3-3 4 4 5-6" />
  </Base>
);
export const Settings = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.5-2.3.9a7 7 0 0 0-2.1-1.2L14 3h-4l-.5 2.5a7 7 0 0 0-2.1 1.2l-2.3-.9-2 3.5 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.5 2.3-.9a7 7 0 0 0 2.1 1.2L10 21h4l.5-2.5a7 7 0 0 0 2.1-1.2l2.3.9 2-3.5-2-1.5c.1-.4.1-.8.1-1.2z" />
  </Base>
);
export const Plus = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);
export const Search = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Base>
);
export const Mic = (p: IconProps) => (
  <Base {...p}>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 18v4" />
  </Base>
);
export const Command = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6a2 2 0 1 1 2 2H6V6zM16 6a2 2 0 1 0-2 2h2V6zM6 18a2 2 0 1 0 2-2H6v2zM16 18a2 2 0 1 1-2-2h2v2z" />
    <path d="M8 8h8v8H8z" />
  </Base>
);
export const Sun = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Base>
);
export const Moon = (p: IconProps) => (
  <Base {...p}>
    <path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" />
  </Base>
);
export const Laptop = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="12" rx="2" />
    <path d="M2 20h20" />
  </Base>
);
export const Monitor = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </Base>
);
export const Ear = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 3-2 4-3 6s-1 4-3 4-3-1-3-3" />
    <path d="M9 12a3 3 0 0 1 6 0" />
  </Base>
);
export const Type = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7V5h16v2M9 5v14M15 19h-6" />
  </Base>
);
export const Volume = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 10v4h4l5 4V6L7 10H3z" />
    <path d="M16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14" />
  </Base>
);
export const Image = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-5-5L5 21" />
  </Base>
);
export const Heading = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 4v16M18 4v16M6 12h12" />
  </Base>
);
export const AlignLeft = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 6h18M3 12h12M3 18h18M3 24h9" />
  </Base>
);
export const List = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <circle cx="4" cy="6" r="1" />
    <circle cx="4" cy="12" r="1" />
    <circle cx="4" cy="18" r="1" />
  </Base>
);
export const GripVertical = (p: IconProps) => (
  <Base {...p} strokeWidth={1.8}>
    <circle cx="9" cy="6" r="1" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="18" r="1" />
    <circle cx="15" cy="6" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="18" r="1" />
  </Base>
);
export const Info = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v.01M12 12v5" />
  </Base>
);
export const Slider = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 8h18M3 16h18" />
    <circle cx="9" cy="8" r="2.5" fill="currentColor" />
    <circle cx="16" cy="16" r="2.5" fill="currentColor" />
  </Base>
);
export const Play = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 4v16l14-8z" fill="currentColor" stroke="none" />
  </Base>
);
export const Pause = (p: IconProps) => (
  <Base {...p}>
    <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
    <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
  </Base>
);
export const Copy = (p: IconProps) => (
  <Base {...p}>
    <rect x="8" y="8" width="13" height="13" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </Base>
);
export const Eye = (p: IconProps) => (
  <Base {...p}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
);
export const Bell = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 10a6 6 0 0 1 12 0v4l2 3H4l2-3z" />
    <path d="M10 21h4" />
  </Base>
);
export const Mail = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Base>
);
export const ArrowRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </Base>
);
export const ArrowLeft = (p: IconProps) => (
  <Base {...p}>
    <path d="M19 12H5M11 5l-7 7 7 7" />
  </Base>
);
export const ChevronRight = (p: IconProps) => (
  <Base {...p}>
    <path d="m9 6 6 6-6 6" />
  </Base>
);
export const ChevronDown = (p: IconProps) => (
  <Base {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
);
export const X = (p: IconProps) => (
  <Base {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Base>
);
export const Clock = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Base>
);
export const Leaf = (p: IconProps) => (
  <Base {...p}>
    <path d="M11 20A7 7 0 0 1 4 13V5h8a7 7 0 0 1 7 7v1a7 7 0 0 1-8 7z" />
    <path d="M5 21 19 7" />
  </Base>
);
export const Pebble = (p: IconProps) => (
  <Base {...p}>
    <ellipse cx="12" cy="13" rx="8" ry="6" />
    <path d="M8 11c1-1 3-2 5-1" opacity="0.5" />
  </Base>
);
export const Wind = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 8h11a3 3 0 1 0-3-3" />
    <path d="M2 12h17a3 3 0 1 1-3 3" />
    <path d="M5 16h8" />
  </Base>
);
export const Coffee = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 8h14v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
    <path d="M18 11h2a2 2 0 0 1 0 4h-2" />
    <path d="M8 2v3M12 2v3" />
  </Base>
);
export const Zap = (p: IconProps) => (
  <Base {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
  </Base>
);
export const Heart = (p: IconProps) => (
  <Base {...p}>
    <path d="M20.8 6.6a5 5 0 0 0-8.8-2.2A5 5 0 0 0 3.2 6.6c0 5 8.8 10.4 8.8 10.4s8.8-5.4 8.8-10.4z" />
  </Base>
);
export const Layers = (p: IconProps) => (
  <Base {...p}>
    <path d="m12 2 10 5-10 5L2 7z" />
    <path d="m2 12 10 5 10-5" />
    <path d="m2 17 10 5 10-5" />
  </Base>
);
export const Download = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3v13M6 11l6 6 6-6M5 21h14" />
  </Base>
);
export const Upload = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21V8M6 13l6-6 6 6M5 3h14" />
  </Base>
);
export const Link = (p: IconProps) => (
  <Base {...p}>
    <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
    <path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
  </Base>
);
export const Share = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3v12M7 8l5-5 5 5" />
    <path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
  </Base>
);
export const Tag = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 12 12 4H4v8l8 8z" />
    <circle cx="8" cy="8" r="1.5" />
  </Base>
);
export const Filter = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 5h18l-7 9v6l-4-2v-4z" />
  </Base>
);
export const Edit = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 20h4l11-11-4-4L4 16z" />
    <path d="m13 5 4 4" />
  </Base>
);
export const Trash = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6h16M9 6V4h6v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
  </Base>
);
export const User = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Base>
);
export const Lock = (p: IconProps) => (
  <Base {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Base>
);
export const Shield = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3 4 6v6c0 4.5 3.2 8.6 8 10 4.8-1.4 8-5.5 8-10V6z" />
  </Base>
);
export const Globe = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 0 18" />
    <path d="M12 3a14 14 0 0 0 0 18" />
  </Base>
);
export const Palette = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3a9 9 0 0 0 0 18 2 2 0 0 0 2-2v-1a1 1 0 0 1 1-1h2a4 4 0 0 0 4-4 9 9 0 0 0-9-9z" />
    <circle cx="7.5" cy="11" r="1" />
    <circle cx="12" cy="7" r="1" />
    <circle cx="16.5" cy="11" r="1" />
  </Base>
);
export const Menu = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Base>
);
export const Star = (p: IconProps) => (
  <Base {...p}>
    <path d="m12 3 2.9 5.9L21 10l-4.5 4.4L17.8 21 12 17.8 6.2 21l1.3-6.6L3 10l6.1-1.1z" />
  </Base>
);
export const MoreHorizontal = (p: IconProps) => (
  <Base {...p}>
    <circle cx="5" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
  </Base>
);
export const Send = (p: IconProps) => (
  <Base {...p}>
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4z" />
  </Base>
);
export const CornerDownRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 4v7a4 4 0 0 0 4 4h13" />
    <path d="m17 11 4 4-4 4" />
  </Base>
);
export const Book = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 4a2 2 0 0 1 2-2h11v18H7a2 2 0 0 0-2 2z" />
  </Base>
);
export const Trophy = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 21h8M12 17v4M5 4h14v4a7 7 0 0 1-14 0z" />
    <path d="M5 4H3v2a3 3 0 0 0 3 3M19 4h2v2a3 3 0 0 1-3 3" />
  </Base>
);
export const Layout = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </Base>
);
export const Refresh = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M3 21v-5h5" />
  </Base>
);

/**
 * Lookup table — useful for dynamic icon rendering from data
 * (e.g. sidebar nav config by `icon: string`).
 */
// biome-ignore lint/suspicious/noExplicitAny: Icon component type is heterogeneous.
export const TempoIcon: Record<string, (p: IconProps) => any> = {
  Home,
  Check,
  CheckSquare,
  Notebook,
  BookOpen,
  Calendar,
  Sparkles,
  Flame,
  Target,
  Folder,
  Repeat,
  Chart,
  Settings,
  Plus,
  Search,
  Mic,
  Command,
  Sun,
  Moon,
  Laptop,
  Monitor,
  Ear,
  Type,
  Volume,
  Image,
  Heading,
  AlignLeft,
  List,
  GripVertical,
  Info,
  Slider,
  Play,
  Pause,
  Copy,
  Eye,
  Bell,
  Mail,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  X,
  Clock,
  Leaf,
  Pebble,
  Wind,
  Coffee,
  Zap,
  Heart,
  Layers,
  Download,
  Upload,
  Link,
  Share,
  Tag,
  Filter,
  Edit,
  Trash,
  User,
  Lock,
  Shield,
  Globe,
  Palette,
  Menu,
  Star,
  MoreHorizontal,
  Send,
  CornerDownRight,
  Book,
  Trophy,
  Layout,
  Refresh,
};
