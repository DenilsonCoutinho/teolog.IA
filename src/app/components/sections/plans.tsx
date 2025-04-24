export default function Planos() {
    return (
      <div className="bg-gradient-to-b from-white to-purple-50 min-h-screen pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="mt-2 md:text-3xl text-xl font-bold text-gray-900">Escolha o plano ideal para sua jornada de aprendizado bíblico</p>
        </div>
  
        <div className="mt-12 grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          {/* Plano Gratuito */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Gratuito</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">R$0 <span className="text-sm font-normal">/para sempre</span></p>
            <p className="mt-2 text-gray-600">Perfeito para experimentar os recursos básicos.</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li>✓ Até 5 perguntas por dia</li>
              <li>✓ Respostas completas e fundamentadas</li>
              <li>✓ Resposta de acordo com a sua teologia (Batista, Pentecostal, Presbiteriana)</li>
            </ul>
            <button className="mt-6 cursor-pointer w-full bg-white border border-gray-300 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-100 transition">Começar Gratuitamente</button>
          </div>
  
          {/* Plano Premium */}
          <div className="bg-white border-2 border-purple-800 rounded-xl shadow-lg p-6 relative">
            <div className="absolute -top-4 left-4 bg-purple-800 text-white text-xs font-semibold px-3 py-1 rounded-full">Mais Popular</div>
            <h3 className="text-lg font-semibold text-gray-900">Premium</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">R$19,90 <span className="text-sm font-normal">/por mês</span></p>
            <p className="mt-2 text-gray-600">Para quem busca aprendizado contínuo e completo.</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li>✓ Perguntas ilimitadas</li>
              <li>✓ Acesso a todo conteúdo bíblico</li>
              <li>✓ Respostas completas e fundamentadas</li>
              <li>✓ Resposta de acordo com a sua teologia (Batista, Pentecostal, Presbiteriana)</li>
              {/* <li> Histórico completo <span className="font-bold">(Em breve)</span></li> */}
              <li> Devocionais diários personalizados <span className="font-bold">(Em breve)</span></li>
              <li> Quizzes teológicos avançados <span className="font-bold">(Em breve)</span></li>
              <li> Conteúdo avançado <span className="font-bold">(Em breve)</span></li>
            </ul>
            <button className="mt-6 w-full cursor-pointer bg-purple-800 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition">Assinar Premium</button>
          </div>
        </div>
      </div>
    );
  }
  