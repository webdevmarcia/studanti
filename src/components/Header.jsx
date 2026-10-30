function Header() {
  return (
    <header className="w-full py-4 bg-white shadow">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4">
        
        {/* Logo */}
        <a href="#hero" className="text-2xl font-bold">
          Logo
        </a>

        {/* Navegação */}
        <ul className="flex items-center gap-6 text-[15px] font-medium">
          <li><a href="#hero" className="hover:text-purple-600 transition">Hero</a></li>
          <li><a href="#sobre" className="hover:text-purple-600 transition">Sobre</a></li>
          <li><a href="#menu" className="hover:text-purple-600 transition">Menu</a></li>
          <li><a href="#contatos" className="hover:text-purple-600 transition">Contatos</a></li>
        </ul>

      </nav>
    </header>
  );
}

export default Header;
