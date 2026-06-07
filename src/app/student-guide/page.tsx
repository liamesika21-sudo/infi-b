import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpenCheck,
  Brain,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileQuestion,
  FlaskConical,
  Gauge,
  Lightbulb,
  Map,
  MessageSquareText,
  NotebookText,
  Route,
  ScrollText,
  Sigma,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";

export const metadata: Metadata = {
  title: "מדריך שימוש לסטודנט | Mentora",
  description: "מסלול למידה מומלץ והסבר פשוט על כל עמוד במערכת Mentora אינפי ב׳.",
};

type Icon = ComponentType<{ className?: string }>;

type LearningStage = {
  step: string;
  title: string;
  body: string;
  pages: string[];
  accent: string;
};

type PageCard = {
  title: string;
  href: string;
  body: string;
  when: string;
  icon: Icon;
};

type PageCategory = {
  title: string;
  description: string;
  cards: PageCard[];
};

const learningStages: LearningStage[] = [
  {
    step: "01",
    title: "מעבר על החומר",
    body: "מתחילים להבין את מבנה הקורס: מה נלמד בכל שבוע, אילו הגדרות ומשפטים שייכים לנושא, ומה חייבים לדעת לפני שפותרים.",
    pages: ["דשבורד", "שבועות", "נושאים", "נוסחאות", "משפטים", "הגדרות"],
    accent: "var(--navy-mid)",
  },
  {
    step: "02",
    title: "תרגול מסודר",
    body: "אחרי קריאה ראשונה עוברים לפתרון שאלות. מתחילים מתרגולים ומטלות, ואז חוזרים להסברים רק במקומות שבהם נתקעים.",
    pages: ["תרגול", "מטלות", "חזרת מטלות", "תבניות הוכחה", "מדריך הוכחות"],
    accent: "var(--teal)",
  },
  {
    step: "03",
    title: "הערות מקס וחידוד",
    body: "פותחים את ההדגשים אחרי שניסית לפתור לבד. כאן מזהים טעויות חוזרות, דוגמאות נגדיות ונקודות שמקס סימן כחשובות למבחן.",
    pages: ["הערות מקס", "אינטואיציה", "חזרה"],
    accent: "var(--purple-mid)",
  },
  {
    step: "04",
    title: "שיעורי בית ומבחני עבר",
    body: "עוברים לשאלות עם ערך בחינתי גבוה: מטלות, מבחני עבר וסימולציות. המטרה היא לזהות דפוסים ולעבוד תחת זמן.",
    pages: ["מטלות", "חזרת מטלות", "מבחני עבר", "סימולציות"],
    accent: "var(--amber-mid)",
  },
  {
    step: "05",
    title: "מעקב אישי וסגירת פערים",
    body: "בסוף כל יום מסמנים מה בשליטה ומה דורש חזרה. המעקב הופך את היום הבא לממוקד במקום לפתוח שוב את כל המערכת.",
    pages: ["מעקב שליטה", "דשבורד", "מנטור"],
    accent: "var(--green-mid)",
  },
];

