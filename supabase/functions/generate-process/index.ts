import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, description } = await req.json();
    
    console.log('Generating process structure for:', { name, description });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert in life sciences quality management processes (CAPA, deviations, audits, change control, etc.). 
Generate appropriate form fields and workflow steps based on the process description.

Available field types: text, textarea, number, date, select, checkbox, email, url
Available user roles: admin, quality_manager, quality_reviewer, initiator, qa_final_approver

For each field and workflow step, provide a clear reason for why it's needed.
Focus on industry best practices and regulatory compliance.`;

    const userPrompt = `Process Name: ${name}
Process Description: ${description}

Generate a comprehensive quality process structure with appropriate form fields and workflow steps.`;

    // Call Lovable AI with tool calling for structured output
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_process_structure',
              description: 'Generate form fields and workflow steps for a quality process',
              parameters: {
                type: 'object',
                properties: {
                  suggested_fields: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field_name: { type: 'string' },
                        field_label: { type: 'string' },
                        field_type: { 
                          type: 'string',
                          enum: ['text', 'textarea', 'number', 'date', 'select', 'checkbox', 'email', 'url']
                        },
                        is_required: { type: 'boolean' },
                        field_options: { 
                          type: 'array',
                          items: { type: 'string' }
                        },
                        reason: { type: 'string' }
                      },
                      required: ['field_name', 'field_label', 'field_type', 'is_required', 'reason'],
                      additionalProperties: false
                    }
                  },
                  suggested_workflow: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        step_name: { type: 'string' },
                        required_role: { 
                          type: 'string',
                          enum: ['admin', 'quality_manager', 'quality_reviewer', 'initiator', 'qa_final_approver']
                        },
                        reason: { type: 'string' }
                      },
                      required: ['step_name', 'required_role', 'reason'],
                      additionalProperties: false
                    }
                  },
                  ai_explanation: { type: 'string' }
                },
                required: ['suggested_fields', 'suggested_workflow', 'ai_explanation'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_process_structure' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), 
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add funds to your Lovable AI workspace.' }), 
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received:', JSON.stringify(data, null, 2));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log('Generated process structure:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-process function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});