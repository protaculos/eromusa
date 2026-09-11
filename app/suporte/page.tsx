'use client'

import Header from '../components/Header'
import GenderSelector from '../components/GenderSelector'

export default function SuportePage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col overflow-x-hidden">
      <div className="relative">
        <Header />
        <main className="max-w-xl mx-auto px-4 pt-8 pb-16 text-center">
          <GenderSelector />

          <div className="relative mb-8 text-left">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FD5FC2] via-pink-400 to-[#FD5FC2]">
                Suporte
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              Estamos aqui para ajudar
            </p>
            <div className="absolute -bottom-3 left-0 w-16 h-1 bg-pink-500 rounded-full" />
          </div>

          <div className="bg-[#141414] border border-gray-800 rounded-3xl p-6 md:p-8 text-left space-y-5 text-sm text-gray-300 leading-relaxed">
            <Section title="Fale Conosco">
              <p>
                Precisa de ajuda? Envie um e-mail para <a href="mailto:suporte@eromusa.com" className="text-pink-400 hover:text-pink-300 underline">suporte@eromusa.com</a> e nossa equipe retornará o mais breve possível.
              </p>
            </Section>

            <Section title="Perguntas Frequentes">
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Problemas com pagamento?</strong> Verifique se todos os campos estão preenchidos corretamente e tente novamente. Para dúvidas sobre cargas, entre em contato.</li>
                <li><strong>Conta bloqueada?</strong> Envie um e-mail para suporte@eromusa.com com seu nome de usuário e uma descrição do problema.</li>
                <li><strong>Conteúdo gerado não saiu como esperado?</strong> Os modelos de IA podem variar. Tente ajustar sua imagem ou enviar uma nova. Créditos não são reembolsáveis.</li>
              </ul>
            </Section>

            <Section title="Horário de Atendimento">
              <p>Segunda a sexta: 09:00 – 22:00 (UTC-3)</p>
              <p>Respostas em até 24 horas úteis.</p>
            </Section>
          </div>
        </main>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold text-white mt-4 mb-2">{title}</h2>
      <div className="text-gray-300">{children}</div>
    </section>
  )
}
