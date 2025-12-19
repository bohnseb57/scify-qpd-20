import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { document_base64, file_type, file_name } = await req.json();

    if (!document_base64) {
      return new Response(
        JSON.stringify({ error: 'Document content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Parsing SOP document: ${file_name} (${file_type})`);

    const systemPrompt = `You are an expert in life sciences quality management and regulatory compliance (FDA 21 CFR Part 11, ISO 13485, GxP, ICH guidelines).

Your task is to analyze Standard Operating Procedure (SOP) documents and extract structured information to create a digital quality process.

When analyzing the SOP, identify:
1. The process name (from the title, header, or document ID)
2. A concise description of the process purpose and scope
3. Form fields needed to capture data mentioned in the SOP (inputs, outputs, references, dates, personnel, etc.)
4. Workflow approval steps based on sign-off requirements, review stages, and approval hierarchies

Focus on:
- Regulatory compliance requirements
- Required signatures and approvals
- Data fields that need to be captured
- Sequential workflow steps
- Role-based responsibilities`;

    const userPrompt = `Analyze this SOP document and extract the process structure.

Document filename: ${file_name}

Please analyze the document content and generate:
1. A suggested process name
2. A clear description of the process
3. Form fields that should be captured (with appropriate field types)
4. Workflow steps with required roles

Use the generate_process_from_sop function to return your analysis.`;

    // Determine MIME type for the document
    const mimeType = file_type === 'application/pdf' 
      ? 'application/pdf' 
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

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
          { 
            role: 'user', 
            content: [
              { type: 'text', text: userPrompt },
              { 
                type: 'file',
                file: {
                  filename: file_name,
                  file_data: `data:${mimeType};base64,${document_base64}`
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_process_from_sop',
              description: 'Generate a quality process structure based on SOP document analysis',
              parameters: {
                type: 'object',
                properties: {
                  suggested_name: {
                    type: 'string',
                    description: 'Suggested name for the quality process based on the SOP title'
                  },
                  suggested_description: {
                    type: 'string',
                    description: 'Clear description of the process purpose and scope'
                  },
                  suggested_fields: {
                    type: 'array',
                    description: 'Form fields to capture based on SOP requirements',
                    items: {
                      type: 'object',
                      properties: {
                        field_name: {
                          type: 'string',
                          description: 'Lowercase snake_case field identifier'
                        },
                        field_label: {
                          type: 'string',
                          description: 'Human-readable field label'
                        },
                        field_type: {
                          type: 'string',
                          enum: ['text', 'textarea', 'number', 'date', 'select', 'checkbox', 'email', 'url'],
                          description: 'Type of form field'
                        },
                        is_required: {
                          type: 'boolean',
                          description: 'Whether this field is required'
                        },
                        reason: {
                          type: 'string',
                          description: 'Why this field is needed based on the SOP'
                        },
                        options: {
                          type: 'array',
                          items: { type: 'string' },
                          description: 'Options for select fields'
                        }
                      },
                      required: ['field_name', 'field_label', 'field_type', 'is_required', 'reason']
                    }
                  },
                  suggested_workflow: {
                    type: 'array',
                    description: 'Workflow approval steps based on SOP sign-off requirements',
                    items: {
                      type: 'object',
                      properties: {
                        step_name: {
                          type: 'string',
                          description: 'Name of the workflow step'
                        },
                        required_role: {
                          type: 'string',
                          enum: ['initiator', 'quality_reviewer', 'quality_manager', 'qa_final_approver', 'admin'],
                          description: 'Role required to complete this step'
                        },
                        can_approve: {
                          type: 'boolean',
                          description: 'Whether this step can approve the record'
                        },
                        can_reject: {
                          type: 'boolean',
                          description: 'Whether this step can reject the record'
                        },
                        reason: {
                          type: 'string',
                          description: 'Why this step is needed based on the SOP'
                        }
                      },
                      required: ['step_name', 'required_role', 'can_approve', 'can_reject', 'reason']
                    }
                  },
                  ai_explanation: {
                    type: 'string',
                    description: 'Explanation of why this structure was suggested based on the SOP analysis'
                  },
                  sop_reference: {
                    type: 'string',
                    description: 'Document ID or reference number from the SOP if found'
                  }
                },
                required: ['suggested_name', 'suggested_description', 'suggested_fields', 'suggested_workflow', 'ai_explanation']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_process_from_sop' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze document' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    console.log('AI response received');

    // Extract the tool call arguments
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'generate_process_from_sop') {
      console.error('Unexpected response format:', JSON.stringify(result));
      return new Response(
        JSON.stringify({ error: 'Failed to parse SOP document' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const processData = JSON.parse(toolCall.function.arguments);
    console.log('Successfully parsed SOP document');

    return new Response(
      JSON.stringify(processData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in parse-sop function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
