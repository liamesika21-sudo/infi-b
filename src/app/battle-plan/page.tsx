import { BattlePlanClient } from "@/components/BattlePlanClient";
import battlePlanData from "@/../data/generated/calculus2/battle-plan-data.json";
import { AllLectureDefinitions, AllLectureTheorems } from "@/components/LectureKnowledge";

export const metadata = { title: "תכנית קרב | Mentora" };

export default function BattlePlanPage() {
  return (
    <>
      <BattlePlanClient blocks={battlePlanData as Parameters<typeof BattlePlanClient>[0]["blocks"]} />

      {/* ── Complete word-for-word definitions & theorems from the lectures ── */}
      <div dir="rtl" style={{ maxWidth: 1100, margin: "0 auto", padding: "8px 16px 48px" }}>
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 28, marginTop: 16 }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 900,
              color: "var(--text-primary, #1a3a5c)",
              marginBottom: 4,
            }}
          >
            כל ההגדרות והמשפטים מההרצאות — מילה במילה
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted, #777)", marginBottom: 20 }}>
            הניסוחים הרשמיים בדיוק כפי שנכתבו בהרצאות 1–10, ממוספרים ומסודרים לפי הרצאה.
          </p>

          <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#c0392b", margin: "18px 0 8px" }}>
            הגדרות
          </h3>
          <AllLectureDefinitions />

          <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1565c0", margin: "24px 0 8px" }}>
            משפטים
          </h3>
          <AllLectureTheorems />
        </div>
      </div>
    </>
  );
}
