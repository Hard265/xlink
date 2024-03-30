import * as Clipboard from 'expo-clipboard';

export function sortedArrayString(items: string[]) {
  return items.sort().join('');
}

export async function copyToClipboard(data: string) {
  await Clipboard.setStringAsync(data);
}
