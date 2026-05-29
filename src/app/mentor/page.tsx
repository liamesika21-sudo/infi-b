import { readAnalysisData } from "@/lib/calculus2/analysis-reader";
import { PageHeader } from "@/components/study/StudyCard";
import { StudyCallout } from "@/components/study/StudyCallout";

export default async function MentorPage() {
  const analysis = await readAnalysisData();
  const kb = analysis.mentorKnowledgeBase;
  const hasKb = kb !== null;

  const starterQuestions = [
    "הסברי לי את מבחן ההשוואה לטורים",
    "מה ההבדל בין התכנסות מוחלטת לבתנאי?",
    "איך מחשבים רדיוס התכנסות של טור חזקות?",
    "הסברי את משפט לופיטל ומתי משתמשים בו",
    "מה זה טור טיילור ואיך בונים אותו?",
    "איך מוכיחים שסדרה רקורסיבית מתכנסת?",
    "עזרי לי לסכם את נושאי הטורים",
    "בני לי שאלת תרגול על אינטגרלים לא מסוימים",
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Mentor"
        title="מנטור אינפי ב׳"
        description="המנטור יבנה על מאגר ידע מהחומרים שלך. מחובר לשאלות, נוסחאות, משפטים ושאלות עם פתרון."
      />

      {/* KB Status */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KbStat label="נוסחאות במאגר" value={kb?.formulas.length ?? 0} available={hasKb} />
        <KbStat label="משפטים במאגר" value={kb?.theorems.length ?? 0} available={hasKb} />
        <KbStat label="שאלות במאגר" value={kb?.questionBankSummary.length ?? 0} available={hasKb} />
      </div>

      {!hasKb && (
        <StudyCallout variant="warning">
          המנטור טרם נוצר. הריצי{" "}
          <code dir="ltr" className="rounded bg-white/60 px-1 font-mono text-xs">npm run analyze:calculus2</code>{" "}
          כדי לבנות את מאגר הידע.
        </StudyCallout>
      )}

      {/* Starter questions */}
      <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
        <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          שאלות פתיחה מומלצות
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {starterQuestions.map((q, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg border p-3 cursor-pointer transition hover:border-current"
              style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}
            >
              <span className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>💬</span>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{q}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modes */}
      <section className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
        <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          מצבי לימוד
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { mode: "הסבר נושא", desc: "הסבר אינטואיטיבי + פורמלי של נושא", icon: "📖" },
            { mode: "בחן אותי", desc: "שאלות תרגול לפי נושא שתבחרי", icon: "✏️" },
            { mode: "עזרי לי לפתור", desc: "ניתוח שאלה והכוון לפתרון", icon: "🧮" },
            { mode: "בני סשן לימוד", desc: "תכנון לימוד לפי נושא ומשך", icon: "📅" },
            { mode: "חזרה על משפט", desc: "ניסוח, תנאים ויישום", icon: "📐" },
            { mode: "צור שאלה דומה", desc: "שאלה בסגנון בחינה על נושא", icon: "⭐" },
          ].map(({ mode, desc, icon }) => (
            <div
              key={mode}
              className="rounded-lg border p-4"
              style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}
            >
              <p className="text-base">{icon}</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{mode}</p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <StudyCallout variant="info">
        <strong>שלב הבא:</strong> חיבור API של Claude לממשק מנטור. הבסיס — מאגר ידע, שאלות מתרגולים ומטלות — כבר קיים.
      </StudyCallout>
    </div>
  );
}

function KbStat({ label, value, available }: { label: string; value: number; available: boolean }) {
  return (
    <div
      className="rounded-xl border p-4 text-center"
      style={{
        background: available ? "var(--green-light)" : "var(--bg-subtle)",
        borderColor: available ? "var(--green-border)" : "var(--border)",
      }}
    >
      <p className="text-2xl font-bold" style={{ color: available ? "var(--green)" : "var(--text-muted)" }}>
        {value}
      </p>
      <p className="mt-1 text-xs font-medium" style={{ color: available ? "var(--green)" : "var(--text-muted)", opacity: 0.9 }}>
        {label}
      </p>
    </div>
  );
}
