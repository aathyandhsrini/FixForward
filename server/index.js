import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { allowedCategories, allowedMimeTypes, highRiskReason, professionalGuide } from './repair.js'
import { analyzeWithOllama, getOllamaStatus } from './ollama.js'

const app = express()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024, files: 1 } })
const port = Number(process.env.PORT || 3001)
const distDirectory = fileURLToPath(new URL('../dist/', import.meta.url))

app.disable('x-powered-by')
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }))
app.use(express.json({ limit: '100kb' }))

app.get(['/api/status', '/status'], async (_request, response) => {
  response.json({ provider: 'ollama', ...await getOllamaStatus() })
})

app.post(['/api/analyze', '/analyze'], upload.single('photo'), async (request, response) => {
  try {
    if (!request.file) return response.status(400).json({ message: 'Please upload a photo.' })
    if (!allowedMimeTypes.has(request.file.mimetype)) return response.status(400).json({ message: 'Please upload a JPG, PNG, or WebP image.' })

    const category = String(request.body.category || '')
    const description = String(request.body.description || '').trim()
    if (!allowedCategories.has(category)) return response.status(400).json({ message: 'Choose clothing, backpack, or simple furniture.' })
    if (description.length < 12 || description.length > 600) return response.status(400).json({ message: 'Describe the damage in 12–600 characters.' })

    let answers = []
    if (request.body.answers) {
      try { answers = JSON.parse(request.body.answers) } catch { return response.status(400).json({ message: 'The follow-up answers could not be read.' }) }
      if (!Array.isArray(answers) || answers.length > 3 || answers.some((entry) => typeof entry?.question !== 'string' || typeof entry?.answer !== 'string' || entry.answer.length > 400)) {
        return response.status(400).json({ message: 'The follow-up answers are invalid.' })
      }
    }

    const risk = highRiskReason(description)
    if (risk) return response.json({ mode: 'guide', questions: [], guide: professionalGuide(risk) })

    const parsed = await analyzeWithOllama({
      category,
      description,
      answers,
      imageBuffer: request.file.buffer,
    })
    if (parsed.mode === 'questions' && (!Array.isArray(parsed.questions) || parsed.questions.length === 0)) throw new Error('The AI requested details without supplying questions.')
    return response.json(parsed)
  } catch (error) {
    console.error('FixForward analysis failed:', error?.message || error)
    const setupError = ['ollama_unavailable', 'ollama_model_missing'].includes(error?.code)
    return response.status(setupError ? 503 : 502).json({ code: error?.code, message: error?.message || 'FixForward could not complete the local analysis. Please try again.' })
  }
})

app.use(express.static(distDirectory))
app.get(/^(?!\/api(?:\/|$)).*/, (_request, response) => {
  response.sendFile(path.join(distDirectory, 'index.html'))
})

app.use((error, _request, response, _next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') return response.status(413).json({ message: 'That image is over 4 MB. Please choose a smaller file.' })
  console.error('FixForward server error:', error)
  return response.status(500).json({ message: 'An unexpected server error occurred.' })
})

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isDirectRun) app.listen(port, '127.0.0.1', () => console.log(`FixForward API running at http://127.0.0.1:${port}`))

export default app
