
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { weatherWorkflow } from './workflows/weather-workflow';
import { medicalConsultationWorkflow } from './workflows/medical-consultation-workflow';
import { weatherAgent } from './agents/weather-agent';
import { orchestratorAgent as orchestratorAgentNetwork } from './networks/orchestrator-agent-network';
import { orchestratorAgent } from './agents/orchestrator-agent';


export const mastra = new Mastra({
  workflows: {
    weatherWorkflow,
    medicalConsultationWorkflow,
  },
  agents: {
    weatherAgent,
    orchestratorAgent,
  },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  networks: {
    orchestratorAgentNetwork,
  },

});


