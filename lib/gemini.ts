// /lib/gemini.ts
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!

const SYSTEM_PROMPT = `

`

export async function sendToGemini(userInput: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
          { role: 'user', parts: [{ text: userInput }] },
        ],
      }),
    }
  )

  return await res.json()
}

export function extractAction(reply: string): null | { type: string } {
  const match = reply.match(/Action:\s*"(\w+)"/i)
  if (!match) return null
  return { type: match[1] }
}
