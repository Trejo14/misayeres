// Formateo de fechas para mostrar en el panel. El servidor envia las columnas
// DATE como 'YYYY-MM-DD' y los TIMESTAMP como ISO; ambos se muestran en es-MX.

export function formatDate(value) {
  if (!value) return '-';
  const str = String(value);
  // 'YYYY-MM-DD' se interpreta como fecha local para no correrse un dia.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(str)
    ? new Date(`${str}T00:00:00`)
    : new Date(str);
  if (Number.isNaN(date.getTime())) return str;
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function formatTime(value) {
  return value ? String(value).slice(0, 5) : '-';
}

export function formatPrice(value) {
  return `$${parseFloat(value || 0).toFixed(2)}`;
}

function toISO(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO() {
  return toISO(new Date());
}

export function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

// Lunes de la semana a la que pertenece la fecha.
export function weekStartISO(iso = todayISO()) {
  const d = new Date(`${iso}T00:00:00`);
  return addDays(iso, -((d.getDay() + 6) % 7));
}

// Las 7 fechas de la semana que empieza en `desde`.
export function weekDays(desde) {
  return Array.from({ length: 7 }, (_, i) => addDays(desde, i));
}

export function formatWeekday(iso) {
  const nombre = new Date(`${iso}T00:00:00`).toLocaleDateString('es-MX', { weekday: 'long' });
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

export function formatDayMonth(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

export const ROLE_LABELS = { dueno: 'Dueño', admin: 'Administrador', empleado: 'Empleado' };
