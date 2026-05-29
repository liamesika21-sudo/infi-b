import { Dashboard } from "@/components/Dashboard";
import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { readGeneratedData } from "@/lib/calculus2/generated-data";
import { scanDocsFolder } from "@/lib/calculus2/pipeline";

export default async function Home() {
  const [generatedData, inventory, analysisData] = await Promise.all([readGeneratedData(), scanDocsFolder(), readAnalysisData()]);
  return <Dashboard inventory={inventory} generatedData={generatedData} analysisData={analysisData} />;
}
