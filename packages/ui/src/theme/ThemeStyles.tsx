import { tokensCss } from "./tokens.js";

/**
 * Injects the jemon token CSS variables. Render once in the root layout,
 * before any dashboard content. Server-component safe.
 */
export function ThemeStyles() {
  return <style dangerouslySetInnerHTML={{ __html: tokensCss }} />;
}
