export function safeParseFieldString(
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
): string {
  return e.target.value;
}
