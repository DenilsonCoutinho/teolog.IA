export function Footer() {
    return (
      <footer className="py-12 px-4 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Sobre</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-purple-300">Nossa Missão</a></li>
              <li><a href="#" className="hover:text-purple-300">Equipe</a></li>
              <li><a href="#" className="hover:text-purple-300">Blog</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-purple-300">Ajuda</a></li>
              <li><a href="#" className="hover:text-purple-300">Contato</a></li>
              <li><a href="#" className="hover:text-purple-300">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-purple-300">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-purple-300">Privacidade</a></li>
              <li><a href="#" className="hover:text-purple-300">Cookies</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Redes Sociais</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-purple-300">Instagram</a></li>
              <li><a href="#" className="hover:text-purple-300">Facebook</a></li>
              <li><a href="#" className="hover:text-purple-300">Twitter</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 text-center text-slate-400">
          <p>&copy; 2025 BíbliaIA. Todos os direitos reservados.</p>
        </div>
      </footer>
    );
  }