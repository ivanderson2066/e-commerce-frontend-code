import Link from "next/link";
import { Facebook, Instagram, Twitter } from 'lucide-react'; // Lucide icons

export function Footer() {
  return (
    <footer className="bg-[#374151] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h4 className="font-serif text-lg font-bold text-white">Caiçara Mix</h4>
            <p className="mt-2 text-sm text-gray-300 leading-relaxed">
              Beleza que vem da natureza, para você. Produtos selecionados com carinho e respeito ao meio ambiente.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold tracking-wide text-base mb-4">Institucional</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-gray-300 hover:text-[#A7E3B0] transition-colors">Sobre Nós</Link></li>
              <li><Link href="#" className="text-gray-300 hover:text-[#A7E3B0] transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-gray-300 hover:text-[#A7E3B0] transition-colors">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold tracking-wide text-base mb-4">Ajuda</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-gray-300 hover:text-[#A7E3B0] transition-colors">Dúvidas Frequentes</Link></li>
              <li><Link href="#" className="text-gray-300 hover:text-[#A7E3B0] transition-colors">Envio e Entrega</Link></li>
              <li><Link href="#" className="text-gray-300 hover:text-[#A7E3B0] transition-colors">Trocas e Devoluções</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold tracking-wide text-base mb-4">Siga-nos</h4>
            <div className="flex gap-4">
              <a href="#" className="text-gray-300 hover:text-[#A7E3B0] transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#A7E3B0] transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#A7E3B0] transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Caiçara Mix. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}