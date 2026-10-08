import test from 'node:test'
import assert from 'node:assert/strict'
import { analyzeWithOllama, getOllamaStatus } from './ollama.js'

test('status reports whether the requested local model is installed', async () => {
  const fetchImpl = async () => new Response(JSON.stringify({ models: [{ name: 'gemma3:4b' }] }), { status: 200 })
  const status = await getOllamaStatus({ fetchImpl, model: 'gemma3:4b' })
  assert.deepEqual(status, { configured: true, running: true, modelInstalled: true, model: 'gemma3:4b' })
})

test('sends the image and repair prompt to Ollama with a JSON schema', async () => {
  let requestBody
  const modelReply = {
    mode: 'questions',
    questions: ['Does the tear go through both fabric layers?'],
    guide: {
      diagnosis: '', uncertainty: '', beginnerSuitable: false, beginnerNote: '', time: '', difficulty: 'Easy',
      tools: [], steps: [], successCheck: '', reuse: [], safetyNote: '',
    },
  }
  const fetchImpl = async (_url, options) => {
    requestBody = JSON.parse(options.body)
    return new Response(JSON.stringify({ message: { content: JSON.stringify(modelReply) } }), { status: 200 })
  }

  const result = await analyzeWithOllama({
    category: 'clothing',
    description: 'The sleeve has a small tear near the seam.',
    answers: [],
    imageBuffer: Buffer.from('test-image'),
    fetchImpl,
    model: 'gemma3:4b',
  })

  assert.equal(result.mode, 'questions')
  assert.equal(requestBody.model, 'gemma3:4b')
  assert.equal(requestBody.stream, false)
  assert.equal(requestBody.format.type, 'object')
  assert.equal(requestBody.messages[1].images[0], Buffer.from('test-image').toString('base64'))
  assert.match(requestBody.messages[1].content, /small tear/)
})

test('returns a clear setup error when Ollama is unavailable', async () => {
  await assert.rejects(
    analyzeWithOllama({
      category: 'clothing', description: 'A seam has opened.', answers: [], imageBuffer: Buffer.from('x'),
      fetchImpl: async () => { throw new TypeError('fetch failed') },
    }),
    (error) => error.code === 'ollama_unavailable' && /not running/i.test(error.message),
  )
})
