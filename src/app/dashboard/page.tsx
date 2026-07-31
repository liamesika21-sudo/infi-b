import { Dashboard } from "@/components/Dashboard";
import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { readGeneratedData } from "@/lib/calculus2/generated-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [generatedData, analysisData] = await Promise.all([readGeneratedData(), readAnalysisData()]);
  return <Dashboard generatedData={generatedData} analysisData={analysisData} />;
}