const pageCategories: PageCategory[] = [
  {
    title: "התחלה והתמצאות",
    description: "עמודים שעוזרים להבין איפה את/ה עומד/ת ומה הפעולה הבאה.",
    cards: [
      {
        title: "דשבורד",
        href: "/dashboard",
        body: "עמוד הבית של הלמידה: זמן עד המבחן, מיקוד להיום, נושאים קריטיים וקיצורי דרך לכלים המרכזיים.",
        when: "פותחים בתחילת כל יום לימוד.",
        icon: Gauge,
      },
      {
        title: "שבועות",
        href: "/weeks",
        body: "מפת 13 השבועות של הקורס. בכל שבוע רואים הרצאה, תרגול, מטלה וסיכום, כולל ההיסט בין הרצאה לתרגול.",
        when: "כשרוצים ללמוד לפי סדר הקורס.",
        icon: Calendar,
      },
      {
        title: "נושאים",
        href: "/topics",
        body: "מפה לפי נושא במקום לפי שבוע. מציגה איפה כל נושא מופיע ומה החשיבות שלו למבחן.",
        when: "כשרוצים לסגור נושא מסוים.",
        icon: Map,
      },
    ],
  },
  {
    title: "למידת חומר",
    description: "עמודי עזר להבנה, שינון וכתיבה מתמטית נכונה.",
    cards: [
      {
        title: "נוסחאות",
        href: "/formulas",
        body: "נוסחאות ליבה עם שימוש, תנאים ואזהרות. מתאים לפתיחה בזמן פתרון ולחזרה לפני מבחן.",
        when: "כשצריך לדעת באיזו נוסחה להשתמש.",
        icon: Sigma,
      },
      {
        title: "משפטים",
        href: "/theorems",
        body: "משפטים, גרירות ומסקנות לפי שבוע. כולל הדגשים ודוגמאות נגדיות שחשובות למבחן.",
        when: "לפני הוכחות ושאלות נכון/לא נכון.",
        icon: ScrollText,
      },
      {
        title: "הגדרות",
        href: "/definitions",
        body: "מאגר הגדרות עם ניסוח פורמלי, אינטואיציה, דוגמה וטעות נפוצה.",
        when: "כשצריך לדייק ניסוח או תנאים.",
        icon: NotebookText,
      },
      {
        title: "אינטואיציה",
        href: "/intuition-map",
        body: "מפה שמסבירה את הרעיון מאחורי החומר לפי שבועות, בלי להעמיס בעוד תרגילים.",
        when: "כשמבינים טכנית אבל חסר למה.",
        icon: Lightbulb,
      },
      {
        title: "תבניות הוכחה",
        href: "/proof-patterns",
        body: "דפוסי הוכחה שחוזרים בקורס, עם צעדים כלליים וזיהוי של סוג השאלה.",
        when: "כשרוצים לשפר כתיבת פתרון.",
        icon: Route,
      },
      {
        title: "מדריך הוכחות",
        href: "/proof-guide",
        body: "מדריך קצר לנימוק פורמלי: לפי איזה משפט מותר לבצע צעד, אילו תנאים בודקים ואיך כותבים במבחן.",
        when: "כשפתרון נכון אבל הנימוק לא מספיק מסודר.",
        icon: ScrollText,
      },
    ],
  },
  {
    title: "תרגול ושיעורי בית",
    description: "אזור העבודה שבו עוברים מקריאה לפתרון שאלות.",
    cards: [
      {
        title: "תרגול",
        href: "/practice",
        body: "מרכז השאלות של המערכת: תרגולים, מטלות ומבחני עבר, מסודרים לפי מקור ונושא.",
        when: "העמוד המרכזי לפתרון יומי.",
        icon: Target,
      },
      {
        title: "מטלות",
        href: "/homework-solutions",
        body: "דפי ניתוח ופתרונות מלאים למטלות. מתאים להבנת תבניות פתרון ולא רק לבדיקה סופית.",
        when: "אחרי שניסית לפתור מטלה לבד.",
        icon: BookOpenCheck,
      },
      {
        title: "חזרת מטלות",
        href: "/homework-review",
        body: "שאלות מטלה לפי חשיבות למבחן, עם רמזים מדורגים וכיוון בלי לחשוף הכל מיד.",
        when: "כשרוצים להתמקד בשאלות הכי חשובות.",
        icon: ClipboardList,
      },
      {
        title: "הערות מקס",
        href: "/instructor-notes",
        body: "תובנות מהתרגולים: מה הודגש, מה נפוץ כטעות, ומה כדאי לזכור במיוחד למבחן.",
        when: "אחרי תרגול, לפני חזרה מסכמת.",
        icon: Sparkles,
      },
    ],
  },
  {
    title: "מבחן וחזרה",
    description: "שלב מאוחר יותר, אחרי שיש בסיס ותרגול ראשוני.",
    cards: [
      {
        title: "מבחני עבר",
        href: "/past-exams",
        body: "ניתוח מבחנים קודמים: נושאים חוזרים, תדירויות, שאלות לפי נושא וקישורי PDF.",
        when: "כשכבר מכירים את רוב החומר.",
        icon: FileQuestion,
      },
      {
        title: "סימולציות",
        href: "/simulations",
        body: "מבחני תרגול קצרים של 4 שאלות תחת זמן, מבוססים על שאלות מהחומרים.",
        when: "לבדיקת מוכנות אמיתית.",
        icon: FlaskConical,
      },
      {
        title: "חזרה",
        href: "/quick-review",
        body: "צ׳קליסט לפני מבחן: נושאים קריטיים, משפטים, טעויות נפוצות ותוכנית חזרה.",
        when: "בימים האחרונים ובסוף כל שבוע.",
        icon: Zap,
      },
    ],
  },
  {
    title: "עזרה ומעקב",
    description: "כלים שמחזיקים את הלמידה ממוקדת לאורך זמן.",
    cards: [
      {
        title: "מעקב שליטה",
        href: "/progress",
        body: "סימון אישי לכל נושא: לא התחלתי, בלמידה, צריך חזרה, שליטה טובה או שליטה מלאה.",
        when: "מעדכנים בסוף כל סשן לימוד.",
        icon: CheckCircle2,
      },
      {
        title: "מנטור",
        href: "/mentor",
        body: "צ׳אט עזרה לשאלות הבנה, כיווני פתרון, ניסוח פורמלי ושאלות בסגנון מבחן.",
        when: "כשנתקעים אחרי ניסיון עצמאי.",
        icon: Brain,
      },
    ],
  },
];

