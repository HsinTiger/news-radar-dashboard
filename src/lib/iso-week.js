// ISO 8601 week calculation helper
export function getISOWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export function getISOWeekString(date = new Date()) {
  const year = date.getFullYear();
  const week = getISOWeek(date);
  const weekPad = String(week).padStart(2, "0");
  return `${year}-W${weekPad}`;
}
