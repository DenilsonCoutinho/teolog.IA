import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

const benefits = [
    {
      title: "Entendimento fácil da Bíblia",
      description: "Explicações claras e contextualizadas de qualquer versículo em segundos"
    },
    {
      title: "Interface intuitiva",
      description: "Basta marcar o texto que deseja entender melhor e clicar em pesquisar"
    },
    {
      title: "Respostas embasadas",
      description: "Conteúdo fundamentado em estudos teológicos com linguagem acessível"
    }
  ];
  
  export function Benefits() {
    return (
      <section className="py-24 px-4 bg-white tex">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-black">
            Benefícios da Nossa Plataforma
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="border-none shadow-lg bg-gradient-to-b from-purple-50 to-white">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                      <Check className="h-6 w-6 text-purple-800" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-black">{benefit.title}</h3>
                  <p className="text-slate-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }