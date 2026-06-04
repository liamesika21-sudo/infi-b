import { WeekNavBar } from "@/components/study/WeekNavBar";

interface Props {
  children: React.ReactNode;
  params: Promise<{ weekNumber: string }>;
}

export default async function WeekLayout({ children, params }: Props) {
  const { weekNumber } = await params;
  const weekNum = parseInt(weekNumber, 10);

  return (
    <div>
      <WeekNavBar currentWeek={isNaN(weekNum) ? 1 : weekNum} />
      {children}
    </div>
  );
}
