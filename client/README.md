# Liqr

> Uma app de dating que torna explícito o que as plataformas reais ocultam.

Liqr é um projecto de crítica social interactiva construído como app de dating funcional. 

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 15 + TypeScript |
| Backend | Node.js + Express |
| IA (gratuita) | Groq (Llama 3.3 70B) + Gemini 2.0 Flash |
| Validação | Zod |
| Estilos | Tailwind CSS |

---

## Estrutura

```
liqr/
├── server/
│   └── src/
│       ├── index.js          ← Express server
│       ├── routes/           ← API endpoints
│       └── services/         ← lógica de negócio + IA
└── client/
    └── src/
        ├── app/              ← páginas Next.js (App Router)
        ├── components/       ← componentes reutilizáveis
        └── hooks/            ← custom hooks
```

---

## Começar

```bash
# Clona o repositório
git clone https://github.com/[username]/liqr
cd liqr

# Instala dependências do servidor
cd server && npm install

# Instala dependências do cliente
cd ../client && npm install

# Configura variáveis de ambiente
cd ../server
cp .env.example .env
# Preenche GROQ_API_KEY (gratuito em https://console.groq.com)

# Corre em desenvolvimento
# Terminal 1 — backend:
cd server && npm run dev

# Terminal 2 — frontend:
cd client && npm run dev
```

---

## Progresso

- [x] Dia 1 — Setup inicial (Next.js + Express)
- [ ] Dia 2 — Algoritmo de scoring
- [ ] Dia 3 — Testes unitários
- [ ] Dia 4 — Rota de scoring
- [ ] Dia 5 — Integração Groq
- [ ] Dia 6 — Personas de IA
- [ ] Dia 7 — Detecção de fenómenos
- [ ] Dia 8 — Frontend Next.js
- [ ] Dia 9 — Chat funcional
- [ ] Dia 10 — Deploy

---

## Funcionalidades

- **Swipe com gestos** — arrastar perfis com física real
- **Chat com IA** — cada perfil tem uma persona distinta, em português europeu
- **Detecção de fenómenos** — chatfishing, pig butchering, ghostlighting, bio-baiting
- **Liqr Score** — algoritmo de scoring com pesos explícitos e comentados
- **Espelho final** — relatório personalizado baseado no comportamento da sessão

---


## Fenómenos documentados

| Fenómeno | Descrição |
|---|---|
| **Pig butchering** | Escalação automática para scam após 3 mensagens |
| **Chatfishing** | Detecção de mensagens geradas por IA |
| **Bio-baiting** | Perfil muito mais impressionante do que a realidade |
| **Ghostlighting** | Desaparecer e reaparecer negando o desaparecimento |

---

## Contexto crítico

Este projecto é uma obra de crítica social. Os dados usados são reais:

- $1,3 mil milhões perdidos em romance scams em 2024 (FTC)
- 61% dos utilizadores foram ghostados em 2025
- Homens com carro de luxo no perfil recebem 3× mais matches
- Mulheres com altos rendimentos recebem 58% menos mensagens

**Liqr** — obra de crítica social interactiva.