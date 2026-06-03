export function Input({ icon: Icon, ...props }: any) {
  return (
    <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3">
      {Icon && <Icon size={18} className="text-slate-400" />}
      <input {...props} className="bg-transparent outline-none w-full text-white placeholder-slate-500" />
    </div>
  );
}
