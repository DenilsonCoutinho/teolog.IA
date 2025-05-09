import { Book, Search, Check, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Book,
    title: "Leia a Bíblia na plataforma",
    description: "Acesse o texto bíblico completo em nossa interface "
  },
  {
    icon: Search,
    title: "Selecione qualquer versículo",
    description: "Basta marcar o texto que deseja entender melhor"
  },
  {
    icon: Check,
    title: "Receba uma explicação clara",
    description: "Nossa IA fornece um entendimento contextualizado e acessível"
  }
];

export function HowItWorks() {
  return (
    <section id="howItwork" className="pb-24 px-4 bg-gradient-to-b from-white to-purple-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-black">
          Como Funciona
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={step.title} className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                  <step.icon className="h-8 w-8 text-purple-800" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-black">{step.title}</h3>
              <p className="text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}