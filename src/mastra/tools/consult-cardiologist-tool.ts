import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { cardiologistAgent } from '../agents/cardiologist-agent';

export const consultCardiologistTool = createTool({
    id: 'consult-cardiologist',
    description: 'Consult with the cardiologist agent for cardiovascular health advice',
    inputSchema: z.object({
        query: z.string().describe('The cardiovascular question or concern to discuss with the cardiologist'),
        patientContext: z.string().optional().describe('Additional patient context relevant to the cardiac consultation'),
    }),
    outputSchema: z.object({
        advice: z.string(),
        recommendations: z.array(z.string()).optional(),
    }),
    execute: async ({ context }) => {
        const { query, patientContext } = context;
        const fullQuery = patientContext
            ? `Patient Context: ${patientContext}\n\nCardiac Question: ${query}`
            : query;

        const response = await cardiologistAgent.generate(fullQuery);

        return {
            advice: response.text,
            recommendations: response.text.includes('•')
                ? response.text.split('•').slice(1).map(item => item.trim())
                : undefined,
        };
    },
});
