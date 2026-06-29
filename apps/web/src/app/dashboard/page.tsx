import { DashboardClient } from "./DashboardClient";
import { getCatalog } from "@jemon/metric-sdk/catalog";
import type { CatalogEntry } from "@jemon/metric-sdk";

// Always render at request-time so the static build doesn't attempt to
// pre-render this page when the API may not be reachable.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let catalog: CatalogEntry[] = [];
  try {
    catalog = await getCatalog();
  } catch {
    // API unavailable — dashboard shows graceful empty state
  }

  return <DashboardClient catalog={catalog} />;
}
