import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-black/35 focus:border-lake focus:ring-2 focus:ring-lake/20",
        props.className
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-[140px] w-full rounded-3xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-black/35 focus:border-lake focus:ring-2 focus:ring-lake/20",
        props.className
      )}
    />
  );
}
