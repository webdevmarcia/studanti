export default function AnimatedButton({ children, href, onClick, className = "" }) {
  const Component = href ? "a" : "button";

  return (
    <Component
      href={href}
      onClick={onClick}
      className={`
        relative inline-block px-8 py-3 font-semibold rounded-full overflow-hidden
        transition-all duration-300 group
        ${className}
      `}
    >
      {/* Fundo animado */}
      <span
        className="
          absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-300
          translate-y-full group-hover:translate-y-0
          transition-all duration-300
        "
      />

      {/* Texto */}
      <span className="relative z-10 text-black group-hover:text-black">
        {children}
      </span>

      {/* Brilho lateral */}
      <span
        className="
          absolute left-0 top-0 w-0 h-full bg-white/40
          group-hover:w-full transition-all duration-500
        "
      />
    </Component>
  );
}
