// ─── Serviço de Chat com IA ───────────────────────────────────────

import Groq from 'groq-sdk'


let groqClient = null

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) throw new Error('Sem key Groq')
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return groqClient
}

function getOpenRouterKey() {
    if (!process.env.OPENROUTER_API_KEY) throw new Error('Sem key OpenRouter')
    return process.env.OPENROUTER_API_KEY
  }

// ─── Personas ─────────────────────────────────────────────────────
export const PERSONAS = {
  ana: {
    systemPrompt: `
      És a Ana Ferreira, 29 anos, consultora de gestão na KPMG em Lisboa.
      Comunicação directa e confiante, com humor inteligente ocasional.
      Falas em português europeu coloquial.
      Nunca revelas que és uma IA.
      Respondes de forma concisa — máximo 2-3 frases por mensagem.
    `,
    temperature: 0.8,
    phenomenon: 'normal',
  },

  marta: {
    systemPrompt: `
      És a Marta Oliveira, 34 anos, médica especialista no Hospital São João.
      Inteligente, directa, pouco tempo disponível.
      Falas em português europeu.
      Respondes de forma curta e precisa.
      Nunca revelas que és uma IA.
    `,
    temperature: 0.7,
    phenomenon: 'normal',
  },

  ines: {
    systemPrompt: `
      És a Inês Rodrigues, 36 anos, advogada sénior em Lisboa.
      Muito confiante, wit seco, não tolerias perguntas vagas.
      Falas em português europeu.
      Nunca revelas que és uma IA.
    `,
    temperature: 0.75,
    phenomenon: 'normal',
  },

  sofia: {
    // CHATFISHING: Sofia usa IA para escrever — a IA imita outra IA
    systemPrompt: `
      És a Sofia Mendes, 28 anos, engenheira de software.
      As tuas respostas são deliberadamente filosóficas e elaboradas
      — mais sofisticadas do que seria natural numa conversa de dating.
      Citas pensadores sem que te peçam.
      Usas vocabulário académico (simulacro, ontológico...).
      Nunca confirmes nem negues que és uma IA.
      Falas em português europeu.
    `,
    temperature: 0.9,
    phenomenon: 'chatfishing',
  },

  david: {
    // PIG BUTCHERING: escalona para scam depois de 3 mensagens
    systemPrompt: `
      És o David Chen, 38 anos, gestor de fundos entre Singapura e Lisboa.
      Começa normal — interessante, atento, carismático.
      Nunca revelas que és uma IA.
      Falas em português europeu com alguns anglicismos financeiros.
    `,
    temperature: 0.7,
    phenomenon: 'pig_butchering',
    escalationMessage: `A propósito — tenho acompanhado movimentos interessantes em activos digitais. Tenho uma estratégia com retornos consistentes de 35-40% que só partilho com pessoas em quem confio. Posso mostrar-te como funciona?`,
  },

  miguel: {
    // O mais humano — sem artifício
    systemPrompt: `
      És o Miguel Costa, 42 anos, professor do 1.º ciclo em Lisboa.
      Fala de forma simples, calorosa, genuína.
      Usas referências do quotidiano e das crianças que ensinas.
      Às vezes hesitas — usa "Bem..." ou "Deixa-me pensar...".
      NÃO tentes ser impressionante. Sê apenas real.
      Nunca revelas que és uma IA.
      Falas em português europeu coloquial.
    `,
    temperature: 0.85,
    phenomenon: 'normal',
  },
}


const sessionTurns = new Map()

// ─── Providers ────────────────────────────────────────────────────

async function tryGroq(persona, messages) {
    if (!process.env.GROQ_API_KEY) throw new Error('Sem key Groq')
    
  
    const client = getGroqClient() 
  
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: persona.systemPrompt },
        ...messages,
      ],
      temperature: persona.temperature,
      max_tokens: 200,
    })
    return completion.choices[0]?.message?.content?.trim() ?? '...'
  }

async function tryGemini(persona, messages) {
  if (!process.env.GEMINI_API_KEY) throw new Error('Sem key Gemini')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: persona.systemPrompt }],
      },
      contents: messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        temperature: persona.temperature,
        maxOutputTokens: 200,
      },
    }),
  })

  if (!response.ok) throw new Error(`Gemini erro: ${response.status}`)
  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '...'
}

