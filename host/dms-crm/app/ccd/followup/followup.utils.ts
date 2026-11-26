import { FollowupListParams, FollowupTabCounts } from "../../features/ccd/types";

export type FollowupTabKey = keyof FollowupTabCounts;

export const FOLLOWUP_TABS: {
  key: FollowupTabKey;
  label: string;
  // Merged over the secondary filters, so a tab always wins on its own keys.
  params: FollowupListParams;
  subtitle?: string;
}[] = [
  { key: "all", label: "All", params: {} },
  {
    key: "overdue",
    label: "Overdue",
    params: { overdue: "true" },
    subtitle:
      "Pending follow-ups past their due time. Each enquiry appears once.",
  },
  {
    key: "today",
    label: "Today",
    params: { due: "today" },
    subtitle: "Pending follow-ups due today.",
  },
  {
    key: "upcoming",
    label: "Upcoming",
    params: { due: "upcoming" },
    subtitle: "Pending follow-ups due after today.",
  },
  {
    key: "done",
    label: "Done",
    params: { status: "done" },
    subtitle:
      "Logged follow-ups. Due is when it was scheduled; the line below is when it was actually done. Remarks cannot be edited.",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    params: { status: "cancelled" },
    subtitle:
      "Cancelled automatically when the enquiry was marked Lost or Closed. Due is when it was scheduled.",
  },
];

// Every Followup.ContactTypeChoices value: what "Schedule" offers.
export const SCHEDULE_CONTACT_TYPES = [
  "Call",
  "Viber/WhatsApp",
  "Showroom visit",
  "Home visit",
  "SMS",
  "Email",
  "Meeting",
];

// What "Log" offers. Email/Meeting still exist on historical rows, just not as
// a fresh choice when recording an outcome.
export const LOG_CONTACT_TYPES = [
  "Call",
  "Viber/WhatsApp",
  "Showroom visit",
  "Home visit",
  "SMS",
];

const WORKING_HOUR_START = 9;
const WORKING_HOUR_END = 18;

const pad = (n: number) => String(n).padStart(2, "0");

export const toDateString = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const toTimeString = (d: Date) =>
  `${pad(d.getHours())}:${pad(d.getMinutes())}`;

// "YYYY-MM-DD" -> local-midnight Date. `new Date("YYYY-MM-DD")` parses as UTC,
// which lands on the previous day for any zone west of UTC.
export const parseDateString = (value: string): Date => {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

export const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const addDays = (d: Date, days: number) => {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const formatClock = (d: Date) => {
  const h = d.getHours();
  return `${h % 12 || 12}:${pad(d.getMinutes())} ${h < 12 ? "AM" : "PM"}`;
};

// "D MMM"
export const formatDayMonth = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;

// "D MMM YYYY, h:mm A"
export const formatFullDateTime = (value: string | Date) => {
  const d = typeof value === "string" ? new Date(value) : value;
  return `${formatDayMonth(d)} ${d.getFullYear()}, ${formatClock(d)}`;
};

// "D MMM, h:mm A"
export const formatShortDateTime = (value: string | Date) => {
  const d = typeof value === "string" ? new Date(value) : value;
  return `${formatDayMonth(d)}, ${formatClock(d)}`;
};

// A pending row's due label in the Log banner: "today 3:00 PM" or "5 Nov, 3:00 PM".
export const formatDueLabel = (dueDate: string) => {
  const due = new Date(dueDate);
  return isSameDay(due, new Date())
    ? `today ${formatClock(due)}`
    : formatShortDateTime(due);
};

// Due subtext for a pending, not-yet-overdue row: "in 1 hour" close in,
// "today" for later the same day, "in N days" otherwise.
export function formatRelativeDue(dueDateStr: string): string {
  const due = new Date(dueDateStr);
  const now = new Date();
  if (isSameDay(due, now)) {
    const diffHours = Math.floor((due.getTime() - now.getTime()) / 3_600_000);
    if (diffHours <= 1) return diffHours <= 0 ? "soon" : "in 1 hour";
    if (diffHours < 6) return `in ${diffHours} hours`;
    return "today";
  }
  const diffDays = daysBetween(startOfDay(now), startOfDay(due));
  return `in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
}

// Whole calendar days from `from` to `to` (both at local midnight). Rounded so a
// DST shift's 23/25-hour day still counts as one.
export const daysBetween = (from: Date, to: Date) =>
  Math.round((to.getTime() - from.getTime()) / 86_400_000);

// Default due date/time for a new schedule: the inquiry kind's first-followup
// offset (a day if the kind has none, matching the backend's own fallback),
// rounded up to the next whole hour and clamped into working hours.
export function computeDefaultScheduleDueDateTime(
  offsetMinutes: number | null | undefined,
): { date: string; time: string } {
  const due = new Date(Date.now() + (offsetMinutes ?? 1440) * 60_000);
  if (due.getMinutes() !== 0 || due.getSeconds() !== 0) {
    due.setMinutes(0, 0, 0);
    due.setHours(due.getHours() + 1);
  }
  if (due.getHours() < WORKING_HOUR_START) {
    due.setHours(WORKING_HOUR_START, 0, 0, 0);
  } else if (due.getHours() >= WORKING_HOUR_END) {
    due.setDate(due.getDate() + 1);
    due.setHours(WORKING_HOUR_START, 0, 0, 0);
  }
  return { date: toDateString(due), time: toTimeString(due) };
}

// "14:00" -> "2:00 PM"
export const formatTime24 = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${pad(m ?? 0)} ${h < 12 ? "AM" : "PM"}`;
};
