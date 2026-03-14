import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Política de Privacidade da Lets Train — como coletamos, usamos e protegemos seus dados pessoais.',
}

const SECTIONS = [
  {
    title: '1. Quem somos',
    content: `A Lets Train é uma plataforma digital de treinos personalizados por inteligência artificial. Para dúvidas sobre esta política, entre em contato pelo e-mail: contato@letstrain.com.br`,
  },
  {
    title: '2. Dados que coletamos',
    content: `Coletamos as seguintes categorias de dados pessoais:\n\n**Cadastro:** nome, endereço de e-mail e, opcionalmente, número de telefone/WhatsApp.\n\n**Perfil de saúde:** idade, sexo, peso, altura, objetivo de treino, nível de condicionamento, local de treino, frequência semanal e informações de saúde relevantes (presença de lesões ou condições médicas, declaradas voluntariamente).\n\n**Uso do aplicativo:** treinos gerados e concluídos, avaliações de esforço, medidas corporais registradas, histórico de jejum intermitente, conquistas desbloqueadas, streak e nível de progressão.\n\n**Pagamento:** os dados de cartão de crédito são processados diretamente pelo Stripe e nunca armazenados em nossos servidores.\n\n**Dispositivo:** token de notificação push (para envio de lembretes), endereço IP e dados de sessão para autenticação segura.`,
  },
  {
    title: '3. Por que usamos seus dados',
    content: `Utilizamos seus dados para as seguintes finalidades:\n\n— Gerar treinos diários personalizados com base no seu perfil e progresso.\n— Calcular seu nível de progressão, conquistas e Lets Body Score.\n— Processar e gerenciar sua assinatura.\n— Enviar notificações push nos horários que você configurar.\n— Melhorar a qualidade dos treinos e a experiência do aplicativo.\n— Cumprir obrigações legais e regulatórias.`,
  },
  {
    title: '4. Base legal (LGPD)',
    content: `O tratamento dos seus dados é fundamentado nas seguintes bases legais previstas na Lei 13.709/2018 (LGPD):\n\n— **Execução de contrato:** dados necessários para prestar o serviço contratado (geração de treinos, controle de assinatura).\n— **Consentimento:** dados de saúde e notificações push, coletados mediante sua autorização expressa.\n— **Legítimo interesse:** melhoria contínua do serviço e segurança da plataforma.\n— **Cumprimento de obrigação legal:** retenção de dados fiscais e contratuais pelo prazo exigido por lei.`,
  },
  {
    title: '5. Compartilhamento de dados',
    content: `Compartilhamos seus dados apenas com os seguintes parceiros essenciais ao serviço:\n\n— **Supabase (Supabase Inc.):** banco de dados e autenticação. Dados armazenados em servidores AWS.\n— **Stripe (Stripe Inc.):** processamento de pagamentos. Sujeito à política de privacidade do Stripe.\n— **Anthropic (Anthropic PBC):** geração de treinos por IA (Claude). Apenas dados de perfil de treino são enviados, sem identificação pessoal direta.\n\nNão vendemos, alugamos nem compartilhamos seus dados com terceiros para fins publicitários.`,
  },
  {
    title: '6. Retenção de dados',
    content: `Mantemos seus dados enquanto sua conta estiver ativa. Após o encerramento da conta:\n\n— Dados de uso (treinos, conquistas) são excluídos em até 30 dias.\n— Dados financeiros são retidos pelo prazo de 5 anos, conforme exigência fiscal brasileira.\n— Você pode solicitar a exclusão antecipada dos seus dados pelo e-mail de contato.`,
  },
  {
    title: '7. Seus direitos (LGPD)',
    content: `Como titular de dados, você tem os seguintes direitos:\n\n— **Confirmação e acesso:** saber se tratamos seus dados e obter uma cópia.\n— **Correção:** solicitar a atualização de dados incompletos ou desatualizados.\n— **Exclusão:** solicitar a remoção dos seus dados, salvo obrigações legais.\n— **Portabilidade:** receber seus dados em formato estruturado.\n— **Revogação do consentimento:** a qualquer momento, para os dados tratados com base em consentimento.\n\nPara exercer seus direitos, envie um e-mail para contato@letstrain.com.br. Respondemos em até 15 dias úteis.`,
  },
  {
    title: '8. Segurança',
    content: `Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo criptografia em trânsito (TLS), autenticação segura, controle de acesso por RLS (Row Level Security) no banco de dados e armazenamento de senhas com hash seguro.\n\nApesar dos nossos esforços, nenhum sistema é 100% inviolável. Em caso de incidente de segurança que afete seus dados, você será notificado conforme exigido pela LGPD.`,
  },
  {
    title: '9. Cookies e rastreamento',
    content: `Utilizamos apenas cookies estritamente necessários para manter sua sessão autenticada. Não utilizamos cookies de rastreamento, publicidade ou analytics de terceiros.`,
  },
  {
    title: '10. Menores de idade',
    content: `A Lets Train é destinada a pessoas com 18 anos ou mais. Não coletamos dados de menores de idade. Se identificarmos que um menor cadastrou-se na plataforma, sua conta será encerrada e os dados excluídos.`,
  },
  {
    title: '11. Alterações nesta política',
    content: `Podemos atualizar esta Política de Privacidade periodicamente. Quando fizermos alterações relevantes, você será notificado por e-mail ou pelo aplicativo com antecedência mínima de 15 dias.`,
  },
  {
    title: '12. Contato',
    content: `Para dúvidas, solicitações ou reclamações relacionadas à privacidade dos seus dados:\n\n**E-mail:** contato@letstrain.com.br\n\nVocê também pode registrar reclamações junto à Autoridade Nacional de Proteção de Dados (ANPD): www.gov.br/anpd`,
  },
]

function renderContent(text: string) {
  const parts = text.split('\n\n')
  return parts.map((part, i) => {
    const formatted = part.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />')
    return (
      <p
        key={i}
        className="text-sm text-white/55 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    )
  })
}

export default function PrivacidadePage() {
  const lastUpdate = '07 de março de 2026'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-black text-lg tracking-tight">
            <span className="text-[#FF8C00]">LETS</span> TRAIN
          </Link>
          <Link href="/" className="text-sm text-white/40 hover:text-white transition-colors">
            ← Voltar
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <p className="text-xs text-[#FF8C00] uppercase tracking-widest font-semibold">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-black">Política de Privacidade</h1>
          <p className="text-sm text-white/30">Última atualização: {lastUpdate}</p>
          <p className="text-sm text-white/50 leading-relaxed max-w-2xl">
            Esta Política descreve como a Lets Train coleta, usa e protege seus dados pessoais,
            em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).
          </p>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-8">
          {SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <h2 className="text-base font-bold text-white">{section.title}</h2>
              <div className="flex flex-col gap-3">
                {renderContent(section.content)}
              </div>
            </div>
          ))}
        </div>

        {/* Footer nav */}
        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/termos" className="text-sm text-[#FF8C00] hover:underline">
            Ver Termos de Uso →
          </Link>
          <Link href="/" className="text-sm text-white/30 hover:text-white transition-colors">
            Voltar à página inicial
          </Link>
        </div>
      </div>
    </div>
  )
}
