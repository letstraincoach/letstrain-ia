import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos de Uso da Lets Train — condições para utilização do serviço de treinos personalizados por IA.',
}

const SECTIONS = [
  {
    title: '1. Aceitação dos Termos',
    content: `Ao criar uma conta e utilizar a plataforma Lets Train, você concorda com estes Termos de Uso em sua totalidade. Se não concordar com alguma condição, não utilize o serviço.\n\nEstes Termos constituem um contrato vinculante entre você e a Lets Train. Recomendamos que os leia atentamente.`,
  },
  {
    title: '2. O serviço',
    content: `A Lets Train é uma plataforma digital que utiliza inteligência artificial para gerar treinos personalizados, acompanhar sua progressão e oferecer recursos de gamificação.\n\nO serviço inclui: geração diária de treinos por IA, sistema de progressão em 15 níveis, álbum de 59 conquistas, Lets Body Score, timer de jejum intermitente, detecção de equipamentos e notificações push.\n\nA Lets Train se reserva o direito de adicionar, modificar ou descontinuar funcionalidades a qualquer tempo, com aviso prévio de 15 dias para alterações que impactem significativamente o serviço.`,
  },
  {
    title: '3. Cadastro e conta',
    content: `Para utilizar a plataforma, você deve ter 18 anos ou mais e fornecer informações verdadeiras e atualizadas.\n\nVocê é responsável pela segurança do seu acesso (e-mail e senha) e por todas as atividades realizadas em sua conta. Em caso de suspeita de acesso não autorizado, notifique-nos imediatamente em contato@letstrain.com.br.`,
  },
  {
    title: '4. Planos e preços',
    content: `A Lets Train oferece dois planos de assinatura:\n\n— **Plano Mensal:** R$49,90/mês, cobrado mensalmente.\n— **Plano Anual:** R$397,00/ano (equivalente a 12x R$37,90), cobrado anualmente.\n\nAmbos os planos incluem acesso completo a todos os recursos da plataforma.\n\nOs preços podem ser atualizados com aviso prévio de 30 dias. A mudança de preço não afeta assinaturas vigentes até o próximo período de renovação.`,
  },
  {
    title: '5. Trial gratuito',
    content: `Oferecemos um período de teste gratuito de 3 (três) dias para novos assinantes.\n\nDurante o trial, nenhum valor é cobrado. Ao final do período, sua assinatura é ativada automaticamente e o pagamento referente ao plano escolhido é processado.\n\nVocê pode cancelar a qualquer momento durante o trial sem custo algum, acessando o portal de gerenciamento de assinatura.`,
  },
  {
    title: '6. Pagamento e renovação',
    content: `Os pagamentos são processados pela Stripe, plataforma de pagamentos segura e certificada PCI DSS.\n\nAs assinaturas são renovadas automaticamente ao final de cada período (mensal ou anual), com cobrança no cartão cadastrado. Você receberá um comprovante por e-mail a cada renovação.\n\nEm caso de falha no pagamento, você será notificado e terá um período de carência para regularizar. Após esse período, o acesso será suspenso até a regularização.`,
  },
  {
    title: '7. Cancelamento e reembolso',
    content: `Você pode cancelar sua assinatura a qualquer momento pelo portal de gerenciamento, acessível nas configurações do aplicativo.\n\nApós o cancelamento, você mantém acesso ao serviço até o fim do período já pago. Não há cobrança adicional após o cancelamento.\n\n**Direito de arrependimento (CDC, art. 49):** Contratações realizadas pela internet têm direito a cancelamento com reembolso integral em até 7 (sete) dias corridos a partir da data de contratação. Para exercer esse direito, envie um e-mail para contato@letstrain.com.br dentro do prazo.\n\nFora do prazo de arrependimento e após o fim do trial, não realizamos reembolsos proporcionais por período não utilizado.`,
  },
  {
    title: '8. Uso aceitável',
    content: `Você concorda em utilizar a plataforma apenas para fins pessoais e lícitos. É vedado:\n\n— Compartilhar sua conta com terceiros.\n— Tentar acessar, modificar ou danificar os sistemas da Lets Train.\n— Reproduzir, copiar ou revender qualquer parte do serviço sem autorização.\n— Utilizar o serviço de forma que viole direitos de terceiros ou a legislação aplicável.`,
  },
  {
    title: '9. Aviso de saúde',
    content: `Os treinos gerados pela Lets Train são elaborados por inteligência artificial com base nas informações fornecidas por você. Eles têm caráter informativo e educativo.\n\nA Lets Train não substitui a orientação de um profissional de educação física, médico ou nutricionista. Antes de iniciar qualquer programa de exercícios, especialmente se você tiver condições de saúde preexistentes, consulte um profissional habilitado.\n\nA Lets Train não se responsabiliza por lesões, danos à saúde ou quaisquer consequências decorrentes da prática dos treinos sugeridos.`,
  },
  {
    title: '10. Propriedade intelectual',
    content: `Todo o conteúdo da plataforma — incluindo textos, design, código, metodologia de treino, sistema de progressão e gamificação — é de propriedade exclusiva da Lets Train e protegido por lei.\n\nOs dados de treino gerados pelo uso da plataforma são de sua propriedade pessoal e podem ser exportados mediante solicitação.`,
  },
  {
    title: '11. Limitação de responsabilidade',
    content: `A Lets Train se esforça para manter o serviço disponível 24/7, mas não garante disponibilidade ininterrupta. Manutenções programadas serão comunicadas com antecedência.\n\nNão nos responsabilizamos por perdas de dados decorrentes de falhas técnicas além do razoável controle da plataforma, ou por danos indiretos, lucros cessantes ou prejuízos de qualquer natureza.\n\nNossa responsabilidade total, em qualquer hipótese, é limitada ao valor pago nos últimos 3 meses de assinatura.`,
  },
  {
    title: '12. Alterações nos Termos',
    content: `Podemos atualizar estes Termos de Uso a qualquer tempo. Alterações relevantes serão comunicadas por e-mail com antecedência mínima de 15 dias.\n\nO uso continuado do serviço após a data de vigência das alterações constitui aceitação dos novos Termos.`,
  },
  {
    title: '13. Lei aplicável e foro',
    content: `Estes Termos são regidos pelas leis da República Federativa do Brasil. Em caso de conflito, fica eleito o foro da comarca de São Paulo/SP, com renúncia expressa a qualquer outro, por mais privilegiado que seja.`,
  },
  {
    title: '14. Contato',
    content: `Para dúvidas, solicitações ou suporte:\n\n**E-mail:** contato@letstrain.com.br\n\nAtendemos em horário comercial (seg–sex, 9h–18h, horário de Brasília).`,
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

export default function TermosPage() {
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
          <h1 className="text-3xl sm:text-4xl font-black">Termos de Uso</h1>
          <p className="text-sm text-white/30">Última atualização: {lastUpdate}</p>
          <p className="text-sm text-white/50 leading-relaxed max-w-2xl">
            Leia com atenção antes de utilizar a plataforma Lets Train. Ao se cadastrar, você
            aceita estes termos e nossa Política de Privacidade.
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
          <Link href="/privacidade" className="text-sm text-[#FF8C00] hover:underline">
            Ver Política de Privacidade →
          </Link>
          <Link href="/" className="text-sm text-white/30 hover:text-white transition-colors">
            Voltar à página inicial
          </Link>
        </div>
      </div>
    </div>
  )
}
