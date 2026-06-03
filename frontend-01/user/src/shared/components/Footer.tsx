export function Footer() {
  return (
    <footer className="w-full py-6 px-8 border-t border-white/5 bg-slate-900/50 backdrop-blur-xl mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-slate-500 font-medium">© 2026 Inventário Pro - Gestão de TI</p>
        <div className="flex gap-6">
          <span className="text-[10px] text-slate-600 uppercase tracking-widest font-black">Status: Online</span>
          <span className="text-[10px] text-slate-600 uppercase tracking-widest font-black">DB: PostgreSQL</span>
        </div>
      </div>
    </footer>
  );
}