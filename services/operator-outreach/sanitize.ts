export function sanitizeDisplayName(value: string | undefined): string {
  const cleaned = (value || 'Node operator')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 80);
  return cleaned || 'Node operator';
}
