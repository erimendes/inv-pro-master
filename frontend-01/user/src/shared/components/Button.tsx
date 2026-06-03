import { Loader2 } from 'lucide-react';

export function Button({ children, loading, className = '', variant = 'primary', ...props }: any) {
  const variants: any = {
    primary: 'bg-[rgb(var(--primary))] text-slate-950 hover:opacity-90',
    outline: 'border border-white/10 text-white hover:bg-white/5',
    ghost: 'text-slate-400 hover:text-white hover:bg-white/5'
  };

  return (
    <button 
      {...props} // ISSO É ESSENCIAL para o submit funcionar
      disabled={loading || props.disabled}
      className={`flex items-center justify-center gap-2 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${variants[variant]} ${className}`}
    >
      {loading ? <Loader2 className="animate-spin" size={20} /> : children}
    </button>
  );
}
