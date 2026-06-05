import { IntuitionMapClient } from "@/components/IntuitionMapClient";
import { getWeekIntuition } from "@/lib/calculus2/intuition-map";
import { readGeneratedData } from "@/lib/calculus2/generated-data";
import { scanDocsFolder } from "@/lib/calculus2/pipeline";

export default async function IntuitionMapPage() {
  const [generatedData, inventory] = await Promise.all([readGeneratedData(), scanDocsFolder()]);
  const weeks = (generatedData.weekMap.length > 0 ? generatedData.weekMap : inventory.weeks)
    .slice()
    .sort((a, b) => a.weekNumber - b.weekNumber)
    .map((week) => ({
      week,
      intuition: getWeekIntuition(week.weekNumber),
    }));

  return <IntuitionMapClient weeks={weeks} />;
}
