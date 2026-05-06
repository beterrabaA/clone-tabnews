export const dynamic = "force-dynamic";

import { DatabaseStatus } from "@/components/DatabaseStatus";
import { UpdatedAt } from "@/components/UpdatedAt";

export default async function StatusPage() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/v1/status`,
  );
  const data = await response.json();
  return (
    <div>
      <h1>Status</h1>
      <UpdatedAt timestamp={data.updated_at} />
      <DatabaseStatus
        version={data.dependencies.database.version}
        maxConnections={data.dependencies.database.max_connections}
        openConnections={data.dependencies.database.opened_connections}
      />
    </div>
  );
}
