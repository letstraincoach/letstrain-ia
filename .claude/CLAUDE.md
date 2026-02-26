# Synkra AIOS — Project Instructions

## Constitution

Este projeto segue a Synkra AIOS Constitution v1.0.0.
Princípios fundamentais: CLI First, Agent Authority, Story-Driven Development, No Invention, Quality First, Absolute Imports.
Para detalhes completos, consulte `.aios-core/constitution.md`.

## Framework vs Project Boundary

- `.aios-core/` — Framework AIOS (não modificar diretamente)
- `src/` — Código do projeto (desenvolvido aqui)
- `.claude/` — Configurações do IDE e agentes
- `docs/` — Documentação do projeto

**Regra:** Nunca modifique arquivos dentro de `.aios-core/` diretamente. Use os comandos CLI do AIOS para gestão do framework.

## Sistema de Agentes

Este projeto utiliza o sistema de agentes AIOS:

| Agente | Responsabilidade |
|--------|-----------------|
| @dev | Desenvolvimento de código |
| @qa | Qualidade e testes |
| @architect | Decisões arquiteturais |
| @devops | Git push, PRs, releases |
| @pm / @po | Gestão de produto e stories |
| @sm | Scrum Master |

### Comandos Úteis

- `@dev` — Iniciar desenvolvimento
- `@qa` — Executar validação de qualidade
- `@architect` — Consultar arquitetura
- `@pm *create-story` — Criar nova story
- `@aios-master *help` — Ajuda geral
