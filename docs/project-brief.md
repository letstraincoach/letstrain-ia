# Project Brief — Coach Lets Train IA

## Versão
| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 2026-02-26 | 1.0 | Versão inicial | Orion (AIOS) |

---

## 1. Problema

### Dor 1 — Academia de Condomínio
Academias de condomínio têm baixa adesão. Os moradores não utilizam o espaço porque:
- Os equipamentos foram comprados sem critério técnico
- Não existe orientação ou metodologia disponível
- As pessoas não sabem montar um treino com progressão real
- Contratar um personal trainer exclusivo custa caro demais (R$80–250/hora)

### Dor 2 — Academia Convencional
Mesmo quem paga mensalidade de academia fica desamparado:
- Professores sobrecarregados dão pouca ou nenhuma atenção individual
- O aluno recebe um treino genérico e nunca mais é acompanhado
- Sem metodologia, sem progressão, sem resultado — e sem motivo para continuar

### Raiz comum das duas dores
**A falta de um personal trainer dedicado, acessível e que entenda o seu contexto.**

---

## 2. Solução

**Coach Lets Train IA** é um aplicativo de coaching de treino personalizado por inteligência artificial, baseado na metodologia Time Efficient da Lets Train.

O app entrega **treinos diários personalizados** considerando:
- O perfil físico e objetivos do usuário (anamnese)
- O nível atual de condicionamento (5 níveis: Adaptação → PRO)
- O local de treino e equipamentos disponíveis
- O contexto do dia (tempo disponível, última refeição, disposição)

### Por que é diferente
- Não é um treino genérico — é gerado por IA no momento, para aquela pessoa, naquele dia
- Funciona tanto para academia de condomínio (equipamentos limitados) quanto para academia convencional
- Custo ~10x menor que um personal trainer particular
- Mais barato que a mensalidade de uma academia convencional

---

## 3. Usuários Alvo

### Usuário Primário — Morador de Condomínio
- 25–50 anos
- Tem academia no prédio mas não usa por falta de orientação
- Nunca teve personal trainer ou parou de treinar há mais de 6 meses
- Quer resultado mas não tem tempo nem dinheiro para academia premium

### Usuário Secundário — Aluno de Academia Convencional
- 20–45 anos
- Paga mensalidade mas treina "por conta"
- Tem treino genérico ou nenhum acompanhamento real
- Quer evolução e metodologia sem depender de professor disponível

---

## 4. Proposta de Valor

| | Personal Trainer | Academia Premium | **Coach Lets Train IA** |
|---|---|---|---|
| **Custo/mês** | R$800–2.000 | R$150–300 | **R$29,90** |
| **Personalização** | Alta | Baixa | **Alta (IA + contexto diário)** |
| **Disponibilidade** | Horário fixo | Horário fixo | **24/7** |
| **Metodologia** | Variável | Variável | **Lets Train (Time Efficient)** |
| **Progressão** | Manual | Raramente | **Automática por nível** |
| **Contexto diário** | Sim | Não | **Sim (mood, tempo, refeição)** |

---

## 5. Jornada do Usuário (7 Etapas)

```
[1. Anamnese] → [2. Nível Definido pela IA] → [3. Escolha do Local]
     → [4. Equipamentos Mapeados] → [5. Check-in Diário]
          → [6. Treino Entregue] → [7. Avaliação Pós-Treino]
```

**Etapa 1 — Anamnese (Quiz Inicial)**
Coleta: peso, idade, altura, tempo sem treinar, doenças cardíacas, lesões crônicas, medicamentos controlados, objetivo principal (perda de peso / ganho de massa / qualidade de vida), dias por semana disponíveis, preferência de treino (isolados / grupos musculares / superiores+inferiores).

**Etapa 2 — Definição do Nível pela IA**
Com base na anamnese, o sistema classifica o usuário em:
- **Adaptação** — menos de 6 meses sem treinar / sedentário total
- **Iniciante** — alguma base, pouca experiência
- **Intermediário** — treina regularmente há mais de 6 meses
- **Avançado** — treina há mais de 2 anos com consistência
- **PRO** — atleta, treino de alta performance

**Etapa 3 — Escolha do Local de Treino**
- Academia de Condomínio
- Academia Convencional

**Etapa 4 — Mapeamento de Equipamentos**
- Condomínio: usuário envia fotos → IA detecta os aparelhos disponíveis
- Academia convencional: lista padrão pré-definida + opção de adicionar com foto

**Etapa 5 — Check-in Diário (Interação antes do Treino)**
- Qual o horário da sua última refeição?
- Quanto tempo você tem para treinar hoje?
- De 1 a 10, qual sua disposição hoje?

**Etapa 6 — Entrega do Treino**
- Tela intuitiva com arte visual do treino
- Exercícios com séries, repetições e tempo de descanso
- Botão para abrir vídeo no YouTube de cada exercício

**Etapa 7 — Avaliação Pós-Treino**
- Rating de como foi o treino
- Feedback para calibração da IA
- Registro no histórico + progresso para o próximo nível

---

## 6. Sistema de Progressão

- Cada nível exige um número X de treinos executados
- O sistema rastreia automaticamente via "Scout"
- Sistema de recompensas por conquistas (badges, streaks, marcos)
- Não rastreia carga — o usuário treina no peso que se sentir seguro
- **5 níveis no MVP**, expansão para 7 na próxima versão

---

## 7. Modelo de Negócio

- **B2C — Assinatura mensal**: R$29,90/mês
- **Desconto anual**: pagamento único via PIX com desconto
- **Aquisição**: tráfego pago segmentado para ambos os públicos (testes A/B por segmento)
- **Funil**: sem trial gratuito no MVP — freemium pode ser considerado futuramente

---

## 8. Escopo do MVP

### Incluso
- Onboarding completo (anamnese + nível + local + equipamentos)
- Geração de treino diário por IA (Claude API)
- Detecção de equipamentos por imagem (academia de condomínio)
- Check-in diário contextual
- Tela de treino com vídeos YouTube
- Sistema de níveis e progressão automática
- Avaliação pós-treino
- Histórico de treinos
- Autenticação (email + Google)
- Pagamento (mensal + anual PIX)
- Push notifications (lembretes de treino)

### Fora do MVP
- App nativo iOS/Android (fase 2)
- Níveis 6 e 7 (fase 2)
- Painel admin para condomínios (fase 3)
- Integração direta com academias (fase 3)
- Treinos ao vivo / vídeos próprios (fase 3)
- Social features (fase 3)

---

## 9. Métricas de Sucesso

- **Ativação**: % de usuários que completam o onboarding e fazem o 1º treino
- **Retenção D7/D30**: % que treinam na semana 1 e no mês 1
- **Churn mensal**: cancelamentos por mês
- **NPS**: satisfação com o treino gerado
- **Evolução de nível**: % de usuários que sobem de nível em 30 dias

---

## 10. Riscos e Mitigações

| Risco | Mitigação |
|---|---|
| IA gera treino inadequado para limitações físicas | Anamnese detalhada + avisos de segurança |
| Usuário não consegue identificar equipamentos pela foto | Lista fallback manual sempre disponível |
| Custo alto de API de IA por usuário | Cache de treinos similares + otimização de prompts |
| Baixa adesão após onboarding | Push notifications + streak/gamificação |
