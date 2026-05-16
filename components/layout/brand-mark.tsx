type BrandMarkProps = {
  className?: string;
  compact?: boolean;
};

export function BrandMark({ className = "size-11", compact = false }: BrandMarkProps) {
  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#12382f] text-white shadow-[0_12px_30px_rgba(18,56,47,0.18)] ${className}`}>
      <svg viewBox="0 0 64 64" aria-hidden="true" className="h-[78%] w-[78%]">
        <path d="M12 38c7-9 14-13 23-13 7 0 12 3 17 8-5-2-10-2-15 1-7 3-13 10-25 4Z" fill="#7fd1c7" />
        <path d="M10 45c8 3 15 2 22-2 7-4 13-8 22-3-6 8-16 13-27 12-7-1-13-3-17-7Z" fill="#f7f1e6" />
        <circle cx="42" cy="20" r="7" fill="#d49b35" />
        <path d="M17 33c5-10 12-17 23-21-8 9-10 17-7 25-5-5-10-6-16-4Z" fill="#ffffff" opacity="0.18" />
      </svg>
      {!compact && <span className="sr-only">Alakol Select</span>}
    </span>
  );
}
