export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(15,29,37,0.36)] backdrop-blur-sm">
      <div className="rounded-full bg-[rgba(12,27,35,0.86)] px-5 py-4 text-sm font-medium text-white shadow-[0_18px_45px_rgba(0,0,0,0.24)]">
        <div className="flex items-center gap-3">
          <span className="alakol-spinner" />
          Открываем страницу
        </div>
      </div>
    </div>
  );
}
