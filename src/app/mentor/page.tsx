import { ModulePage } from "@/components/ModulePage";

export default function MentorPage() {
  return (
    <ModulePage
      eyebrow="AI Mentor"
      title="מנטור אינפי ב׳"
      description="המנטור יתבסס על חומרי הקורס, יענה בעברית, יסביר אינטואיטיבית ואז פורמלית, ויתחשב בהיסט בין הרצאות לתרגולים."
      emptyTitle="המנטור עדיין לא מחובר למאגר ידע"
      emptyBody="ה-prompt והכללים קיימים בקוד. החיבור הבא הוא יצירת Mentor Knowledge Base מתוך ניתוח ההרצאות, התרגולים, המטלות ומבחני העבר."
    />
  );
}
