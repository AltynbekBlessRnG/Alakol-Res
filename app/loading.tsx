export default function Loading() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100]">
      <div className="h-1 w-full overflow-hidden bg-transparent">
        <div className="h-full w-1/3 animate-[alakol-loading_1.1s_ease-in-out_infinite] rounded-r-full bg-[#d49b35]" />
      </div>
    </div>
  );
}
