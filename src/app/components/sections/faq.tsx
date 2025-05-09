import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "../../../components/ui/accordion";
  
  const faqs = [
    {
      question: "Preciso ter conhecimento bíblico avançado?",
      answer: "Não! Nossa plataforma foi desenvolvida para todos os níveis de conhecimento bíblico, desde iniciantes até estudiosos mais avançados."
    },
    {
      question: "A IA explica com base em qual interpretação?",
      answer: "Nossas explicações são baseadas na teologia que você aceita ou está estudando"
    },
    {
      question: "Preciso criar conta?",
      answer: "Oferecemos 3 tentativas ao dia gratuito, mas você pode escolher o nosso plano Premium e você terá pesquisa ilimitadas."
    },
    {
      question: "As explicações substituem os estudos bíblicos?",
      answer: "Não! Nossa ferramenta é um complemento para seus estudos e não substitui a orientação pastoral ou a participação em sua igreja local."
    }
  ];
  
  export function FAQ() {
    return (
      <section className="py-24 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl text-black font-bold text-center mb-16">
            Perguntas Frequentes
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-black">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-black">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    );
  }