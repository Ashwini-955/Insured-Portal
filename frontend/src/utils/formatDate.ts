export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return Number.isNaN(d.getTime()) ? dateString : d.toLocaleDateString('en-US');
}
