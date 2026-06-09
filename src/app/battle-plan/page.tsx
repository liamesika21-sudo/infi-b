import { BattlePlanClient } from "@/components/BattlePlanClient";
import battlePlanData from "@/../data/generated/calculus2/battle-plan-data.json";

export const metadata = { title: "תכנית קרב | Mentora" };

export default function BattlePlanPage() {
  return <BattlePlanClient blocks={battlePlanData as Parameters<typeof BattlePlanClient>[0]["blocks"]} />;
}
