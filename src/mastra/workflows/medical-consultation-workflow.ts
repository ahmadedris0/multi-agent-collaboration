import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const patientContextSchema = z.object({
    patientQuery: z.string(),
    patientAge: z.number(),
    patientGender: z.string(),
    medicalHistory: z.string(),
    currentMedications: z.string(),
});

const consultationResultSchema = z.object({
    orchestratorResponse: z.string(),
    consultationSummary: z.string(),
    recommendedFollowUp: z.string(),
});

const processPatientQuery = createStep({
    id: 'process-patient-query',
    description: 'Process patient information and generate consultation query',
    inputSchema: patientContextSchema,
    outputSchema: z.object({
        processedQuery: z.string(),
        patientContext: z.string(),
    }),
    execute: async ({ inputData }) => {
        if (!inputData) {
            throw new Error('Patient data not found');
        }

        const { patientQuery, patientAge, patientGender, medicalHistory, currentMedications } = inputData;

        // Build comprehensive patient context
        const patientContext = `
Patient Information:
- Age: ${patientAge}
- Gender: ${patientGender}
- Medical History: ${medicalHistory}
- Current Medications: ${currentMedications}
    `.trim();

        // The orchestrator will determine which specialists to consult
        const processedQuery = `
Patient Query: ${patientQuery}

Patient Context: ${patientContext}

Please coordinate with the appropriate specialist agents to provide a comprehensive medical consultation for this patient. Consider all aspects of their health and provide integrated recommendations from relevant specialists.
    `.trim();

        return {
            processedQuery,
            patientContext,
        };
    },
});

const orchestrateConsultation = createStep({
    id: 'orchestrate-consultation',
    description: 'Orchestrate multi-agent consultation using the orchestrator agent',
    inputSchema: z.object({
        processedQuery: z.string(),
        patientContext: z.string(),
    }),
    outputSchema: consultationResultSchema,
    execute: async ({ inputData, mastra }) => {
        if (!inputData) {
            throw new Error('Query data not found');
        }

        const orchestrator = mastra?.getAgent('orchestratorAgent');
        if (!orchestrator) {
            throw new Error('Orchestrator agent not found');
        }

        const response = await orchestrator.generate(inputData.processedQuery);

        // Generate a consultation summary and follow-up recommendations
        const consultationSummary = `
Multi-Specialist Consultation Completed:

Patient Context: ${inputData.patientContext}

Orchestrated Response: ${response.text}

This consultation involved coordination between relevant specialist agents based on the patient's specific needs and medical query.
    `.trim();

        const recommendedFollowUp = `
Recommended Follow-up Actions:
1. Schedule appropriate medical appointments as advised by specialists
2. Monitor symptoms and track any changes
3. Follow medication and lifestyle recommendations
4. Return for re-evaluation if symptoms persist or worsen
5. Maintain regular communication with healthcare providers
    `;

        return {
            orchestratorResponse: response.text,
            consultationSummary,
            recommendedFollowUp,
        };
    },
});

export const medicalConsultationWorkflow = createWorkflow({
    id: 'medical-consultation-workflow',
    inputSchema: patientContextSchema,
    outputSchema: consultationResultSchema,
})
    .then(processPatientQuery)
    .then(orchestrateConsultation);

medicalConsultationWorkflow.commit();