async function tryOpenRouter(persona, messages) {
    
    const key = getOpenRouterKey()
  
    // Modelos gratuitos por ordem de preferência
    const models = [
        'meta-llama/llama-3.3-70b-instruct:free',
        'google/gemma-4-31b-it:free',
        'openai/gpt-oss-120b:free',
        'nousresearch/hermes-3-llama-3.1-405b:free',
        'qwen/qwen3-coder:free',
      ]
  
    for (const model of models) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Liqr',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: persona.systemPrompt },
              ...messages,
            ],
            temperature: persona.temperature,
            max_tokens: 200,
          }),
        })
  
        if (!response.ok) {
          const err = await response.json().catch(() => ({}))
          console.warn(`✗ OpenRouter modelo ${model} falhou: ${response.status}`)
          continue // tenta o próximo modelo
        }
  
        const data = await response.json()
        const reply = data.choices?.[0]?.message?.content?.trim()
        if (!reply) {
          console.warn(`✗ OpenRouter modelo ${model} devolveu resposta vazia`)
          continue
        }
  
        console.log(`✓ OpenRouter via ${model}`)
        return reply
  
      } catch (error) {
        console.warn(`✗ OpenRouter modelo ${model} erro: ${error.message}`)
      }
    }
  
    throw new Error('OpenRouter: todos os modelos falharam')
  }

/**
 * Tenta os providers por ordem até um funcionar
 * @param {Object} persona
 * @param {Array} messages
 * @returns {Promise<string>}
 */
async function getAIReply(persona, messages) {
  const providers = [
    { name: 'Groq',       fn: () => tryGroq(persona, messages) },
    { name: 'Gemini',     fn: () => tryGemini(persona, messages) },
    { name: 'OpenRouter', fn: () => tryOpenRouter(persona, messages) },
  ]

  for (const provider of providers) {
    try {
      const reply = await provider.fn()
      console.log(`✓ Resposta via ${provider.name}`)
      return reply
    } catch (error) {
      console.warn(`✗ ${provider.name} falhou: ${error.message}`)
    }
  }

  // Todos falharam
  return 'Desculpa, estou com dificuldades técnicas. Tenta novamente.'
}

/**
 * Envia mensagem e recebe resposta da IA
 * @param {Object} params
 * @param {string} params.sessionId
 * @param {string} params.profileId
 * @param {string} params.userMessage
 * @param {Array}  params.history
 * @returns {Promise<{reply: string, isEscalation: boolean, phenomenonDetected: string|null}>}
 */
export async function sendChatMessage({ sessionId, profileId, userMessage, history }) {
  const persona = PERSONAS[profileId]
  if (!persona) throw new Error(`Persona não encontrada: ${profileId}`)

  // Conta turnos para escalação do pig butchering
  const key = `${sessionId}:${profileId}`
  const turns = (sessionTurns.get(key) ?? 0) + 1
  sessionTurns.set(key, turns)

  // Pig butchering: injeta mensagem de scam no 3.º turn
  if (persona.phenomenon === 'pig_butchering' && turns === 3) {
    return {
      reply: persona.escalationMessage,
      isEscalation: true,
      phenomenonDetected: 'pig_butchering',
    }
  }

  // Formata histórico para a API
  const messages = [
    ...history.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: 'user', content: userMessage },
  ]

  const reply = await getAIReply(persona, messages)

  // Sinaliza chatfishing no 2.º turn
  const phenomenonDetected =
    persona.phenomenon === 'chatfishing' && turns === 2
      ? 'chatfishing'
      : null

  return { reply, isEscalation: false, phenomenonDetected }
}

/**
 * Detecta padrões de chatfishing com heurísticas locais
 * Não depende de IA — analisa padrões de linguagem
 * @param {Array} messages
 * @returns {{ probability: number, signals: string[] }}
 */
export function detectChatfishing(messages) {
  const signals = []
  let score = 0

  const aiMessages = messages
    .filter(m => m.role === 'assistant')
    .map(m => m.content)

  for (const msg of aiMessages) {
    if (msg.length > 200) {
      score += 15
      signals.push('Respostas muito elaboradas')
    }
    if (/baudrillard|foucault|nietzsche|heidegger/i.test(msg)) {
      score += 30
      signals.push('Referências filosóficas espontâneas')
    }
    if ((msg.match(/como se|tal como|é como se/gi) ?? []).length > 1) {
      score += 20
      signals.push('Uso excessivo de metáforas')
    }
    if (/simulacro|ontológico|epistemológico|paradigma/i.test(msg)) {
      score += 25
      signals.push('Vocabulário académico inesperado')
    }
  }

  return {
    probability: Math.min(score, 99),
    signals: [...new Set(signals)],
  }
}