import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAvatarPlaceholder(name: string, size = 96): string {
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join("") || "?";
  return `https://placehold.co/${size}x${size}/C8622A/FFFFFF?text=${encodeURIComponent(initials)}`;
}
