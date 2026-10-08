import { useEffect, useRef, useState } from 'react'

const categories = [
  { id: 'clothing', icon: '✦', name: 'Clothing', note: 'Tears, buttons & seams' },
  { id: 'backpack', icon: '▣', name: 'Backpacks', note: 'Straps, zippers & fabric' },
  { id: 'furniture', icon: '⌂', name: 'Simple furniture', note: 'Joints, scratches & wobble' },
]

const sampleGuide = {
  diagnosis: 'The sample backpack’s shoulder-strap seam appears to have opened along the top edge. The fabric itself looks intact in this example, but a real photo might reveal additional wear.',
  uncertainty: 'This is a labeled sample, not an analysis of your item. A real assessment depends on the photo and details you provide.',
  beginnerSuitable: true,
  beginnerNote: 'A beginner who can thread a needle can try this repair.',
  time: '25–40 minutes',
  difficulty: 'Easy',
  tools: ['Strong polyester thread', 'Hand-sewing needle', 'Small scissors', 'Pins or clips', 'Optional thimble'],
  steps: [
    'Empty the backpack and clean loose dirt from the damaged seam.',
    'Tuck the raw fabric edge back into its original position and hold it with clips.',
    'Thread the needle, double the thread, and tie a secure knot at the end.',
    'Starting 1 cm before the opening, make short backstitches through both fabric layers.',
    'Continue 1 cm beyond the opening, then knot the thread securely and trim the excess.',
  ],
  successCheck: 'Gently pull the strap in several directions. The seam should stay flat with no widening gap or loose stitches. Test with a light load before normal use.',
  reuse: ['Save usable buckles and zipper pulls if the bag cannot be repaired.', 'Offer clean fabric panels to a local textile-reuse or craft group.'],
  safetyNote: 'Stop if the strap fabric is badly frayed or the attachment carries heavy loads; a luggage or shoe-repair professional can reinforce it safely.',
}

function Header() {
  return <header className="topbar">
    <button className="brand brand-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="FixForward home">
      <span className="brand-mark" aria-hidden="true">↗</span><span>FixForward</span>
    </button>
    <div className="impact-pill"><span aria-hidden="true">●</span> Built for ImpactHack 2026</div>
  </header>
}

function Intro({ onSample }) {
  return <section className="hero" aria-labelledby="hero-title">
    <div className="hero-copy">
      <p className="eyebrow">Repair more · Waste less</p>
      <h1 id="hero-title">Give everyday things<br/><em>another chapter.</em></h1>
      <p className="hero-intro">Share a photo of what’s broken. FixForward uses AI to understand the damage and build a practical repair plan you can actually follow.</p>
      <div className="hero-actions">
        <a className="hero-button" href="#repair-form">Start a repair <span aria-hidden="true">↓</span></a>
        <button className="sample-link" onClick={onSample}>Preview labeled sample</button>
      </div>
      <div className="trust-row" aria-label="FixForward benefits"><span><b>01</b> Clear guidance</span><span><b>02</b> Honest uncertainty</span><span><b>03</b> Safety first</span></div>
    </div>
    <aside className="hero-note" aria-label="Environmental impact"><span className="note-icon" aria-hidden="true">♻</span><p><strong>Small fixes add up.</strong><br/>Repairing one item keeps materials in use and out of landfill.</p></aside>
  </section>
}

function QuestionPanel({ questions, answers, setAnswers, onSubmit, onBack }) {
  return <section className="result-panel followup-panel" aria-labelledby="followup-title">
    <p className="section-number">02 — A little more detail</p>
    <h2 id="followup-title">Help us see the full picture.</h2>
    <p className="panel-intro">The photo leaves a few important details unclear. Your answers help keep the guide accurate and safe.</p>
    <form onSubmit={onSubmit}>
      {questions.map((question, index) => <div className="question-field" key={`${question}-${index}`}>
        <label htmlFor={`answer-${index}`}><span>{String(index + 1).padStart(2, '0')}</span>{question}</label>
        <textarea id={`answer-${index}`} required value={answers[index] || ''} onChange={(event) => setAnswers((old) => ({ ...old, [index]: event.target.value }))} placeholder="Your answer" maxLength="400" />
      </div>)}
      <div className="action-row"><button className="text-button" type="button" onClick={onBack}>← Back</button><button className="primary-button">Create repair guide →</button></div>
    </form>
  </section>
}

