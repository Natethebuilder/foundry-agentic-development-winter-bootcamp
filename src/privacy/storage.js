// Earlier versions of the site kept these keys in localStorage, where they outlived the browser
// session. The site now keeps that state in sessionStorage, so remove any copies left behind.
const RETIRED_LOCAL_STORAGE_KEYS = ['deck-navbar-dismissed', 'foundry-agentic-development-winter-bootcamp:prep']

export function removeRetiredLocalStorage() {
  try {
    RETIRED_LOCAL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
  } catch {
    // Storage is unavailable, so nothing was left behind.
  }
}
