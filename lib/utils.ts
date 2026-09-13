export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

const shortDateFormatter = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
});

export function formatShortDate(isoDate: string): string {
  return shortDateFormatter.format(new Date(`${isoDate}T00:00:00`));
}
