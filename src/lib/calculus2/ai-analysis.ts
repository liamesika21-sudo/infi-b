import { agentDefinitions } from "./agents";

export interface AgentAnalysisInput {
  agentId: string;
  payload: unknown;
}

export interface AgentAnalysisResult {
  agentId: string;
  status: "not_configured";
  message: string;
}

export async function runAgentAnalysis(agentId: string, input: AgentAnalysisInput["payload"]): Promise<AgentAnalysisResult> {
  void input;
  const agent = agentDefinitions.find((definition) => definition.id === agentId);
  return {
    agentId,
    status: "not_configured",
    message: agent
      ? `Agent "${agent.name}" is defined but no AI provider adapter is configured yet.`
      : `Unknown agent id: ${agentId}`,
  };
}
