export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Erro inesperado no servidor';
}

export function isMissingColumnError(error: unknown) {
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message?: unknown }).message).toLowerCase()
      : '';

  return (
    message.includes('column') ||
    message.includes('schema cache') ||
    message.includes('could not find') ||
    message.includes('does not exist')
  );
}
