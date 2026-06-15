import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { buildWeekGroups, WeekSection, WeekSidebar } from "@/components/instructor-notes/MaxInsightsWeek";

export const dynamic = "force-dynamic";

export default async function InstructorNotesPage() {
  const analysis = await readAnalysisData();
  const insights = analysis.maxInsights;

  if (!insights) {
    return (
      <div className="mx-auto max-w-3xl py-10 text-center" style={{ color: "var(--text-muted)" }}>
        לא נמצא קובץ max-insights.json.
      </div>
    );
  }

  const weekGroups = buildWeekGroups(insights);

  return (
    <div className="mx-auto max-w-6xl py-2">

      {/* Page title */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: "var(--teal)" }}>
          Max Mahlin · תמלולי תרגול
        </p>
        <h1 className="text-4xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
          תובנות, עצות ודוגמאות נגדיות
        </h1>
        <p className="mt-3 text-base leading-8" style={{ color: "var(--text-secondary)" }}>
          מה שמקס אמר שחשוב למבחן, חזר עליו, וביקש שתשננו. הנוסחאות מוצגות כמתמטיקה אמיתית.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <WeekSidebar groups={weekGroups} />

        <main className="min-w-0 space-y-8">
          {weekGroups.map((group) => (
            <WeekSection key={group.week} group={group} />
          ))}
        </main>
      </div>

    </div>
  );
}
