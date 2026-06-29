import type { CatalogEntry } from "./types.js";

export interface GetCatalogOptions {
  /** API base URL */
  baseUrl?: string;
  /** Optional domain filter */
  domain?: string;
}

function defaultBase(): string {
  if (typeof process !== "undefined" && process.env["NEXT_PUBLIC_API_URL"]) {
    return process.env["NEXT_PUBLIC_API_URL"];
  }
  return "http://localhost:3001";
}

/**
 * Fetch the metric catalog from the API.
 * Returns all entries or filters by domain when provided.
 */
export async function getCatalog(opts: GetCatalogOptions = {}): Promise<CatalogEntry[]> {
  const base = opts.baseUrl ?? defaultBase();
  const path = opts.domain
    ? `/catalog?domain=${encodeURIComponent(opts.domain)}`
    : "/catalog";
  const res = await fetch(`${base}${path}`);
  if (!res.ok) {
    throw new Error(`getCatalog failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<CatalogEntry[]>;
}
