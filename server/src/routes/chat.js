// ─── Rota: /api/chat ──────────────────────────────────────────────

import { Router } from 'express'
import { z } from 'zod'
import { sendChatMessage, detectChatfishing, PERSONAS } from '../services/chatService.js'

const router = Router()

const MessageSchema = z.object({
  role:    z.enum(['user', 'assistant']),
  content: z.string(),
})

const ChatSchema = z.object({
  sessionId:   z.string().min(1),
  profileId:   z.string().min(1),
  userMessage: z.string().min(1).max(500),
  history:     z.array(MessageSchema).max(20).default([]),
})

// ─── POST /api/chat ───────────────────────────────────────────────
router.post('/', async (req, res) => {
  const result = ChatSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: result.error.issues,
    })
  }

  const { sessionId, profileId, userMessage, history } = result.data

  if (!PERSONAS[profileId]) {
    return res.status(404).json({ error: `Perfil '${profileId}' não encontrado` })
  }

  try {
    const { reply, isEscalation, phenomenonDetected } = await sendChatMessage({
      sessionId,
      profileId,
      userMessage,
      history,
    })

    const updatedHistory = [...history, { role: 'assistant', content: reply }]
    const heuristics = PERSONAS[profileId].phenomenon === 'chatfishing'
      ? detectChatfishing(updatedHistory)
      : null

    return res.json({
      reply,
      isEscalation,
      phenomenonDetected,
      heuristics,
      showChatfishingAlert: heuristics && heuristics.probability > 60,
      showScamAlert: isEscalation,
    })

  } catch (error) {
    console.error('Chat error:', error)
    return res.status(500).json({ error: 'Serviço temporariamente indisponível' })
  }
})

// ─── GET /api/chat/personas ───────────────────────────────────────
// Lista as personas disponíveis
router.get('/personas', (_req, res) => {
  const personas = Object.entries(PERSONAS).map(([id, p]) => ({
    id,
    phenomenon: p.phenomenon,
  }))
  return res.json(personas)
})

export default router