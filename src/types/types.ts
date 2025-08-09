export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type Hour = number; // 0 - 23

type Interval = {
	nightStartHour: Hour;
	nightEndHour: Hour;
}

export interface ShutdownConfig {
	"weekends": Interval,
	"weekdays": Interval
}

export interface TimeApiResponse {
  year: number;
  month: number; // 1–12
  day: number;   // 1–31
  hour: number;  // 0–23
  minute: number; // 0–59
  seconds: number; // 0–59
  milliSeconds: number; // 0–999
  dateTime: string; // ISO-8601, e.g. '2025-08-07T19:17:54.1701737'
  date: string; // e.g. '08/07/2025'
  time: string; // e.g. '19:17'
  timeZone: string; // IANA TZ name, e.g. 'Europe/Paris'
  dayOfWeek: Day;
  dstActive: boolean;
}
