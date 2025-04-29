'use client';
import { createCheckoutSessionAction } from "../../../../actions/biling";
const planos = [

  {
    destaque: 'Mais Popular',
    titulo: 'Premium',
    preco: 'R$27,90',
    periodo: '/por mês',
    descricao: 'Apenas R$0,93 centavos por dia.',
    beneficios: [
      '✓ Perguntas ilimitadas',
      '✓ Acesso a todo conteúdo bíblico',
      '✓ Respostas completas e fundamentadas',
      '✓ Resposta de acordo com a sua teologia (Batista, Pentecostal, Presbiteriana, Arminiana)',
      '✓ Você estará apoiando missões mundiais: 50% de toda a arrecadação é destinada ao campo missionário.',
    ],
    botao: 'Assinar Premium',
    onclick: async () => {
      await createCheckoutSessionAction();
    },
    corBorda: 'border-purple-800',
    corBotao: 'bg-purple-800 text-white hover:bg-purple-600',
    desativado: false,
  },
  {
    destaque: 'EM BREVE',
    titulo: 'Ministério',
    preco: 'R$49,90',
    periodo: '/por mês',
    descricao: 'Para quem busca aprendizado completo e futuro avançado.',
    beneficios: [
      '✓ Perguntas ilimitadas',
      '✓ Acesso a todo conteúdo bíblico',
      '✓ Respostas completas e fundamentadas',
      '✓ Resposta de acordo com a sua teologia (Batista, Pentecostal, Presbiteriana, Arminiana)',
      '✓ Você estará apoiando missões mundiais: 50% de toda a arrecadação é destinada ao campo missionário.',
      'Gerador de estudos biblicos (Em breve)',
      'Devocionais diários personalizados (Em breve)',
      'Quizzes teológicos avançados (Em breve)',
    ],
    botao: 'Assinar Ministério',
    corBorda: 'border-gray-400',
    corBotao: 'bg-purple-300 text-white',
    desativado: true,
  },
];

export default function Planos() {

  return (
    <div className="bg-gradient-to-b from-white to-purple-50 min-h-screen pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="mt-2 md:text-3xl text-xl font-bold text-purple-800">Plano Exclusivo</h2>
        <p className="mt-2 md:text-2xl text-md font-medium text-gray-900">Inicie sua jornada bíblica com nosso plano exclusivo</p>
      </div>

      <div className="mt-12 flex md:flex-row flex-col justify-center gap-6 items-center md:items-start ">
        {planos.map((plano, index) => (
          <div
            key={index}
            className={`bg-white border-2 ${plano.corBorda} rounded-xl shadow-lg p-6 relative w-full max-w-md`}
          >
            {plano.destaque && (
              <div className={`absolute -top-4 left-4 ${plano.destaque === 'Mais Popular' ? 'bg-purple-800' : 'bg-gray-800'} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                {plano.destaque}
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900">{plano.titulo}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{plano.preco} <span className="text-sm font-normal">{plano.periodo}</span></p>
            <p className="mt-2 text-gray-600">{plano.descricao}</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              {plano.beneficios.map((beneficio, idx) => (
                <li key={idx}>{beneficio}</li>
              ))}
            </ul>
            <button
              onClick={plano.onclick}
              disabled={plano.desativado}
              className={`mt-6 border w-full cursor-pointer py-2 px-4 rounded-lg transition ${plano.corBotao} ${plano.desativado ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {plano.botao}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
