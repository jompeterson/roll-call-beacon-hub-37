export const SPLASH_ENTRY_KEY = "roll-call-entered";

export function shouldShowSplash(isSignedIn: boolean, hasEntered: boolean): boolean {
  return !isSignedIn && !hasEntered;
}