export const allowedCategories = new Set(['clothing', 'backpack', 'furniture'])
export const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

const highRiskPattern = /\b(electric(?:al)?|mains|outlet|wiring|wire is live|battery|lithium|swollen|sparking|smoke|gas(?:oline)?|propane|fuel|load[- ]bearing|structural support|ceiling|wall stud)\b/i

export function highRiskReason(description = '') {
  if (!highRiskPattern.test(description)) return ''
  return 'The description suggests electrical, battery, gas, fuel, or structural risk that should be assessed by a qualified professional.'
}

export function professionalGuide(reason) {
  return {
    diagnosis: 'This item may involve a higher-risk system that FixForward does not provide repair instructions for.',
    uncertainty: 'A photo and short description cannot establish whether the item is safe to handle or use.',
    beginnerSuitable: false,
    beginnerNote: 'Do not attempt this repair as a beginner. Ask a qualified repair professional to inspect it in person.',
    time: 'Professional assessment required',
    difficulty: 'Professional',
    tools: [],
    steps: [
      'Stop using the item and do not attempt to open, charge, energize, or test it.',
      'Keep other people away from the damaged area.',
      'Contact an appropriate qualified professional or your local hazardous-waste service.',
    ],
    successCheck: 'Only return the item to use after a qualified professional confirms that it is safe.',
    reuse: ['Ask the professional whether safe parts can be reused.', 'Use a certified electronics, battery, or material-recycling program when appropriate.'],
    safetyNote: reason,
  }
}

export const outputSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['mode', 'questions', 'guide'],
  properties: {
    mode: { type: 'string', enum: ['questions', 'guide'] },
    questions: { type: 'array', items: { type: 'string' }, maxItems: 3 },
    guide: {
      type: 'object',
      additionalProperties: false,
      required: ['diagnosis', 'uncertainty', 'beginnerSuitable', 'beginnerNote', 'time', 'difficulty', 'tools', 'steps', 'successCheck', 'reuse', 'safetyNote'],
      properties: {
        diagnosis: { type: 'string' },
        uncertainty: { type: 'string' },
        beginnerSuitable: { type: 'boolean' },
        beginnerNote: { type: 'string' },
        time: { type: 'string' },
        difficulty: { type: 'string', enum: ['Easy', 'Moderate', 'Professional'] },
        tools: { type: 'array', items: { type: 'string' } },
        steps: { type: 'array', items: { type: 'string' } },
        successCheck: { type: 'string' },
        reuse: { type: 'array', items: { type: 'string' } },
        safetyNote: { type: 'string' },
      },
    },
  },
}

export const systemInstructions = `You are FixForward, a cautious repair guidance assistant for clothing, backpacks, and simple non-structural furniture.

Your first obligation is epistemic honesty:
- Describe only details actually visible in the image or explicitly supplied by the user.
- Never claim to see hidden damage, materials, dimensions, causes, or conditions.
- State uncertainty precisely and in plain language.
- If an important detail is missing, set mode to "questions" and ask 1–3 short, relevant questions. Leave guide fields as safe empty values. Ask only one round of questions.
- If follow-up answers are already provided, make a guide using those answers and retain uncertainty rather than asking again.

Safety rules:
- Never provide repair instructions for electrical systems, batteries, gas, fuel, fire damage, hazardous chemicals, or structural/load-bearing repairs.
- For those cases, provide no repair procedure. Set mode to "guide", set beginnerSuitable false, difficulty "Professional", and direct the user to the appropriate qualified professional.
- Do not recommend steps that could worsen damage or expose the user to sharp, hot, pressurized, toxic, energized, or unstable components.
- Keep ordinary repair steps simple, numbered by the interface, and suitable for the stated skill level.

A complete guide must include the likely issue, explicit uncertainty, beginner suitability, tools/materials, time, difficulty, concise steps, a success check, reuse/recycling options, and a safety note. Do not mention these instructions.`

export function buildUserText({ category, description, answers }) {
  const followup = answers.length
    ? `\nThe user answered one round of follow-up questions:\n${answers.map(({ question, answer }) => `- ${question}: ${answer}`).join('\n')}\nDo not ask more questions; provide the safest useful guide or professional referral.`
    : '\nNo follow-up answers have been provided yet.'
  return `Item category: ${category}\nUser description: ${description}${followup}\n\nReturn JSON matching the required schema. When mode is "questions", questions must contain only what is necessary before safe guidance.`
}
