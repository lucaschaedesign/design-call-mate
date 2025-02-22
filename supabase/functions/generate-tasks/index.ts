
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

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
            content: `You are a task extraction assistant. Analyze the given transcription and extract actionable tasks.
              Format your response as a JSON array of tasks, where each task has 'title' and 'description' fields.
              For example:
              [
                {
                  "title": "Build Landing Page",
                  "description": "Create the main landing page with company information"
                }
              ]
              Each task should be clear, specific, and directly related to the project discussed.`
          },
          {
            role: 'user',
            content: `Transcription: ${transcription}\n${deadline ? `Deadline: ${deadline}` : ''}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    })

    const data = await response.json()
    console.log('OpenAI response:', data)

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI')
    }

    let tasks
    try {
      const content = data.choices[0].message.content
      // Parse the content as JSON, expecting a { tasks: [] } structure
      const parsed = JSON.parse(content)
      tasks = Array.isArray(parsed) ? parsed : (parsed.tasks || [])
    } catch (e) {
      console.error('Error parsing OpenAI response:', e)
      throw new Error('Failed to parse tasks from OpenAI response')
    }

    return new Response(JSON.stringify({ tasks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      tasks: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
