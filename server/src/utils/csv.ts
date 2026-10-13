export const parseCsv = (input: string): Record<string, string>[] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const next = input[index + 1];
    if (character === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(value);
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = '';
    } else {
      value += character;
    }
  }

  if (value || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  const headers = rows.shift()?.map(header => header.trim()) ?? [];
  return rows
    .filter(columns => columns.some(column => column.trim() !== ''))
    .map(columns => Object.fromEntries(headers.map((header, index) => [header, columns[index]?.trim() ?? ''])));
};

export const toCsv = (rows: Record<string, unknown>[], headers: string[]) => {
  const escape = (value: unknown) => {
    const text = value === null || value === undefined ? '' : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  return [headers.join(','), ...rows.map(row => headers.map(header => escape(row[header])).join(','))].join('\r\n');
};
