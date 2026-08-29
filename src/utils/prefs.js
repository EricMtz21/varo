const YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

// Las preferencias de interfaz (tema, pestaña) viven en cookie y no en
// localStorage para que el servidor pueda pintar la vista correcta desde el
// primer render. El script de arranque en layout.js lee estas mismas cookies.
export function writePref(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${YEAR_IN_SECONDS}; samesite=lax`;
}
