export function csvCell(value: string) {
  // Quoting alone does not stop spreadsheets from evaluating formulas.
  const safe = /^[\s\u0000-\u001f]*[=+@-]/u.test(value) || /^[\t\r\n]/u.test(value)
    ? `'${value}`
    : value
  return `"${safe.replaceAll('"', '""')}"`
}
