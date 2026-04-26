import { parse } from 'csv-parse/sync'

export interface CsvUser {
  name: string
  email: string
}

export function parseCsvUsers(buffer: Buffer): CsvUser[] {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[]

  return records.map(row => {
    const nameKey = Object.keys(row).find(k => k.toLowerCase() === 'name')
    const emailKey = Object.keys(row).find(k => k.toLowerCase() === 'email')
    return {
      name: nameKey ? row[nameKey] : '',
      email: emailKey ? row[emailKey].toLowerCase() : '',
    }
  }).filter(u => u.name && u.email)
}
