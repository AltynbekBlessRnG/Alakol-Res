import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition duration-200",
        variant === "primary" && "bg-pine text-white hover:bg-[#20493d]",
        variant === "secondary" && "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/16",
        variant === "ghost" && "bg-transparent text-ink hover:bg-black/5",
        className
      )}
      {...props}
    />
  );
}
