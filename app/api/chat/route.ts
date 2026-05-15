import OpenAI from "openai"
import { NextRequest, NextResponse } from "next/server"

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { message, aqi, city } = body

    const completion = await client.chat.completions.create({
      model: "deepseek/deepseek-chat",

      messages: [
        {
          role: "system",
          content: `
You are an AQI AI assistant.

Current city: ${city}
Current AQI: ${aqi}

Answer users naturally about:
- pollution
- AQI
- health
- masks
- outdoor safety
- environment
- travel
`,
        },

        {
          role: "user",
          content: message,
        },
      ],
    })

    return NextResponse.json({
      reply: completion.choices[0].message.content,
    })
  } catch (error) {
    console.log("CHATBOT ERROR:", error)

    return NextResponse.json(
      { error: "AI failed" },
      { status: 500 }
    )
  }
}