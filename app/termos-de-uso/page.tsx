'use client'

import Header from '../components/Header'
import GenderSelector from '../components/GenderSelector'

export default function TermosDeUsoPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col overflow-x-hidden">
      <div className="relative">
        <Header />
        <main className="max-w-xl mx-auto px-4 pt-8 pb-16 text-center">
          <GenderSelector />

          <div className="relative mb-8 text-left">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FD5FC2] via-pink-400 to-[#FD5FC2]">
                Termo de Uso
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              Última atualização: 17 de outubro de 2025
            </p>
            <div className="absolute -bottom-3 left-0 w-16 h-1 bg-pink-500 rounded-full" />
          </div>

          <div className="bg-[#141414] border border-gray-800 rounded-3xl p-6 md:p-8 text-left space-y-5 text-sm text-gray-300 leading-relaxed">
            <p>
              Bem-vindo ao EroMusa (o "Site", "Serviço", "nós", "nos" ou "nosso"). Estes Termos de Uso (os "Termos") formam um contrato legalmente vinculante entre você ("você" ou o "Usuário") e nós. Ao acessar, navegar ou usar o Serviço, você confirma que leu, entendeu e concorda em estar vinculado a estes Termos e a todas as leis e regulamentos aplicáveis. Se você não concorda, não deve usar o Serviço.
            </p>

            <Section title="1. Descrição do Serviço">
              O Serviço permite aos Usuários enviar imagens ou vídeos de pessoas e, por meio de modelos proprietários de inteligência artificial ("IA"), gerar clipes curtos de vídeo ou mídias semelhantes com base nesses envios (o "Conteúdo Gerado por IA").
            </Section>

            <Section title="2. Elegibilidade">
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Você deve ter pelo menos 18 anos (ou a maioridade em sua jurisdição, o que for maior) e ter capacidade legal para celebrar estes Termos.</li>
                <li>Você afirma que é a pessoa retratada em cada imagem ou vídeo que envia; você não deve enviar conteúdo que retrate qualquer outra pessoa para processamento por IA sem o consentimento explícito dela.</li>
              </ul>
            </Section>

            <Section title="3. Contas de Usuário e Segurança">
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Você pode precisar criar uma conta. Você é responsável por manter a confidencialidade das suas credenciais de login e por toda a atividade em sua conta.</li>
                <li>Você deve nos notificar imediatamente sobre qualquer uso não autorizado da sua conta.</li>
              </ul>
            </Section>

            <Section title="4. Conteúdo do Usuário">
              <p>"Conteúdo do Usuário" significa todas as imagens, vídeos, dados, textos, áudios ou outros materiais que você envia, transmite ou de outra forma disponibiliza através do Serviço.</p>
              <Subsection title="4.1 Suas Declarações">
                <p>Ao enviar Conteúdo do Usuário, você declara e garante que:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>você é o único sujeito retratado na(s) imagem(ns) ou vídeo(s) e possui ou de outra forma controla todos os direitos necessários para enviar o Conteúdo do Usuário;</li>
                  <li>o Conteúdo do Usuário não infringe, se apropria indevidamente ou viola quaisquer direitos de propriedade intelectual, privacidade, publicidade ou outros direitos de propriedade;</li>
                  <li>o Conteúdo do Usuário cumpre a Seção 4.3 (Conteúdo Proibido).</li>
                </ul>
              </Subsection>

              <Subsection title="4.2 Licença para Nós">
                <p>Você nos concede uma licença limitada, não exclusiva e isenta de royalties para hospedar, armazenar, reproduzir, modificar, adaptar, criar obras derivadas (incluindo Conteúdo Gerado por IA) e de outra forma usar o Conteúdo do Usuário exclusivamente com o propósito de operar e fornecer o Serviço a você, bem como para melhorar nossos modelos, segurança, conformidade e suporte.</p>
                <Callout>
                  <strong>Importante:</strong> Nós nunca compartilhamos seu Conteúdo do Usuário (imagens ou vídeos enviados) ou Conteúdo Gerado por IA com terceiros. Seu conteúdo permanece privado e só é processado por nossos sistemas para fornecer o Serviço.
                </Callout>
              </Subsection>

              <Subsection title="4.3 Conteúdo Proibido">
                <p>Você concorda que não irá enviar, gerar ou distribuir pelo Serviço qualquer conteúdo que:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>retrate menores (qualquer pessoa com menos de 18 anos) em qualquer contexto sexual;</li>
                  <li>retrate qualquer pessoa além de você mesmo sem o consentimento explícito e verificável dessa pessoa;</li>
                  <li>promova violência, terrorismo, automutilação ou ódio;</li>
                  <li>seja ilegal, difamatório, fraudulento ou de outra forma censurável;</li>
                  <li>infrinja quaisquer direitos de terceiros;</li>
                  <li>viole qualquer lei ou regulamento aplicável.</li>
                </ul>
                <p className="mt-3">
                  Conteúdo NSFW ou sexualmente explícito retratando você mesmo, criado a partir de suas próprias imagens ou vídeos enviados, é permitido desde que cumpra as restrições acima e todas as leis aplicáveis. Você permanece totalmente responsável por tal conteúdo, incluindo qualquer compartilhamento ou publicação.
                </p>
              </Subsection>
            </Section>

            <Section title="5. Conteúdo Gerado por IA">
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>O Conteúdo Gerado por IA é criado algoritmicamente e pode conter artefatos, imprecisões ou distorções. Nós não garantimos que o Conteúdo Gerado por IA será preciso, realista ou adequado para qualquer finalidade específica.</li>
                <li>Você reconhece que o Conteúdo Gerado por IA pode produzir involuntariamente material sensível ou ofensivo; você assume todos os riscos decorrentes de seu uso ou publicação.</li>
                <li>Sujeito ao seu cumprimento destes Termos e ao pagamento de quaisquer taxas aplicáveis, nós lhe atribuímos todos os nossos direitos, título e interesses sobre o Conteúdo Gerado por IA que criamos especificamente para você, excluindo qualquer software ou modelo subjacente.</li>
                <li><strong>Sua Responsabilidade.</strong> Você é o único responsável por todo Conteúdo Gerado por IA criado a partir de seus envios, incluindo qualquer compartilhamento, publicação ou outro uso. Você deve garantir que tal conteúdo cumpra todas as leis, regulamentos e estes Termos.</li>
              </ul>
            </Section>

            <Section title="6. Direitos de Propriedade Intelectual">
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Todos os direitos de propriedade intelectual do Site, modelos subjacentes, software, marcas registradas e logotipos são e permanecerão nossa propriedade exclusiva ou de nossos licenciadores.</li>
                <li>Nada nestes Termos lhe concede qualquer direito de usar nossas marcas registradas ou marcas de serviço sem consentimento prévio por escrito.</li>
              </ul>
            </Section>

            <Section title="7. Taxas e Pagamento">
              <p>Se o Serviço oferecer níveis pagos, créditos ou assinaturas, você concorda em pagar todas as taxas de acordo com os termos de preços e cobrança publicados no Site. As taxas não são reembolsáveis, exceto conforme exigido por lei ou expressamente declarado de outra forma.</p>
              <Subsection title="7.1 Política de Reembolso">
                <p>Nós não fornecemos reembolsos sob nenhuma circunstância, incluindo mas não se limitando a:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Créditos comprados, independentemente de terem sido usados ou não;</li>
                  <li>Taxas de assinatura ou quaisquer outros pagamentos feitos ao Serviço;</li>
                  <li>Créditos consumidos para Conteúdo Gerado por IA, independentemente da sua satisfação com os resultados, problemas técnicos ou qualquer outra razão.</li>
                </ul>
                <p className="mt-3">
                  Uma vez que os créditos são usados para gerar conteúdo, eles são considerados consumidos e não serão restaurados ou reembolsados. Você reconhece que o Conteúdo Gerado por IA pode variar em qualidade e que o consumo de créditos é final após a geração.
                </p>
              </Subsection>
            </Section>

            <Section title="8. Recompensas de Criadores e Pagamentos">
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Mudanças na Política de Recompensas.</strong> Podemos estabelecer, modificar ou descontinuar quaisquer regras ou fórmulas que regem recompensas baseadas em créditos ou monetárias para criadores de modelos a qualquer momento, a nosso exclusivo critério e sem aviso prévio.</li>
                <li><strong>Cálculo e Exibição de Recompensas.</strong> Os valores de recompensa mostrados no painel da sua conta são apenas para fins informativos e podem estar sujeitos a verificação, ajuste ou atraso. Os valores finais pagáveis serão determinados exclusivamente por nossos cálculos e registros internos.</li>
                <li><strong>Cronograma de Pagamentos.</strong> Os pagamentos são processados periodicamente, conforme determinado por nós, e podem ser atrasados, retidos ou combinados se suspeitarmos de irregularidades ou precisarmos verificar a elegibilidade.</li>
                <li><strong>Taxas de Transação.</strong> Ao solicitar um saque ou pagamento, os criadores arcarão com todos e quaisquer custos relacionados à transação, incluindo, mas não se limitando a, encargos bancários, taxas de transferência bancária, taxas de processadores de pagamento de terceiros e taxas de rede blockchain. Não somos responsáveis por quaisquer perdas ou atrasos causados por tais provedores terceiros.</li>
                <li><strong>Moeda e Taxas de Câmbio.</strong> Todas as recompensas e pagamentos são calculados e desembolsados na moeda especificada por nós. Quaisquer conversões serão feitas com taxas e métodos determinados por nós, e não somos responsáveis por flutuações nas taxas de câmbio ou taxas de terceiros.</li>
                <li><strong>Responsabilidades Fiscais.</strong> Cada criador é o único responsável por determinar e cumprir quaisquer obrigações fiscais aplicáveis decorrentes de recompensas ou pagamentos recebidos através do Serviço. Não fornecemos consultoria tributária e não faremos declarações ou pagamentos em seu nome.</li>
                <li><strong>Fraude e Abuso.</strong> Reservamo-nos o direito de suspender, revogar ou recuperar quaisquer recompensas ou saldos se suspeitarmos de atividade fraudulenta ou abusiva, incluindo, mas não se limitando a, registros falsos, geração de tráfego artificial ou manipulação de créditos. Tal conduta pode resultar no encerramento da conta e desqualificação permanente.</li>
                <li><strong>Descontinuação do Programa.</strong> Podemos suspender ou encerrar o programa de recompensas, no todo ou em parte, a qualquer momento, sem responsabilidade, desde que as recompensas válidas acumuladas, mas não pagas, sejam processadas de acordo com estes Termos.</li>
              </ul>
            </Section>

            <Section title="9. DMCA / Reclamações de Direitos Autorais">
              <p>Respeitamos os direitos de propriedade intelectual e respondemos a notificações de suposta violação de acordo com o Digital Millennium Copyright Act ("DMCA"). Para solicitações de remoção, envie um e-mail para <a href="mailto:DMCA@eromusa.com" className="text-pink-400 hover:text-pink-300 underline">DMCA@eromusa.com</a> com as informações necessárias.</p>
            </Section>

            <Section title="10. Isenções de Responsabilidade">
              <p className="uppercase font-bold text-gray-200">
                O SERVIÇO E TODO O CONTEÚDO SÃO FORNECIDOS "COMO ESTÃO" E "CONFORME DISPONIBILIDADE" SEM GARANTIAS DE QUALQUER TIPO, EXPRESSAS OU IMPLÍCITAS, INCLUINDO MAS NÃO SE LIMITANDO A COMERCIABILIDADE, ADEQUAÇÃO A UMA FINALIDADE ESPECÍFICA E NÃO VIOLAÇÃO. NÃO GARANTIMOS QUE O SERVIÇO SERÁ ININTERRUPTO, SEGURO OU LIVRE DE ERROS.
              </p>
            </Section>

            <Section title="11. Limitação de Responsabilidade">
              <p className="uppercase font-bold text-gray-200">
                NA EXTENSÃO MÁXIMA PERMITIDA POR LEI, NÃO SEREMOS RESPONSÁVEIS POR QUAISQUER DANOS INDIRETOS, INCIDENTAIS, CONSEQUENCIAIS, ESPECIAIS OU EXEMPLARES (INCLUINDO PERDA DE LUCROS, DADOS, FUNDO DE COMÉRCIO OU OUTRAS PERDAS INTANGÍVEIS) DECORRENTES OU EM CONEXÃO COM O SERVIÇO.
              </p>
            </Section>

            <Section title="12. Indenização">
              <p>Você concorda em indenizar, defender e isentar de responsabilidade o Site e seus afiliados, executivos, diretores, funcionários e agentes de quaisquer reclamações, danos, responsabilidades, custos e despesas (incluindo honorários advocatícios razoáveis) decorrentes de:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>(a) seu Conteúdo do Usuário;</li>
                <li>(b) seu uso do Serviço;</li>
                <li>(c) sua violação destes Termos;</li>
                <li>(d) sua violação de qualquer lei ou direitos de terceiros.</li>
              </ul>
            </Section>

            <Section title="13. Rescisão">
              <p>Podemos suspender ou encerrar seu acesso ao Serviço a qualquer momento, com ou sem aviso prévio, por conduta que acreditamos violar estes Termos ou ser prejudicial a outros Usuários, a nós ou a terceiros. As Seções 4–14 sobreviverão a qualquer rescisão.</p>
            </Section>

            <Section title="14. Modificações">
              <p>Podemos revisar estes Termos de tempos em tempos. Alterações materiais serão publicadas nesta página e, quando apropriado, notificadas a você por e-mail. Ao continuar usando o Serviço após as alterações entrarem em vigor, você aceita os Termos revisados.</p>
            </Section>

            <Section title="15. Lei Aplicável e Resolução de Disputas">
              <p>Estes Termos são regidos pelas leis de São Vicente e Granadinas, sem consideração aos seus princípios de conflito de leis. Qualquer disputa decorrente ou relacionada a estes Termos será resolvida por meio de negociações de boa-fé; se não resolvida, os tribunais de São Vicente e Granadinas terão jurisdição exclusiva.</p>
            </Section>

            <Section title="16. Contato">
              <p>Dúvidas sobre estes Termos podem ser direcionadas para <a href="mailto:legal@eromusa.com" className="text-pink-400 hover:text-pink-300 underline">legal@eromusa.com</a>.</p>
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
