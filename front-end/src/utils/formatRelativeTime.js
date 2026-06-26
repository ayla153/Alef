export function formatRelativeTime(timestamp) {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(seconds / 3600);
  const days = Math.floor(seconds / 86400);

  if (seconds < 60) {
    return `منذ ${seconds} ث${seconds === 1 ? 'انية' : 'وان'}`;
  }
  if (minutes < 60) {
    return `منذ ${minutes} د${minutes === 1 ? 'قيقة' : 'قائق'}`;
  }
  if (hours < 24) {
    return `منذ ${hours} س${hours === 1 ? 'اعة' : 'اعات'}`;
  }
  if (days < 7) {
    return `منذ ${days} ي${days === 1 ? 'وم' : 'يام'}`;
  }

  return date.toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
