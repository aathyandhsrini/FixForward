import test from 'node:test'
import assert from 'node:assert/strict'
import { buildUserText, highRiskReason, professionalGuide } from './repair.js'

test('flags high-risk repair descriptions before contacting AI', () => {
  assert.match(highRiskReason('The lithium battery is swollen inside the backpack'), /qualified professional/)
  assert.match(highRiskReason('The chair is part of a load-bearing structure'), /qualified professional/)
  assert.equal(highRiskReason('A shirt button fell off'), '')
})

test('professional guide contains no procedural repair instruction', () => {
  const guide = professionalGuide('Possible electrical risk.')
  assert.equal(guide.difficulty, 'Professional')
  assert.equal(guide.beginnerSuitable, false)
  assert.match(guide.steps[0], /Stop using/)
})

test('follow-up answers are included and prevent another question round', () => {
  const prompt = buildUserText({ category: 'backpack', description: 'The seam is open.', answers: [{ question: 'Is it frayed?', answer: 'No' }] })
  assert.match(prompt, /Is it frayed\?: No/)
  assert.match(prompt, /Do not ask more questions/)
})
