import dayjs from 'dayjs';
import calendarPlugin from 'dayjs/plugin/calendar';
import * as Clipboard from 'expo-clipboard';
import { randomUUID } from 'expo-crypto';

export function sortedArrayString(items: string[]) {
  return items.sort().join('');
}

export function getRandomId(): string {
  return randomUUID().replace(/-/g, '');
}

export async function copyToClipboard(data: string) {
  await Clipboard.setStringAsync(data);
}

export function isoStringToCalender(isoString: string): string {
  dayjs.extend(calendarPlugin);
  const result = dayjs(isoString).calendar(null, {
    sameDay: '[Today], h:mm A',
    nextDay: '[Tomorrow], h:mm A',
    lastDay: '[Yesterday], h:mm A',
    nextWeek: 'dddd, h:mm A',
    lastWeek: 'dddd, h:mm A',
    sameElse: 'YYYY-MM-DD',
  });
  return result;
}
