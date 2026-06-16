// ─── Rota: POST /api/score ────────────────────────────────────────
// Recebe os dados de um perfil e devolve o Liqr Score calculado

import { Router } from 'express'
import { z } from 'zod'
import { calculateLiqrScore, applyFilters } from '../services/liqrScore.js'

const router = Router()

// Schema de validação com Zod
const ProfileSchema = z.object({
  monthlyIncome:   z.number().min(0),
  appearanceScore: z.number().min(1).max(10),
  lifestyle:       z.enum(['modesto', 'básico', 'premium', 'luxo']),
  hasOwnHome:      z.boolean(),
  hasChildren:     z.boolean(),
  educationLevel:  z.number().min(1).max(5),
})

const FiltersSchema = z.object({
  profiles:      z.array(ProfileSchema),
  minIncome:     z.number().min(0),
  minAppearance: z.number().min(1).max(10),
})

// ─── POST /api/score ──────────────────────────────────────────────
// Calcula o score de um perfil individual
router.post('/', (req, res) => {
  const result = ProfileSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: result.error.flatten().fieldErrors,
    })
  }

  const score = calculateLiqrScore(result.data)
  return res.json(score)
})

// ─── POST /api/score/filter ───────────────────────────────────────
// Aplica filtros a uma lista de perfis
router.post('/filter', (req, res) => {
  const result = FiltersSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: result.error.flatten().fieldErrors,
    })
  }

  const { profiles, minIncome, minAppearance } = result.data
  const filtered = applyFilters(profiles, minIncome, minAppearance)
  return res.json(filtered)
})

export default router