function Guide({ guide, isSample, completed, setCompleted, onReset }) {
  const doneCount = Object.values(completed).filter(Boolean).length
  const progress = guide.steps.length ? Math.round((doneCount / guide.steps.length) * 100) : 0
  return <section className="guide" aria-labelledby="guide-title">
    <div className="guide-banner">
      <div>{isSample && <span className="sample-badge">Sample demo · Not AI analysis</span>}<p className="section-number">Your repair plan</p><h2 id="guide-title">Let’s get this back in use.</h2></div>
      <button className="new-repair" onClick={onReset}>＋ Start a new repair</button>
    </div>
    <div className="guide-layout">
      <aside className="guide-summary">
        <span className={`suitability ${guide.beginnerSuitable ? 'yes' : 'caution'}`}>{guide.beginnerSuitable ? '✓ Beginner-friendly' : '! Extra care needed'}</span>
        <h3>What appears to be wrong</h3><p>{guide.diagnosis}</p>
        <div className="uncertainty"><strong>What we’re not certain about</strong><p>{guide.uncertainty}</p></div>
        <dl><div><dt>Time</dt><dd>{guide.time}</dd></div><div><dt>Difficulty</dt><dd>{guide.difficulty}</dd></div></dl>
        <p className="beginner-note">{guide.beginnerNote}</p>
      </aside>
      <div className="guide-main">
        {guide.safetyNote && <div className="safety-callout" role="note"><span aria-hidden="true">!</span><div><strong>Safety first</strong><p>{guide.safetyNote}</p></div></div>}
        <section className="tools-section"><p className="mini-title">Gather before you begin</p><h3>Tools & materials</h3><ul className="tools-list">{guide.tools.map((tool) => <li key={tool}>✓ {tool}</li>)}</ul></section>
        <section className="steps-section"><div className="steps-heading"><div><p className="mini-title">Take it one step at a time</p><h3>Repair steps</h3></div><span>{doneCount} of {guide.steps.length} done</span></div><div className="progress-track" aria-label={`${progress}% complete`}><span style={{ width: `${progress}%` }} /></div>
          <ol>{guide.steps.map((step, index) => <li className={completed[index] ? 'complete' : ''} key={`${step}-${index}`}><input id={`step-${index}`} type="checkbox" checked={Boolean(completed[index])} onChange={(event) => setCompleted((old) => ({ ...old, [index]: event.target.checked }))}/><label htmlFor={`step-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></label></li>)}</ol>
        </section>
        <section className="check-section"><div><p className="mini-title">Before you call it done</p><h3>Check your repair</h3><p>{guide.successCheck}</p></div><span aria-hidden="true">◎</span></section>
        {guide.reuse.length > 0 && <section className="reuse-section"><p className="mini-title">If repair isn’t practical</p><h3>Keep the materials moving</h3><ul>{guide.reuse.map((idea) => <li key={idea}>↗ {idea}</li>)}</ul></section>}
      </div>
    </div>
  </section>
}

export default function App() {
  const [category, setCategory] = useState('clothing')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState('form')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [guide, setGuide] = useState(null)
  const [completed, setCompleted] = useState({})
  const [error, setError] = useState('')
  const [aiStatus, setAiStatus] = useState(null)
  const resultRef = useRef(null)

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])
  useEffect(() => {
    fetch('/api/status').then((response) => response.json()).then(setAiStatus).catch(() => setAiStatus(null))
  }, [])
  useEffect(() => { if (status !== 'form') setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50) }, [status])

  function selectFile(nextFile) {
    setError('')
    if (!nextFile) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(nextFile.type)) return setError('Please choose a JPG, PNG, or WebP image.')
    if (nextFile.size > 4 * 1024 * 1024) return setError('That image is over 4 MB. Please choose a smaller file.')
    if (preview) URL.revokeObjectURL(preview)
    setFile(nextFile); setPreview(URL.createObjectURL(nextFile))
  }

  async function requestAnalysis(extraAnswers = null) {
    setError(''); setStatus('loading')
    const data = new FormData(); data.append('photo', file); data.append('category', category); data.append('description', description.trim())
    if (extraAnswers) data.append('answers', JSON.stringify(questions.map((question, index) => ({ question, answer: extraAnswers[index] || '' }))))
    try {
      const response = await fetch('/api/analyze', { method: 'POST', body: data })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.message || 'We couldn’t analyze this item. Please try again.')
      if (payload.mode === 'questions') { setQuestions(payload.questions); setAnswers({}); setStatus('questions') }
      else { setGuide(payload.guide); setCompleted({}); setStatus('guide') }
    } catch (requestError) { setError(requestError.message); setStatus(extraAnswers ? 'questions' : 'form') }
  }

  function submitInitial(event) {
    event.preventDefault(); setError('')
    if (!file) return setError('Add a clear photo before continuing.')
    if (description.trim().length < 12) return setError('Please describe the damage in at least a short sentence.')
    requestAnalysis()
  }

  function reset() {
    if (preview) URL.revokeObjectURL(preview)
    setCategory('clothing'); setDescription(''); setFile(null); setPreview(''); setStatus('form'); setQuestions([]); setAnswers({}); setGuide(null); setCompleted({}); setError('')
    setTimeout(() => document.getElementById('repair-form')?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  function showSample() { setGuide(sampleGuide); setCompleted({}); setStatus('sample') }

  return <div className="site-shell"><Header/><main id="main"><Intro onSample={showSample}/>
    <section className={`workbench ${status !== 'form' && status !== 'loading' ? 'compact' : ''}`} id="repair-form" aria-labelledby="workbench-title">
      <div className="workbench-heading"><div><p className="section-number">01 — Start here</p><h2 id="workbench-title">What needs fixing?</h2></div><p>We’ll look closely, ask only what matters, and help you decide the next best step.</p></div>
      {aiStatus && !aiStatus.configured && <div className="setup-message" role="status"><span aria-hidden="true">i</span><p><strong>Local AI setup needed</strong>{aiStatus.running ? <>Install the vision model by running <code>ollama pull {aiStatus.model}</code> in Terminal.</> : <>Install and open Ollama, then run <code>ollama pull {aiStatus.model}</code> in Terminal.</>} Until then, the labeled sample demo is ready to explore.</p></div>}
      <form className="repair-form" onSubmit={submitInitial} noValidate>
        <div className="field-block"><span className="field-label" id="category-label">Choose a category</span><div className="category-grid" role="group" aria-labelledby="category-label">{categories.map((item) => <button className={`category-card ${category === item.id ? 'selected' : ''}`} type="button" key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}><span className="category-icon" aria-hidden="true">{item.icon}</span><span><strong>{item.name}</strong><small>{item.note}</small></span><span className="radio-dot" aria-hidden="true" /></button>)}</div></div>
        <div className="form-grid"><div className="field-block"><label htmlFor="photo">Add a clear photo</label><label className={`drop-zone ${dragging ? 'dragging' : ''} ${preview ? 'has-preview' : ''}`} htmlFor="photo" onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files[0]) }}>
          <input id="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => selectFile(event.target.files[0])}/>{preview ? <><img src={preview} alt="Preview of the damaged item"/><span className="replace-photo">Change photo</span></> : <><span className="upload-arrow" aria-hidden="true">↑</span><strong>Drop your photo here</strong><span>or choose from your device</span><small>JPG, PNG or WebP · 4 MB max</small></>}</label></div>
          <div className="field-block description-field"><label htmlFor="damage">Describe the damage</label><textarea id="damage" maxLength="600" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="For example: The seam under the right strap has opened and gets wider when the bag is full."/><div className="field-hint"><span>Include when it happened and how the item is used.</span><span>{description.length} / 600</span></div></div></div>
        {error && status === 'form' && <div className="error-message" role="alert"><span aria-hidden="true">!</span><p><strong>We need one more thing</strong>{error}</p></div>}
        <div className="form-footer"><p><span aria-hidden="true">◆</span> Private by design · processed locally on this computer.</p><button className="primary-button" disabled={status === 'loading'}>{status === 'loading' ? <><span className="spinner"/>Analyzing your item…</> : <>Analyze my item <span aria-hidden="true">→</span></>}</button></div>
      </form>
      <div className="demo-strip"><span className="sample-badge">Sample demo</span><p>Local AI not ready yet? Explore a clearly labeled example repair guide.</p><button onClick={showSample}>Open sample guide →</button></div>
    </section>
    <div ref={resultRef} className="result-anchor">{status === 'loading' && <section className="loading-panel" role="status" aria-live="polite"><span className="spinner large"/><div><strong>Looking closely at your item…</strong><p>We’re separating visible clues from assumptions and checking for safety concerns.</p></div></section>}
      {error && status === 'questions' && <div className="error-message standalone" role="alert"><span aria-hidden="true">!</span><p><strong>Something went wrong</strong>{error}</p></div>}
      {status === 'questions' && <QuestionPanel questions={questions} answers={answers} setAnswers={setAnswers} onBack={() => setStatus('form')} onSubmit={(event) => { event.preventDefault(); requestAnalysis(answers) }}/>}
      {(status === 'guide' || status === 'sample') && guide && <Guide guide={guide} isSample={status === 'sample'} completed={completed} setCompleted={setCompleted} onReset={reset}/>}</div>
  </main><footer><span>FixForward</span><p>Use good judgment. When a repair feels unsafe, stop and ask a qualified professional.</p></footer></div>
}
