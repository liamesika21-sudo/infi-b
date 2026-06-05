/**
 * Generates extended data files from existing analyzed data:
 * - recitation-summaries.json
 * - lecture-summaries.json
 * - homework-priority-map.json
 * - simulation-exams.json
 */

import fs from "node:fs/promises";
import path from "node:path";
import { GENERATED_DIR } from "../src/lib/calculus2/generated-data";
import type { RecitationAnalysis, HomeworkAnalysis, LectureAnalysis, QuestionItem } from "../src/lib/calculus2/analysis-types";

async function readJson<T>(filename: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(GENERATED_DIR, filename), "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(filename: string, data: unknown): Promise<void> {
  await fs.mkdir(GENERATED_DIR, { recursive: true });
  await fs.writeFile(path.join(GENERATED_DIR, filename), `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`  ✓ ${filename}`);
}

// ─── Recitation topic labels ──────────────────────────────────────────────

const RECITATION_META: Record<number, {
  mainThemes: string[];
  practicesLecture: number | null;
  whatWasPracticed: string;
  keyTechniques: string[];
  examRelevance: "low" | "medium" | "high" | "critical";
  mustPractice: string[];
  commonMistakes: string[];
  conclusions: string[];
}> = {
  1: {
    mainThemes: ["כלל לופיטל", "משפט דרבו", "גבולות חד-צדדיים"],
    practicesLecture: null,
    whatWasPracticed: "חישוב גבולות בצורות 0/0 ו-∞/∞ עם כלל לופיטל, וגבולות מהסוג 0·∞. יישום משפט דרבו להוכחות על פונקציות גזורות.",
    keyTechniques: ["כלל לופיטל", "פירוק לגבולות חד-צדדיים", "משפט דרבו", "משפט דרבו המורחב"],
    examRelevance: "high",
    mustPractice: [
      "חשב גבולות בצורת 0/0 ו-∞/∞ עם לופיטל",
      "הוכחת קיום נקודה עם ערך נגזרת נתון (דרבו)",
      "הוכיחו או הפריכו — גבולות ונגזרות",
    ],
    commonMistakes: [
      "שימוש בלופיטל כשהגבול לא בצורה 0/0 או ∞/∞",
      "שכחה לבדוק תנאי לופיטל לפני הפעלה",
      "חוסר בדיקת גבולות חד-צדדיים כשהפונקציה לא מוגדרת מכל צד",
    ],
    conclusions: [
      "לופיטל תקף רק ב-0/0 ו-∞/∞ — תמיד בדקי תנאים קודם",
      "דרבו מאפשר למצוא נקודה עם נגזרת כלשהי בין שתי נקודות גזירות",
      "משפט דרבו המורחב הוא כלי הוכחה חזק לשאלות 'הוכיחו/הפריכו'",
    ],
  },
  2: {
    mainThemes: ["סדרות רקורסיביות", "גבולות סדרות", "כלל לופיטל לסדרות"],
    practicesLecture: 1,
    whatWasPracticed: "ניתוח סדרות המוגדרות רקורסיבית: מציאת גבול, הוכחת מונוטוניות וחסינות, ושימוש בלופיטל לחישוב גבולות.",
    keyTechniques: ["ניתוח סדרה רקורסיבית", "הוכחת מונוטוניות (אינדוקציה)", "הוכחת חסימות", "שאלות הוכיחו/הפריכו"],
    examRelevance: "high",
    mustPractice: [
      "ניתוח סדרה רקורסיבית — מציאת גבול וקיומו",
      "הוכחת מונוטוניות עם אינדוקציה",
      "שאלות הוכיחו/הפריכו על סדרות",
    ],
    commonMistakes: [
      "הנחה שגבול קיים לפני שמוכיחים את קיומו",
      "חישוב גבול כאשר הסדרה לא חסומה",
      "שכחה לבדוק מונוטוניות",
    ],
    conclusions: [
      "לסדרה רקורסיבית: קודם מוכיחים מונוטוניות וחסימות, אחר כך מחשבים גבול",
      "אם ידוע ש-lim aₙ = L, אז גם lim aₙ₊₁ = L — כלי מרכזי",
    ],
  },
  3: {
    mainThemes: ["נגזרות מסדר גבוה", "משפט הערך הממוצע", "פיתוח טיילור"],
    practicesLecture: 2,
    whatWasPracticed: "חישוב נגזרות מסדר n, יישום MVT ומשפטי רול ולגרנז', ופיתוח טיילור של מחלקה ראשונה.",
    keyTechniques: ["נגזרת מסדר n", "MVT", "רול", "פיתוח טיילור עם שארית"],
    examRelevance: "high",
    mustPractice: [
      "חישוב נגזרת מסדר n של פונקציות בסיסיות",
      "יישום MVT להוכחת אי-שוויונות",
      "הוכחות ב-ε-δ על גבולות",
    ],
    commonMistakes: [
      "שגיאה בפיתוח נגזרת סינוס/קוסינוס מסדר n",
      "שכחת תנאי המשפט (רציפות, גזירות בקטע)",
      "בלבול בין MVT של קושי לרגיל",
    ],
    conclusions: [
      "MVT: פונקציה גזירה בקטע סגור — קיים נקודה פנימית שבה הנגזרת שווה לשיפוע הממוצע",
      "פיתוח טיילור = כלי מרכזי לחישוב גבולות ואינטגרלים",
    ],
  },
  4: {
    mainThemes: ["אינטגרל מסוים", "אינטגרל לא מסוים", "אינטגרציה בחלקים"],
    practicesLecture: 3,
    whatWasPracticed: "חישוב אינטגרלים מסוימים ולא מסוימים, שיטות: החלפת משתנה, אינטגרציה בחלקים, פירוק לשברים חלקיים.",
    keyTechniques: ["החלפת משתנה", "אינטגרציה בחלקים", "פירוק לשברים חלקיים", "אינטגרלים בסיסיים"],
    examRelevance: "critical",
    mustPractice: [
      "אינטגרציה בחלקים: ∫u dv",
      "החלפת משתנה (sin, cos, exp)",
      "פירוק לשברים חלקיים",
      "אינטגרלים לא מסוימים של פונקציות רציונליות",
    ],
    commonMistakes: [
      "בחירה לא טובה של u ב-IBP",
      "שכחת קבוע האינטגרציה +C",
      "טעויות בגבולות בהחלפת משתנה",
    ],
    conclusions: [
      "IBP: בחרי u = הפונקציה שנגזרתה פשוטה יותר, dv = מה שנוח לאינטגרציה",
      "פירוק לשברים חלקיים: שם ά/מכנה — פירוק המכנה לגורמים ראשוניים",
    ],
  },
  6: {
    mainThemes: ["מבחן השוואה לטורים", "מבחן האינטגרל", "טורים מוחלטים"],
    practicesLecture: 5,
    whatWasPracticed: "בדיקת התכנסות טורים עם מבחן השוואה, מבחן הגבול (LCT), מבחן האינטגרל, ומבחן סדרות חלופיות (Leibniz).",
    keyTechniques: ["מבחן השוואה (CT)", "מבחן גבול ההשוואה (LCT)", "מבחן האינטגרל", "מבחן לייבניץ"],
    examRelevance: "critical",
    mustPractice: [
      "מבחן השוואה: LCT וCT",
      "מבחן האינטגרל לטורים עם פונקציה יורדת",
      "מבחן לייבניץ לטורים חלופיים",
      "זיהוי טורים מהסוג p-series",
    ],
    commonMistakes: [
      "שכחת לבדוק שהפונקציה חיובית ויורדת לפני מבחן האינטגרל",
      "שימוש ב-LCT כשהגבול הוא 0 או ∞ (לא מסקנה)",
      "בלבול בין התכנסות מוחלטת לבין התכנסות בתנאי",
    ],
    conclusions: [
      "LCT: אם lim aₙ/bₙ = L > 0, שני הטורים מתכנסים או מתבדרים יחד",
      "מבחן האינטגרל: השתמשי כשrandom קשה לחשב ישירות",
      "טור חלופי מתכנס אם |aₙ| יורד למאפס",
    ],
  },
  7: {
    mainThemes: ["מבחן המנה", "מבחן השורש", "טורי חזקות — מבוא"],
    practicesLecture: 6,
    whatWasPracticed: "יישום מבחן קושי (שורש) ומבחן דלאמבר (מנה) לטורים, זיהוי גיאומטריה, ותחילת טורי חזקות.",
    keyTechniques: ["מבחן המנה (D'Alembert)", "מבחן השורש (Cauchy)", "גיאומטרי-סכום", "רדיוס התכנסות"],
    examRelevance: "critical",
    mustPractice: [
      "מבחן מנה לטורים עם n!",
      "מבחן שורש לטורים עם (...)^n",
      "חישוב רדיוס התכנסות R עם נוסחת המנה/שורש",
      "טור גיאומטרי — סכום וקריטריון",
    ],
    commonMistakes: [
      "שימוש במבחן מנה כשהמנה → 1 (מבחן לא קובע)",
      "שכחה לבדוק את נקודות הקצה בתחום ההתכנסות",
      "בלבול בין R לבין (-R+x₀, R+x₀)",
    ],
    conclusions: [
      "מבחן מנה קובע: L < 1 → מתכנס, L > 1 → מתבדר, L = 1 → לא קובע",
      "רדיוס התכנסות R = 1/limsup|aₙ|^(1/n) — תמיד בדקי קצוות בנפרד",
    ],
  },
  8: {
    mainThemes: ["התכנסות בהחלט", "התכנסות בתנאי", "מבחן לייבניץ"],
    practicesLecture: 7,
    whatWasPracticed: "הבחנה בין התכנסות מוחלטת לבין התכנסות בתנאי, הוכחות Leibniz, וטורים חלופיים.",
    keyTechniques: ["הוכחת התכנסות בתנאי (Leibniz)", "הוכחת אי-התכנסות מוחלטת", "השוואת כוחות"],
    examRelevance: "high",
    mustPractice: [
      "מציאת כל x שבהם טור מתכנס (בהחלט/בתנאי/מתבדר)",
      "שאלות על תחום התכנסות מלא עם בדיקת קצוות",
      "הוכחת התכנסות בתנאי vs מוחלטת",
    ],
    commonMistakes: [
      "שכחת בדיקת קצוות תחום ההתכנסות",
      "הנחה שהתכנסות בתנאי → מתכנס מוחלט (שגוי)",
    ],
    conclusions: [
      "בתוך רדיוס ההתכנסות — מוחלט תמיד",
      "בקצוות — יש לבדוק ידנית, ייתכן כל מצב",
      "הסדר גורם: aₙ≥0 חיוני ל-Leibniz",
    ],
  },
  9: {
    mainThemes: ["טורי חזקות", "רדיוס התכנסות", "טורי טיילור ומקלורן"],
    practicesLecture: 8,
    whatWasPracticed: "עבודה עם טורי חזקות: חישוב רדיוס התכנסות, גזירה ואינטגרציה של טורי חזקות, ופיתוח טורי טיילור של פונקציות בסיסיות.",
    keyTechniques: ["רדיוס התכנסות — נוסחת המנה/שורש", "גזירת טור חזקות", "אינטגרציה של טור חזקות", "טיילור/מקלורן"],
    examRelevance: "critical",
    mustPractice: [
      "חישוב R של ∑aₙxⁿ",
      "גזירה ואינטגרציה של ∑aₙxⁿ",
      "פיתוח eˣ, sin x, cos x, 1/(1-x) לטורי מקלורן",
      "חישוב סכום טור חזקות",
    ],
    commonMistakes: [
      "גזירה/אינטגרציה שינוי R אך לא בדיקת קצוות מחדש",
      "שכחה ש-R לא משתנה בגזירה/אינטגרציה, אבל הקצוות כן",
      "טעויות בנוסחת המקדמים aₙ = f^(n)(0)/n!",
    ],
    conclusions: [
      "גזירה/אינטגרציה של טור חזקות: R לא משתנה, הקצוות — בדקי מחדש",
      "טורי מקלורן עיקריים: עליך לשנן eˣ, sin x, cos x, ln(1+x), 1/(1-x)",
    ],
  },
};

// ─── Lecture meta ─────────────────────────────────────────────────────────

const LECTURE_META: Record<number, {
  title: string;
  mainTopics: string[];
  keyDefinitions: string[];
  keyTheorems: string[];
  keyFormulas: string[];
  examNotes: string[];
  dataQuality: "good" | "partial" | "ocr_only";
  summarySourceFile?: string;
}> = {
  1: {
    title: "גבולות — כלל לופיטל ומשפט דרבו",
    mainTopics: ["כלל לופיטל", "משפט דרבו", "גבולות חד-צדדיים"],
    keyDefinitions: ["גבול חד-צדדי", "גזירות בנקודה"],
    keyTheorems: ["כלל לופיטל", "משפט דרבו", "משפט דרבו המורחב"],
    keyFormulas: ["lim f/g = lim f'/g' (בתנאים)"],
    examNotes: ["לופיטל מופיע בכמעט כל בחינה — שנני תנאים", "דרבו — שאלת הוכחה קלאסית"],
    dataQuality: "partial",
    summarySourceFile: "הרצאות 1+2.pdf",
  },
  2: {
    title: "סדרות — הגדרה, גבולות, מונוטוניות",
    mainTopics: ["סדרות", "גבול סדרה", "סדרות מונוטוניות", "סדרה חסומה"],
    keyDefinitions: ["גבול סדרה (ε-N)", "סדרה מונוטונית", "סדרה חסומה", "סדרת קושי"],
    keyTheorems: ["כל סדרה מונוטונית וחסומה מתכנסת", "משפט ה-Squeeze"],
    keyFormulas: ["lim (1+1/n)^n = e", "lim n^(1/n) = 1"],
    examNotes: ["שאלות על סדרות רקורסיביות — מונוטוניות + גבול", "Squeeze theorem שכיח בסדרות"],
    dataQuality: "good",
    summarySourceFile: "שבוע 2 | אינפי 2.pdf",
  },
  3: {
    title: "נגזרות — מסדר גבוה, MVT, ופיתוח טיילור",
    mainTopics: ["נגזרת מסדר n", "משפט הערך הממוצע", "משפט רול", "פיתוח טיילור"],
    keyDefinitions: ["נגזרת מסדר n", "פולינום טיילור", "שארית לגרנז'"],
    keyTheorems: ["MVT", "רול", "פיתוח טיילור עם שארית"],
    keyFormulas: ["Pₙ(x) = Σ f^(k)(x₀)/k! · (x-x₀)^k", "Rₙ(x) = f^(n+1)(ξ)/(n+1)! · (x-x₀)^(n+1)"],
    examNotes: ["MVT — כלי הוכחה עיקרי", "טיילור — חישוב גבולות ואינטגרלים"],
    dataQuality: "partial",
    summarySourceFile: "שבוע 3.pdf",
  },
  4: {
    title: "אינטגרל מסוים — הגדרה, תכונות, ומשפט היסודי",
    mainTopics: ["אינטגרל רימן", "משפט היסודי של החשבון", "אינטגרציה בחלקים", "החלפת משתנה"],
    keyDefinitions: ["אינטגרל רימן", "פונקציה אינטגרבילית", "אנטי-נגזרת"],
    keyTheorems: ["משפט היסודי של החשבון (FTC)", "FTC2 — גזירת אינטגרל", "IBP"],
    keyFormulas: ["∫ₐᵇ f(x)dx = F(b)-F(a)", "∫u dv = uv - ∫v du"],
    examNotes: ["אינטגרל — נושא מרכזי, מופיע בכל מבחן", "IBP — שיטה שחוזרת הרבה"],
    dataQuality: "good",
    summarySourceFile: "שבוע 4 | אינפי 2.pdf",
  },
  5: {
    title: "אינטגרלים לא מסוימים — שיטות חישוב",
    mainTopics: ["פירוק לשברים חלקיים", "אינטגרלים טריגונומטריים", "שיטת ε²"],
    keyDefinitions: ["שבר חלקי", "אינטגרל לא מסוים"],
    keyTheorems: ["FTC", "משפט פיתוח לשברים חלקיים"],
    keyFormulas: ["∫sin²x dx = x/2 - sin(2x)/4", "∫cos²x dx = x/2 + sin(2x)/4"],
    examNotes: ["פירוק לשברים חלקיים — שיטה לבחינה", "אינטגרלים טריגונומטריים — קצת פחות שכיח"],
    dataQuality: "partial",
    summarySourceFile: "סיכום מאגד — הרצאות 4–5 חדו״א 2.pdf",
  },
  6: {
    title: "טורים — הגדרה ומבחני התכנסות בסיסיים",
    mainTopics: ["טורים אינסופיים", "טור גיאומטרי", "p-series", "מבחן השוואה"],
    keyDefinitions: ["טור מתכנס", "טור מתבדר", "p-series"],
    keyTheorems: ["תנאי הכרחי — lim aₙ = 0", "מבחן השוואה", "LCT", "מבחן האינטגרל"],
    keyFormulas: ["Σ 1/nᵖ מתכנס ↔ p > 1", "Σ qⁿ = 1/(1-q) ל|q|<1"],
    examNotes: ["מבחני התכנסות — נושא מרכזי בכל בחינה", "LCT — שיטה עיקרית"],
    dataQuality: "ocr_only",
  },
  7: {
    title: "טורים — מבחן מנה, שורש, ולייבניץ",
    mainTopics: ["מבחן מנה", "מבחן שורש", "טור חלופי", "מבחן לייבניץ"],
    keyDefinitions: ["טור חלופי", "התכנסות מוחלטת", "התכנסות בתנאי"],
    keyTheorems: ["מבחן דלאמבר", "מבחן קושי", "מבחן לייבניץ"],
    keyFormulas: ["R = lim |aₙ₊₁/aₙ|⁻¹", "R = lim |aₙ|^(-1/n)"],
    examNotes: ["מבחן מנה — שכיח ביותר", "לייבניץ — זכרי תנאים"],
    dataQuality: "good",
    summarySourceFile: "שבוע 7 סיכום.pdf",
  },
  8: {
    title: "טורי חזקות — הגדרה, רדיוס, תחום התכנסות",
    mainTopics: ["טור חזקות", "רדיוס התכנסות", "תחום התכנסות", "גזירת טורי חזקות"],
    keyDefinitions: ["טור חזקות סביב x₀", "רדיוס התכנסות R"],
    keyTheorems: ["משפט הרדיוס", "גזירת טור חזקות שומרת על R", "אינטגרציה של טור חזקות"],
    keyFormulas: ["R = 1/limsup|aₙ|^(1/n)", "Σaₙxⁿ גזיר ← Σnaₙxⁿ⁻¹ עם אותו R"],
    examNotes: ["רדיוס התכנסות — שאלה שכיחה", "גזירה/אינטגרציה טור — כלי לחישוב סכומים"],
    dataQuality: "good",
    summarySourceFile: "calculus2_week9_RTL_polished.pdf",
  },
  9: {
    title: "טורי טיילור ומקלורן",
    mainTopics: ["טור טיילור", "טור מקלורן", "שאריות", "פיתוח פונקציות בסיסיות"],
    keyDefinitions: ["טור טיילור של f סביב x₀", "שארית לגרנז'", "שארית קושי"],
    keyTheorems: ["כל פונקציה C^∞ שווה לטור טיילור שלה בתחום R"],
    keyFormulas: [
      "eˣ = Σ xⁿ/n! (כל x)",
      "sin x = Σ (-1)ⁿx^(2n+1)/(2n+1)!",
      "cos x = Σ (-1)ⁿx^(2n)/(2n)!",
      "ln(1+x) = Σ (-1)ⁿ⁺¹xⁿ/n (|x|≤1, x≠-1)",
      "1/(1-x) = Σ xⁿ (|x|<1)",
    ],
    examNotes: ["טורי מקלורן עיקריים — חובה לשנן", "שאלת חישוב סכום עם טיילור — שכיח"],
    dataQuality: "good",
    summarySourceFile: "calculus2_week9_RTL_polished.pdf",
  },
};

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("Generating extended data files...\n");

  const [
    recitationAnalysis,
    homeworkAnalysis,
    lectureAnalysis,
    questionBank,
  ] = await Promise.all([
    readJson<RecitationAnalysis[]>("recitation-analysis.json", []),
    readJson<HomeworkAnalysis[]>("homework-analysis.json", []),
    readJson<LectureAnalysis[]>("lecture-analysis.json", []),
    readJson<QuestionItem[]>("question-bank.json", []),
  ]);

  // ── 1. Recitation summaries ──
  const recitationSummaries = recitationAnalysis.map((rec) => {
    const meta = RECITATION_META[rec.recitationNumber] ?? {
      mainThemes: rec.practicedTopics,
      practicesLecture: rec.practicedLectureNumber,
      whatWasPracticed: `תרגול ${rec.recitationNumber} — נושאים: ${rec.practicedTopics.join(", ")}`,
      keyTechniques: [],
      examRelevance: "medium" as const,
      mustPractice: [],
      commonMistakes: [],
      conclusions: [],
    };

    return {
      recitationNumber: rec.recitationNumber,
      weekNumber: rec.weekNumber,
      sourceFileId: rec.sourceFileId,
      filename: rec.filename,
      practicesLecture: meta.practicesLecture,
      mainThemes: meta.mainThemes,
      whatWasPracticed: meta.whatWasPracticed,
      keyTechniques: meta.keyTechniques,
      examRelevance: meta.examRelevance,
      questionCount: rec.questions.length,
      questionIds: rec.questions.map((q) => q.id),
      solutionPatternCount: rec.solutionPatterns.length,
      mustPractice: meta.mustPractice,
      commonMistakes: [...meta.commonMistakes, ...rec.commonMistakes].slice(0, 6),
      conclusions: meta.conclusions,
      topicCoverage: rec.practicedTopics,
      confidence: rec.confidence,
      dataNote: rec.confidence < 0.7 ? "נתוני תרגול חלקיים — ודאי עם הקובץ המקורי" : undefined,
    };
  });

  await writeJson("recitation-summaries.json", recitationSummaries);

  // ── 2. Lecture summaries ──
  const lectureNumbers = [...new Set([...lectureAnalysis.map((l) => l.lectureNumber), ...[1,2,3,4,5,6,7,8,9]])].sort((a,b)=>a-b);

  const lectureSummaries = lectureNumbers.map((lectureNumber) => {
    const analysisData = lectureAnalysis.find((l) => l.lectureNumber === lectureNumber);
    const meta = LECTURE_META[lectureNumber];

    return {
      lectureNumber,
      weekNumber: lectureNumber,
      sourceFileId: analysisData?.sourceFileId ?? null,
      filename: analysisData?.filename ?? null,
      title: meta?.title ?? `הרצאה ${lectureNumber}`,
      mainTopics: meta?.mainTopics ?? analysisData?.detectedTopics ?? [],
      keyDefinitions: meta?.keyDefinitions ?? [],
      keyTheorems: meta?.keyTheorems ?? [],
      keyFormulas: meta?.keyFormulas ?? [],
      examNotes: meta?.examNotes ?? [],
      dataQuality: meta?.dataQuality ?? "ocr_only",
      summarySourceFile: meta?.summarySourceFile ?? null,
      extractedTheorems: analysisData?.theorems.length ?? 0,
      extractedFormulas: (analysisData?.formulas ?? []).filter((f) => f.confidence >= 0.5).length,
      confidence: analysisData?.confidence ?? 0.3,
      ocrWarning: (analysisData?.confidence ?? 0) < 0.5 ? "הרצאה זו היא כתב יד — טקסט שחולץ אינו אמין. הסתמכי על סיכומים ותרגולים." : undefined,
    };
  });

  await writeJson("lecture-summaries.json", lectureSummaries);

  // ── 3. Homework priority map ──
  const homeworkPriorityMap = homeworkAnalysis.map((hw) => {
    // Filter out sub-parts like (a), (b), (c) that were incorrectly split as separate questions.
    // A real homework question starts with a top-level number ("1." "2.") or an action keyword.
    // Each homework has ≤6 main questions; sub-parts inflate the count.
    // Keep only top-level numbered questions. Sub-parts start with "(letter)"
    // and solution paragraphs have no question number in their first 60 chars.
    const mainOnly = hw.questions.filter((q) => {
      const c = q.content.trimStart();
      return !c.startsWith("(") && /[1-9]\. /.test(c.slice(0, 60));
    });
    const filtered = mainOnly.length > 0 ? mainOnly : hw.questions;

    const questions = filtered.map((q, index) => {
      const content = q.content;
      const isLong = content.length > 400;
      const hasProof = /הוכיח|prove|הפרך|disprove|נובע|follows/i.test(content);
      const hasComputation = /חשב|compute|מצא|find|calculate/i.test(content);
      const hasLopital = /לופיטל|l.h.pital|l'h/i.test(content);
      const hasSeries = /טור|series|convergence|מתכנס/i.test(content);
      const hasIntegral = /אינטגרל|integral|∫/i.test(content);
      const hasPowerSeries = /טור חזקות|power series/i.test(content);

      // Priority scoring
      let score = 0;
      if (hasProof) score += 3;
      if (hasSeries) score += 2;
      if (hasPowerSeries) score += 3;
      if (hasIntegral) score += 2;
      if (isLong) score += 1;
      if (hasLopital) score += 1;

      const importanceLevel: "low" | "medium" | "high" | "critical" =
        score >= 6 ? "critical" : score >= 4 ? "high" : score >= 2 ? "medium" : "low";

      const examSimilarity: "low" | "medium" | "high" | "critical" =
        hasProof && (hasSeries || hasPowerSeries) ? "critical" :
        hasProof || hasSeries || hasPowerSeries ? "high" :
        hasComputation && hasIntegral ? "high" : "medium";

      const recommendedAction =
        importanceLevel === "critical" ? "פתרי שוב לפני המבחן — חובה" :
        importanceLevel === "high" ? "חזרי על השאלה הזאת — קרוב למבחן" :
        importanceLevel === "medium" ? "ודאי שאת מבינה את הגישה" : "ניתן לדלג";

      return {
        questionId: q.id,
        questionNumber: index + 1,
        homeworkNumber: hw.homeworkNumber,
        weekNumber: hw.weekNumber,
        topicIds: q.topicIds,
        difficulty: q.difficulty,
        examSimilarity,
        importanceLevel,
        whyItMatters:
          importanceLevel === "critical"
            ? "שאלה מורכבת עם הוכחה/טורים/חזקות — דפוס שחוזר במבחנים"
            : importanceLevel === "high"
            ? "שאלה מייצגת — בנה/בני הבנה יציבה"
            : "שאלה טובה לתרגול שוטף",
        requiredKnowledge: q.topicIds,
        recommendedAction,
        contentPreview: content.slice(0, 200),
        confidence: q.confidence,
      };
    });

    const criticalCount = questions.filter((q) => q.importanceLevel === "critical").length;
    const highCount = questions.filter((q) => q.importanceLevel === "high").length;
    const mustReview = criticalCount > 0 || highCount >= 2;

    return {
      homeworkNumber: hw.homeworkNumber,
      weekNumber: hw.weekNumber,
      sourceFileId: hw.sourceFileId,
      filename: hw.filename,
      mustReviewBeforeExam: mustReview,
      overallPriority: criticalCount > 0 ? "critical" : highCount >= 2 ? "high" : "medium",
      criticalQuestions: criticalCount,
      highPriorityQuestions: highCount,
      questions,
    };
  });

  await writeJson("homework-priority-map.json", homeworkPriorityMap);

  // ── 4. Simulation exams ──
  const recitationQuestions = questionBank.filter((q) => q.sourceType === "recitation" && q.confidence >= 0.5);
  const homeworkQuestions = questionBank.filter((q) => q.sourceType === "homework" && q.confidence >= 0.5);

  function makeQuestion(q: QuestionItem, sourceBasis: string, hint?: string, solution?: string) {
    return {
      id: `sim-q-${q.id}`,
      sourceBasis,
      basedOnSourceIds: [q.sourceFileId],
      topicIds: q.topicIds,
      content: q.content.slice(0, 1200),
      requiredKnowledge: q.topicIds,
      difficulty: q.difficulty === "unknown" ? "medium" : q.difficulty,
      examRelevance: q.examRelevance,
      hint,
      solutionOutline: solution,
    };
  }

  // Group recitation questions by week
  const recByWeek: Record<number, QuestionItem[]> = {};
  for (const q of recitationQuestions) {
    const week = recitationAnalysis.find(r => r.sourceFileId === q.sourceFileId)?.weekNumber ?? 0;
    if (!recByWeek[week]) recByWeek[week] = [];
    recByWeek[week].push(q);
  }

  // Simulation 1: Limits & Derivatives (weeks 1-3)
  const sim1Qs = [
    ...(recByWeek[1] ?? []).slice(1, 2),
    ...(recByWeek[1] ?? []).slice(3, 4),
    ...(recByWeek[2] ?? []).slice(0, 1),
    ...(recByWeek[3] ?? []).slice(0, 1),
  ].slice(0, 4);

  // Simulation 2: Series (weeks 6-7)
  const sim2Qs = [
    ...(recByWeek[6] ?? []).slice(0, 2),
    ...(recByWeek[7] ?? []).slice(0, 2),
  ].slice(0, 4);

  // Simulation 3: Power Series + Absolute/Conditional (weeks 8-9)
  const sim3Qs = [
    ...(recByWeek[8] ?? []).slice(0, 2),
    ...(recByWeek[9] ?? []).slice(0, 2),
  ].slice(0, 4);

  // Simulation 4: Mixed homework exam-style
  const sim4Qs = [
    ...homeworkQuestions.filter((q) => /הוכיח|prove/i.test(q.content)).slice(0, 2),
    ...homeworkQuestions.filter((q) => /טור|series/i.test(q.content)).slice(0, 2),
  ].slice(0, 4);

  const simulationExams = [
    {
      id: "sim-1-limits-derivatives",
      title: "סימולציה 1 — גבולות ונגזרות",
      estimatedDurationMinutes: 90,
      difficulty: "medium" as const,
      targetTopics: ["כלל לופיטל", "גבולות", "נגזרות", "דרבו"],
      needsReview: sim1Qs.length < 4,
      questions: sim1Qs.map((q, i) =>
        makeQuestion(
          q,
          "recitation",
          i === 0 ? "נסי להפריד לגבולות חד-צדדיים" : undefined,
          i === 1 ? "השתמשי במשפט דרבו — הוכיחי שהנגזרת מקבלת ערך ביניים" : undefined,
        )
      ),
    },
    {
      id: "sim-2-series",
      title: "סימולציה 2 — טורים ומבחני התכנסות",
      estimatedDurationMinutes: 90,
      difficulty: "hard" as const,
      targetTopics: ["מבחן השוואה", "LCT", "מבחן מנה", "מבחן שורש", "לייבניץ"],
      needsReview: sim2Qs.length < 4,
      questions: sim2Qs.map((q, i) =>
        makeQuestion(
          q,
          "recitation",
          i === 0 ? "נסי LCT עם 1/nᵖ מתאים" : undefined,
          i === 2 ? "בדקי: האם הטור חלופי? מתקיים lim aₙ = 0? האם aₙ יורד?" : undefined,
        )
      ),
    },
    {
      id: "sim-3-power-series",
      title: "סימולציה 3 — טורי חזקות",
      estimatedDurationMinutes: 90,
      difficulty: "hard" as const,
      targetTopics: ["טורי חזקות", "רדיוס התכנסות", "גזירה ואינטגרציה", "טיילור"],
      needsReview: sim3Qs.length < 4,
      questions: sim3Qs.map((q, i) =>
        makeQuestion(
          q,
          "recitation",
          i === 0 ? "חשבי R עם נוסחת המנה" : undefined,
          i === 1 ? "בדקי קצוות בנפרד אחרי מציאת R" : undefined,
        )
      ),
    },
    {
      id: "sim-4-mixed-exam",
      title: "סימולציה 4 — מבחן מעורב",
      estimatedDurationMinutes: 120,
      difficulty: "mixed" as const,
      targetTopics: ["הוכחות", "טורים", "גבולות", "אינטגרלים"],
      needsReview: sim4Qs.length < 4,
      questions: sim4Qs.map((q) =>
        makeQuestion(q, "homework")
      ),
    },
  ].map((sim) => ({
    ...sim,
    questions: sim.questions.length > 0 ? sim.questions : [],
  }));

  await writeJson("simulation-exams.json", simulationExams);

  console.log("\nDone!");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
