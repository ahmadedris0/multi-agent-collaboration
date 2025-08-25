import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { pediatricianAgent } from '../agents/pediatrician-agent';

export const consultPediatricianTool = createTool({
    id: 'consult-pediatrician',
    description: 'Consult with the pediatrician agent for child healthcare, development, and family guidance',
    inputSchema: z.object({
        query: z.string().describe('The pediatric question or child health concern to discuss with the pediatrician'),
        patientContext: z.string().optional().describe('Additional context about the child (age, symptoms, development, family situation)'),
    }),
    outputSchema: z.object({
        advice: z.string(),
        recommendations: z.array(z.string()).optional(),
    }),
    execute: async ({ context }) => {
        const { query, patientContext } = context;
        const fullQuery = patientContext
            ? `Child/Family Context: ${patientContext}\n\nPediatric Question: ${query}`
            : query;

        const response = await pediatricianAgent.generate(fullQuery);

        return {
            advice: response.text,
            recommendations: response.text.includes('•')
                ? response.text.split('•').slice(1).map(item => item.trim())
                : undefined,
        };
    },
});
