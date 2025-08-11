import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { neurologistAgent } from '../agents/neurologist-agent';

export const consultNeurologistTool = createTool({
    id: 'consult-neurologist',
    description: 'Consult with the neurologist agent for neurological health advice',
    inputSchema: z.object({
        query: z.string().describe('The neurological question or concern to discuss with the neurologist'),
        patientContext: z.string().optional().describe('Additional patient context relevant to the neurological consultation'),
    }),
    outputSchema: z.object({
        advice: z.string(),
        recommendations: z.array(z.string()).optional(),
    }),
    execute: async ({ context }) => {
        const { query, patientContext } = context;
        const fullQuery = patientContext
            ? `Patient Context: ${patientContext}\n\nNeurological Question: ${query}`
            : query;

        const response = await neurologistAgent.generate(fullQuery);

        return {
            advice: response.text,
            recommendations: response.text.includes('•')
                ? response.text.split('•').slice(1).map(item => item.trim())
                : undefined,
        };
    },
});
