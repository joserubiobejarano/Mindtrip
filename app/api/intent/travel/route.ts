import { NextRequest, NextResponse } from 'next/server'
import { getOpenAIClient } from '@/lib/openai'

interface TravelIntent {
  destination?: string
  startDate?: string // ISO date string
  endDate?: string // ISO date string
  travelers?: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    const openai = getOpenAIClient()

    const systemPrompt = `You are a travel planning assistant. Extract travel planning parameters from user messages.

Extract the following information:
- destination: The destination city, country, or place name (string)
- startDate: Start date in ISO format (YYYY-MM-DD), or null if not specified
- endDate: End date in ISO format (YYYY-MM-DD), or null if not specified
- travelers: Number of travelers (integer, default to 1 if not specified)

Rules:
- If dates are relative (e.g., "next week", "in 2 months"), calculate the actual dates based on today's date: ${new Date().toISOString().split('T')[0]}
- If only one date is mentioned, assume it's the start date and calculate end date as 3 days later
- If duration is mentioned (e.g., "for 5 days"), calculate end date from start date
- Always return valid ISO date strings (YYYY-MM-DD) or null
- Return travelers as a number, defaulting to 1 if not specified
- Return destination as a string or null if not found

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "destination": "string or null",
  "startDate": "YYYY-MM-DD or null",
  "endDate": "YYYY-MM-DD or null",
  "travelers": number
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Extract travel planning parameters from this message: "${message}"`,
        },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) {
      return NextResponse.json(
        { success: false, error: 'No response from AI' },
        { status: 500 }
      )
    }

    // Parse the JSON response
    let parsedResponse: TravelIntent
    try {
      parsedResponse = JSON.parse(responseContent)
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      console.error('Response content:', responseContent)
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI response' },
        { status: 500 }
      )
    }

    // Validate and normalize the response
    const result: TravelIntent = {
      destination: parsedResponse.destination && typeof parsedResponse.destination === 'string' 
        ? parsedResponse.destination.trim() 
        : undefined,
      startDate: parsedResponse.startDate && typeof parsedResponse.startDate === 'string'
        ? parsedResponse.startDate.trim()
        : undefined,
      endDate: parsedResponse.endDate && typeof parsedResponse.endDate === 'string'
        ? parsedResponse.endDate.trim()
        : undefined,
      travelers: typeof parsedResponse.travelers === 'number' && parsedResponse.travelers > 0
        ? parsedResponse.travelers
        : parsedResponse.travelers === undefined ? 1 : undefined,
    }

    // Validate date formats if provided
    if (result.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(result.startDate)) {
      result.startDate = undefined
    }
    if (result.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(result.endDate)) {
      result.endDate = undefined
    }

    // Check if we have at least a destination
    if (!result.destination) {
      return NextResponse.json(
        { success: false, error: 'Could not extract destination from message' },
        { status: 200 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error: any) {
    console.error('Error in travel intent parser:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

