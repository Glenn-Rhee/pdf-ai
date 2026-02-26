import { differenceInYears, format, isToday, isYesterday } from "date-fns";

export function formatChatDate(date: Date) {
  const yearsDiff = differenceInYears(new Date(), date);

  // Today
  if (isToday(date)) {
    return `Today ${format(date, "HH:mm")}`;
  }

  // Yesterday
  if (isYesterday(date)) {
    return `Yesterday ${format(date, "HH:mm")}`;
  }

  if (yearsDiff >= 1) {
    return `${yearsDiff} year${yearsDiff > 1 ? "s" : ""} ago ${format(date, "HH:mm")} `;
  }

  return `${format(date, "MMM d")} ${format(date, "HH:mm")}`;
}
