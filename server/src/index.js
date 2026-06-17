// ─── Liqr Server ─────────────────────────────────────────────────

import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import scoreRouter from './routes/score.js'
import chatRouter  from './routes/chat.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}))

app.use(express.json())

app.use((req, _res, next) => {
  console.log(`${new Date().toLocaleTimeString()} ${req.method} ${req.path}`)
  next()
})

// ─── Routes ───────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'liqr',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/score', scoreRouter)
app.use('/api/chat',  chatRouter)

// ─── 404 ──────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

// ─── Error handler ────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Erro interno do servidor' })
})

app.listen(PORT, () => {
  console.log(`\n🔴 Liqr server a correr em http://localhost:${PORT}\n`)
})

export default app