export default function StudentGuidePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7" style={{ borderColor: "var(--border)" }}>
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: "var(--teal)" }}>
              Student Guide
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
              איך להשתמש במערכת בלי ללכת לאיבוד
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8" style={{ color: "var(--text-secondary)" }}>
              לא צריך לפתוח את כל העמודים. עובדים לפי מסלול פשוט: חומר, תרגול, הערות מקס,
              שיעורי בית, מבחני עבר ומעקב אישי.
            </p>
          </div>

          <div className="rounded-xl border p-4" style={{ background: "var(--navy-light)", borderColor: "var(--navy-border)" }}>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg text-white" style={{ background: "var(--navy)" }}>
                <MessageSquareText className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-black">הכלל הכי חשוב</p>
                <p className="text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
                  קוראים קצר, פותרים הרבה, ואז חוזרים רק למה שנתקע.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="learning-route-title" className="space-y-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
            One pager
          </p>
          <h2 id="learning-route-title" className="mt-1 text-2xl font-black">
            מסלול מומלץ ללמידה
          </h2>
        </div>

        <div className="grid gap-3">
          {learningStages.map((stage) => (
            <article
              key={stage.step}
              className="grid gap-4 rounded-xl border bg-white p-4 shadow-sm md:grid-cols-[76px_1fr_260px] md:items-center"
              style={{ borderColor: "var(--border)" }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-black text-white"
                style={{ background: stage.accent }}
              >
                {stage.step}
              </div>
              <div>
                <h3 className="text-xl font-black">{stage.title}</h3>
                <p className="mt-1 text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
                  {stage.body}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {stage.pages.map((page) => (
                  <span key={page} className="badge badge-muted">
                    {page}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="pages-title" className="space-y-6">
        <div className="border-t pt-8" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
            Page map
          </p>
          <h2 id="pages-title" className="mt-1 text-2xl font-black">
            מה יש בכל עמוד
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
            הכרטיסים מחולקים לפי שימוש, כדי שיהיה ברור לאן נכנסים בכל שלב.
          </p>
        </div>

        {pageCategories.map((category) => (
          <div key={category.title} className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 className="text-xl font-black">{category.title}</h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {category.description}
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {category.cards.map((card) => (
                <GuidePageCard key={card.href} card={card} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function GuidePageCard({ card }: { card: PageCard }) {
  const Icon = card.icon;

  return (
    <Link
      href={card.href}
      className="group flex h-full flex-col rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mb-3 flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "var(--bg-subtle)", color: "var(--navy-mid)" }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h4 className="text-lg font-black">{card.title}</h4>
          <p className="text-xs font-bold" style={{ color: "var(--teal)" }}>
            {card.when}
          </p>
        </div>
      </div>
      <p className="text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
        {card.body}
      </p>
      <span className="mt-4 text-xs font-black transition group-hover:translate-x-[-2px]" style={{ color: "var(--navy-mid)" }}>
        פתיחת העמוד
      </span>
    </Link>
  );
}
