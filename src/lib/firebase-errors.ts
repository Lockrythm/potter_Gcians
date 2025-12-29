export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export function isFirestoreServiceDisabled(err: unknown): boolean {
  const msg = getErrorMessage(err);
  return (
    msg.includes('SERVICE_DISABLED') ||
    msg.includes('Cloud Firestore API has not been used') ||
    msg.includes('firestore.googleapis.com/overview')
  );
}

export function friendlyFirestoreError(err: unknown, fallback: string): string {
  if (isFirestoreServiceDisabled(err)) {
    return 'Firestore is disabled for this Firebase project. Enable Firestore (Firebase Console → Build → Firestore Database) or enable the “Cloud Firestore API”, then refresh.';
  }

  const msg = getErrorMessage(err);
  // Common Firebase SDK surface area
  if (msg.toLowerCase().includes('permission') || msg.includes('PERMISSION_DENIED')) {
    return 'Permission denied by Firestore. Check Firestore is enabled and your Firestore security rules allow this action.';
  }

  return fallback;
}
