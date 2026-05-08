// Format observed in real traffic:
//   number — 16 digits, no spaces (e.g. "4444123456789012")
//   date   — "M:YY" or "MM:YY" (month 1-based, year 2-digit)
//   name   — uppercase
//   cvv    — 3-digit string
export interface CardDetails {
  number: string;
  date: string;
  name: string;
  cvv: string;
}
