import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const FROM = 'Lets Train <ola@letstrain.com.br>'

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json() as { name: string; email: string }

    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })
    if (!process.env.RESEND_API_KEY) return NextResponse.json({ ok: true }) // sem-op em dev

    const resend = new Resend(process.env.RESEND_API_KEY)
    const firstName = name?.split(' ')[0] ?? 'atleta'

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `${firstName}, seu treino de hoje está pronto 💪`,
      html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao Lets Train</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <tr>
      <td>
        <!-- Logo -->
        <p style="margin:0 0 32px;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
          <span style="color:#FF8C00;">Lets</span> Train
        </p>

        <!-- Hero -->
        <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;line-height:1.2;">
          Bem-vindo, ${firstName}! 🎉
        </h1>
        <p style="margin:0 0 28px;font-size:15px;color:rgba(255,255,255,0.6);line-height:1.6;">
          Seu personal trainer por inteligência artificial está pronto. Seu primeiro treino personalizado será gerado em menos de 3 minutos.
        </p>

        <!-- CTA -->
        <a href="https://letstrain.com.br/dashboard"
           style="display:inline-block;background:#FF8C00;color:#000000;font-weight:700;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:12px;margin-bottom:32px;">
          💪 Gerar meu primeiro treino
        </a>

        <!-- Como funciona -->
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;margin-bottom:28px;">
          <tr><td>
            <p style="margin:0 0 16px;font-size:12px;font-weight:600;color:#FF8C00;text-transform:uppercase;letter-spacing:0.1em;">Como funciona</p>
            <p style="margin:0 0 10px;font-size:14px;color:rgba(255,255,255,0.75);">
              <strong style="color:#fff;">1.</strong> Responda o quiz de onboarding (já feito ✅)
            </p>
            <p style="margin:0 0 10px;font-size:14px;color:rgba(255,255,255,0.75);">
              <strong style="color:#fff;">2.</strong> A IA gera seu treino do dia — 4 blocos, metodologia Time Efficient
            </p>
            <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.75);">
              <strong style="color:#fff;">3.</strong> Execute, avalie e veja sua evolução crescer a cada treino
            </p>
          </td></tr>
        </table>

        <!-- Trial reminder -->
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background:rgba(255,140,0,0.06);border:1px solid rgba(255,140,0,0.15);border-radius:16px;padding:20px;margin-bottom:32px;">
          <tr><td>
            <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#FF8C00;">🎁 Seus 3 dias grátis começaram agora</p>
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.5;">
              Você tem acesso completo até o fim do trial. Nenhuma cobrança antes disso — cancele a qualquer momento sem custo.
            </p>
          </td></tr>
        </table>

        <!-- Footer -->
        <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.25);line-height:1.6;">
          Você recebeu este email porque criou uma conta no Lets Train.<br>
          <a href="https://letstrain.com.br/privacidade" style="color:rgba(255,255,255,0.35);text-decoration:none;">Política de privacidade</a>
          &nbsp;·&nbsp;
          <a href="https://letstrain.com.br/termos" style="color:rgba(255,255,255,0.35);text-decoration:none;">Termos de uso</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    })

    return NextResponse.json({ ok: true })
  } catch {
    // Best-effort — não retorna erro para o cliente
    return NextResponse.json({ ok: true })
  }
}
