export default function Footer() {
  return (
    <footer
      className="
        border-t
        border-white/5
        py-2
        mt-3
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-3
          flex
          items-center
          justify-between
        "
      >
        <p className="text-sm text-slate-500">
          © 2025 Inventário Pro
        </p>

        <p className="text-sm text-slate-600">
          Infrastructure Management Platform
        </p>
      </div>
    </footer>
  );
}