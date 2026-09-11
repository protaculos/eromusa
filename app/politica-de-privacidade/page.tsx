'use client'

import Header from '../components/Header'
import GenderSelector from '../components/GenderSelector'

export default function PoliticaDePrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col overflow-x-hidden">
      <div className="relative">
        <Header />
        <main className="max-w-xl mx-auto px-4 pt-8 pb-16 text-center">
          <GenderSelector />

          <div className="relative mb-8 text-left">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FD5FC2] via-pink-400 to-[#FD5FC2]">
                Política de Privacidade
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              Última atualização: 15 de dezembro de 2025
            </p>
            <div className="absolute -bottom-3 left-0 w-16 h-1 bg-pink-500 rounded-full" />
          </div>

          <div className="bg-[#141414] border border-gray-800 rounded-3xl p-6 md:p-8 text-left space-y-5 text-sm text-gray-300 leading-relaxed">
            <p>
              EroMusa ("nós", "nos", "nosso") respeita sua privacidade e está comprometido em proteger suas informações pessoais. Esta Política de Privacidade explica quais dados coletamos, como os usamos, como os compartilhamos e seus direitos.
            </p>

            <Section title="1. Informações que Coletamos">
              <p>Coletamos as seguintes categorias de informações:</p>
              <table className="w-full mt-3 text-xs">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 text-gray-400">Categoria</th>
                    <th className="text-left py-2 text-gray-400">Exemplos</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-800">
                    <td className="py-2">Informações que você fornece</td>
                    <td className="py-2">Credenciais de conta, endereço de e-mail, imagens enviadas, detalhes de pagamento (tratados por processadores terceiros)</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2">Dados de conteúdo</td>
                    <td className="py-2">Conteúdo do Usuário (imagens) e Conteúdo Gerado por IA</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2">Dados coletados automaticamente</td>
                    <td className="py-2">Endereço IP, tipo de navegador, identificadores de dispositivo, arquivos de log, estatísticas de uso, cookies</td>
                  </tr>
                  <tr>
                    <td className="py-2">Dados derivados</td>
                    <td className="py-2">Incorporações, saídas de modelos, análises</td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Section title="2. Como Usamos as Informações">
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Fornecer e operar o Serviço e gerar Conteúdo Gerado por IA.</li>
                <li>Processar pagamentos e gerenciar assinaturas.</li>
                <li>Melhorar, testar e desenvolver nossos modelos, algoritmos e recursos.</li>
                <li>Monitorar e proteger o Serviço, prevenir fraudes e abusos.</li>
                <li>Cumprir com obrigações legais e fazer valer nossos Termos.</li>
                <li>Comunicar com você sobre atualizações, alertas de segurança e suporte.</li>
              </ul>
            </Section>

            <Section title="3. Compartilhamento de Informações">
              <p>Nós compartilhamos informações pessoais apenas nas seguintes situações:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Provedores de Serviço</strong> — hospedagem em nuvem, processadores de pagamento, fornecedores de análise e redes de entrega de conteúdo, vinculados por acordos de confidencialidade.</li>
                <li><strong>Legal e Conformidade</strong> — quando exigido por lei, intimação ou ordem judicial, ou para proteger direitos, segurança ou propriedade.</li>
                <li><strong>Transferências de Negócios</strong> — em conexão com uma fusão, aquisição ou venda de ativos (com notificação a você).</li>
                <li><strong>Com seu Consentimento</strong> — onde você nos autoriza explicitamente a compartilhar dados.</li>
              </ul>
              <Callout>
                <strong>Importante:</strong> Nós nunca compartilhamos suas imagens enviadas ou vídeos gerados por IA com terceiros. Seu conteúdo permanece privado e é processado apenas por nossos sistemas para fornecer o Serviço.
              </Callout>
              <Callout>
                Nós nunca vendemos seus dados pessoais.
              </Callout>
            </Section>

            <Section title="4. Cookies e Rastreamento">
              <p>Usamos cookies e tecnologias semelhantes para lembrar preferências, realizar análises e melhorar o Serviço.</p>
              <p className="mt-2">Você pode desativar cookies em seu navegador, mas alguns recursos podem não funcionar.</p>
            </Section>

            <Section title="5. Retenção de Dados">
              <p>Retemos dados pessoais apenas pelo tempo necessário para os fins descritos aqui, a menos que um período de retenção mais longo seja exigido para cumprir a lei, resolver disputas ou fazer valer nossos acordos.</p>
              <Subsection title="Retenção de Conteúdo">
                <p>Armazenamos suas imagens enviadas e vídeos gerados para fornecer acesso ao seu conteúdo. O conteúdo só é excluído quando você executa explicitamente uma ação de exclusão (como excluir conteúdo específico ou toda a sua conta). Nós não excluímos automaticamente seu conteúdo — ele permanece disponível até que você escolha removê-lo.</p>
              </Subsection>
              <Subsection title="Exclusão de Conteúdo">
                <p>Quando você exclui seu conteúdo (imagens/vídeos individuais ou por meio da exclusão da conta), a exclusão é irreversível e o removemos imediatamente e permanentemente de nossos sistemas. Nós não retemos cópias do seu conteúdo excluído.</p>
              </Subsection>
            </Section>

            <Section title="6. Transferências Internacionais">
              <p>Seus dados podem ser processados em países fora de sua jurisdição onde as leis de privacidade podem ser diferentes. Adotamos medidas para garantir que salvaguardas adequadas estejam em vigor para proteger suas informações pessoais.</p>
            </Section>

            <Section title="7. Segurança">
              <p>Implementamos medidas administrativas, técnicas e físicas padrão do setor para proteger dados pessoais. No entanto, nenhuma medida de segurança é incondicional; você usa o Serviço por sua própria conta e risco.</p>
            </Section>

            <Section title="8. Seus Direitos">
              <p>Você pode ter os seguintes direitos:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Acessar, corrigir ou excluir dados pessoais.</li>
                <li>Opor-se ou restringir o processamento.</li>
                <li>Portabilidade de dados.</li>
                <li>Retirar consentimento a qualquer momento (o processamento anterior à retirada permanece legal).</li>
              </ul>
              <p className="mt-3">
                Você pode exercer esses direitos entrando em contato conosco em <a href="mailto:privacy@eromusa.com" className="text-pink-400 hover:text-pink-300 underline">privacy@eromusa.com</a>.
              </p>
            </Section>

            <Section title="9. Exclua Sua Conta">
              <p>Você pode excluir permanentemente sua conta EroMusa a qualquer momento:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Faça login e vá para Configurações → Excluir Conta</li>
                <li>A exclusão é irreversível. Todos os créditos, vídeos, imagens enviadas e dados pessoais serão completamente apagados de nossos sistemas e não reteremos cópias do seu conteúdo após a exclusão, exceto onde a retenção for exigida por lei (por exemplo, registros de prevenção à fraude e contabilidade que não incluem seu conteúdo).</li>
              </ul>
            </Section>

            <Section title="10. Privacidade de Crianças">
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>O Serviço não é direcionado a crianças com menos de 18 anos.</li>
                <li>Nós não coletamos intencionalmente dados pessoais de menores.</li>
                <li>Se você acredita que uma criança nos forneceu dados pessoais, entre em contato conosco para excluí-los.</li>
              </ul>
            </Section>

            <Section title="11. Alterações a Esta Política">
              <p>Podemos atualizar esta Política de Privacidade periodicamente.</p>
              <p className="mt-2">Publicaremos a versão revisada e revisaremos a data "Última atualização".</p>
              <p className="mt-2">Alterações materiais serão notificadas por e-mail ou aviso proeminente.</p>
            </Section>

            <Section title="12. Contate-Nos">
              <p>Para perguntas sobre privacidade, envie um e-mail para <a href="mailto:privacy@eromusa.com" className="text-pink-400 hover:text-pink-300 underline">privacy@eromusa.com</a>.</p>
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

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <h3 className="text-sm font-bold text-pink-300 mb-1">{title}</h3>
      <div className="text-gray-300">{children}</div>
    </div>
  )
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 p-3 rounded-xl bg-pink-500/10 border border-pink-500/30 text-sm text-gray-200">
      {children}
    </div>
  )
}
