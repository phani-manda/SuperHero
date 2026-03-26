import type { CharityEvent } from '@/types/database';

export function parseMediaInput(raw: string) {
  return raw
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function stringifyMediaInput(items: string[] | null | undefined) {
  return (items || []).join('\n');
}

export function parseEventsInput(raw: string): CharityEvent[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [date = '', title = '', description = '', link_url = ''] = line.split('|').map((part) => part.trim());
      return {
        date,
        title,
        description,
        link_url: link_url || null,
      };
    })
    .filter((event) => event.date && event.title && event.description);
}

export function stringifyEventsInput(events: CharityEvent[] | null | undefined) {
  return (events || [])
    .map((event) => [event.date, event.title, event.description, event.link_url || ''].join(' | '))
    .join('\n');
}
