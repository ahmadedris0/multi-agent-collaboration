import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { dietitianAgent } from '../agents/dietitian-agent';

export const consultDietitianTool = createTool({
    id: 'consult-dietitian',
    description: 'Consult with the dietitian agent for nutritional advice and meal planning',
    inputSchema: z.object({
        query: z.string().describe('The nutritional question or dietary concern to discuss with the dietitian'),
        patientContext: z.string().optional().describe('Additional patient context relevant to the dietary consultation'),
    }),
    outputSchema: z.object({
        advice: z.string(),
        recommendations: z.array(z.string()).optional(),
    }),
    execute: async ({ context }) => {
        const { query, patientContext } = context;
        const fullQuery = patientContext
            ? `Patient Context: ${patientContext}\n\nDietary Question: ${query}`
            : query;

        const response = await dietitianAgent.generate(fullQuery);

        return {
            advice: response.text,
            recommendations: response.text.includes('•')
                ? response.text.split('•').slice(1).map(item => item.trim())
                : undefined,
        };
    },
});
