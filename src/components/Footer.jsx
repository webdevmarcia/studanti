function Footer() {
  return (
    <footer className="w-full border-t border-black/10 py-10 mt-20">
      <div className="max-w-6xl mx-auto px-6 text-center">

        {/* Texto institucional */}
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Nome da Marca — Todos os direitos reservados.
        </p>

      </div>
    </footer>
  );
}

export default Footer;
