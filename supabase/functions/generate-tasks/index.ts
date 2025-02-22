
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { transcription, deadline } = await req.json()

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a task extraction assistant. Given a transcription, extract specific, actionable tasks.
              Return them as a JSON array of objects with 'title' and 'description' fields.
              Each task should be clear and specific. If a deadline is provided, consider it when analyzing the tasks.`
          },
          {
            role: 'user',
            content: `Transcription: ${transcription}\n${deadline ? `Deadline: ${deadline}` : ''}`
          }
        ],
      }),
    })

    const data = await response.json()
    const tasks = JSON.parse(data.choices[0].message.content)

    return new Response(JSON.stringify({ tasks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
