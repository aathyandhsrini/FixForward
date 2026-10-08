import { spawn } from 'node:child_process'

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const children = [
  spawn(npmCommand, ['run', 'client'], { stdio: 'inherit' }),
  spawn(process.execPath, ['--watch', 'server/index.js'], { stdio: 'inherit' }),
]

function stop(exitCode = 0) {
  for (const child of children) child.kill('SIGTERM')
  process.exit(exitCode)
}

for (const child of children) {
  child.on('error', (error) => {
    console.error(error.message)
    stop(1)
  })
  child.on('exit', (code, signal) => {
    if (signal !== 'SIGTERM' && code) stop(code)
  })
}

process.on('SIGINT', () => stop())
process.on('SIGTERM', () => stop())
