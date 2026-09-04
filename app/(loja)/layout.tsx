import { Masthead } from "@/components/loja/Masthead";
import { Footer } from "@/components/loja/Footer";
import { CartDrawer } from "@/components/loja/CartDrawer";

export default function LojaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <Masthead />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
