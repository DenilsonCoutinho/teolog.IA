'use client';
import { createCheckoutSessionAction } from "../../../../actions/biling";

import { updateBilingPremium } from "../../../../actions/update_Biling_Premim";

export default function Planos() {

  return (
    <div className="bg-gradient-to-b from-white to-purple-50 min-h-screen pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="mt-2 md:text-3xl text-xl font-bold text-purple-800">Plano Exclusivo</h2>
        <p className="mt-2 md:text-2xl text-md font-medium text-gray-900">
          Inicie sua jornada bíblica com nosso plano exclusivo
        </p>
      </div>

      <div className="mt-12 flex md:flex-row flex-col justify-center gap-6 items-center md:items-start">
        <div className="bg-white border-2 border-purple-800 rounded-xl shadow-lg p-6 relative w-full max-w-md">
          <div className="absolute -top-4 left-4 bg-purple-800 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Mais Popular
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Premium</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            R$27,90 <span className="text-sm font-normal">/por mês</span>
          </p>
          <p className="mt-2 text-gray-600">Apenas R$0,93 centavos por dia.</p>
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li>✓ Perguntas ilimitadas</li>
            <li>✓ Acesso a todo conteúdo bíblico</li>
            <li>✓ Respostas completas e fundamentadas</li>
            <li>✓ Resposta de acordo com a sua teologia (Batista, Pentecostal, Presbiteriana, Arminiana)</li>
            <li>✓ Você estará apoiando missões mundiais: 50% de toda a arrecadação é destinada ao campo missionário.</li>
          </ul>
          <button onClick={() => updateBilingPremium()} className="mt-6 border w-full py-2 px-4 rounded-lg bg-purple-800 text-white hover:bg-purple-600 transition">
            Assinar Premium
          </button>
        </div>

        <div className="bg-white border-2 border-gray-400 rounded-xl shadow-lg p-6 relative w-full max-w-md">
          <div className="absolute -top-4 left-4 bg-gray-800 text-white text-xs font-semibold px-3 py-1 rounded-full">
            EM BREVE
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Ministério</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            R$49,90 <span className="text-sm font-normal">/por mês</span>
          </p>
          <p className="mt-2 text-gray-600">Para quem busca aprendizado completo e futuro avançado.</p>
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li>✓ Perguntas ilimitadas</li>
            <li>✓ Acesso a todo conteúdo bíblico</li>
            <li>✓ Respostas completas e fundamentadas</li>
            <li>✓ Resposta de acordo com a sua teologia (Batista, Pentecostal, Presbiteriana, Arminiana)</li>
            <li>✓ Você estará apoiando missões mundiais: 50% de toda a arrecadação é destinada ao campo missionário.</li>
            <li>Gerador de estudos bíblicos (Em breve)</li>
            <li>Devocionais diários personalizados (Em breve)</li>
            <li>Quizzes teológicos avançados (Em breve)</li>
          </ul>
          <button className="mt-6 border w-full py-2 px-4 rounded-lg bg-purple-300 text-white opacity-50 cursor-not-allowed transition" disabled>
            Assinar Ministério
          </button>
        </div>
      </div>
    </div>

  );
}
