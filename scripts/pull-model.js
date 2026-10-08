import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'

const macAppCommand = '/Applications/Ollama.app/Contents/Resources/ollama'
const command = process.platform === 'darwin' && existsSync(macAppCommand) ? macAppCommand : 'ollama'
const child = spawn(command, ['pull', process.env.OLLAMA_MODEL || 'gemma3:4b'], { stdio: 'inherit' })

child.on('error', () => {
  console.error('Ollama was not found. Install it from https://ollama.com/download, open it, and try again.')
  process.exit(1)
})

child.on('exit', (code) => process.exit(code ?? 1))
