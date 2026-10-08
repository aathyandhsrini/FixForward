# FixForward

FixForward helps people repair clothing, backpacks, and simple furniture instead of throwing them away. A user uploads a photo, describes the damage, and receives either relevant follow-up questions or a structured repair guide.

The AI runs locally through Ollama, so FixForward needs no API key, account, API credits, or per-request payment. The app is intentionally cautious: it separates visible evidence from uncertainty and refuses to provide electrical, battery, gas, fuel, or structural repair instructions.

## What is included

- React + Vite frontend in JavaScript
- Node.js + Express backend
- Local Ollama image analysis using the `gemma3:4b` vision model
- JSON-schema-constrained repair guides
- Photo preview, drag-and-drop upload, and client/server validation
- One-round follow-up question flow
- Tools, numbered steps, progress checkboxes, time, difficulty, success checks, and reuse ideas
- Clear local-model setup, loading, and error states
- A separate labeled sample demo that never claims to be AI analysis
- Mobile layouts and accessible labels, focus states, and status messages

No account, payment system, API key, or database is used.

## First-time setup on macOS

1. Download and install [Ollama for macOS](https://ollama.com/download).
2. Open the **Ollama** application. Its llama icon should appear in the macOS menu bar.
3. Open the `fixforward` folder in VS Code.
4. Choose **Terminal → New Terminal**.
5. Install the project packages:

   ```bash
   npm install
   ```

6. Download the local vision model (about 3.3 GB):

   ```bash
   npm run model:pull
   ```

7. Start FixForward:

   ```bash
   npm run dev
   ```

8. Open [http://127.0.0.1:5173](http://127.0.0.1:5173).

Keep Ollama and the VS Code terminal open while using FixForward. The first analysis after launch can take longer while the model loads into memory.

## Environment variables

The defaults work without a `.env` file. Copy `.env.example` to `.env` only if you need to change them.

| Name | Required | Purpose |
| --- | --- | --- |
| `OLLAMA_URL` | No | Ollama address; defaults to `http://127.0.0.1:11434` |
| `OLLAMA_MODEL` | No | Local vision model; defaults to `gemma3:4b` |
| `PORT` | No | Local API port; defaults to `3001` |
| `CLIENT_ORIGIN` | No | Allowed local frontend origin |

An old `OPENAI_API_KEY` entry is ignored and can be safely deleted from `.env`.

## Useful commands

```bash
npm run dev          # frontend and backend together
npm run model:pull   # download the local vision model
npm run client       # frontend only
npm run server       # backend only
npm test             # safety and local-AI request tests
npm run build        # production frontend build
npm start            # production-style Node API
```

## Privacy and safety

- Photos and descriptions are sent only from FixForward's Node server to Ollama on this computer.
- Uploaded images are held in memory and are not stored by FixForward.
- The server screens high-risk keywords before contacting the model.
- Local AI output can still be wrong. Stop when the damage differs from the guide or the repair feels unsafe.
- Higher-risk repairs are directed to an appropriate qualified professional.

## Deployment note

The local Ollama model cannot run inside a normal Vercel serverless function. Vercel can host the interface and sample demo, but live image analysis requires an always-on computer or server running Ollama. For a free hackathon demonstration, run the complete app locally and present it from `http://127.0.0.1:5173`.

If you later need a public deployment, host the Node backend and Ollama together on a machine with enough memory, set `OLLAMA_URL` to that private service, and add authentication, TLS, rate limiting, and a reviewed privacy notice before exposing it to users.

For a temporary public demo link, build and start the app, then point a Cloudflare Quick Tunnel at port `3001`. The link remains active only while your Mac, Ollama, FixForward, and the tunnel are running.

## Local AI references

- [Ollama vision documentation](https://docs.ollama.com/capabilities/vision)
- [Ollama structured outputs](https://docs.ollama.com/capabilities/structured-outputs)
- [`gemma3:4b` model information](https://ollama.com/library/gemma3:4b)
