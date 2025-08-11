import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { fitnessAgent } from '../agents/fitness-agent';

export const consultFitnessTool = createTool({
    id: 'consult-fitness',
    description: 'Consult with the fitness agent for workout programs, exercise advice, and gym guidance',
    inputSchema: z.object({
        query: z.string().describe('The fitness question or training concern to discuss with the fitness specialist'),
        patientContext: z.string().optional().describe('Additional context about fitness level, goals, or physical condition'),
    }),
    outputSchema: z.object({
        advice: z.string(),
        recommendations: z.array(z.string()).optional(),
    }),
    execute: async ({ context }) => {
        const { query, patientContext } = context;
        const fullQuery = patientContext
            ? `Client Context: ${patientContext}\n\nFitness Question: ${query}`
            : query;

        const response = await fitnessAgent.generate(fullQuery);

        return {
            advice: response.text,
            recommendations: response.text.includes('•')
                ? response.text.split('•').slice(1).map(item => item.trim())
                : undefined,
        };
    },
});
