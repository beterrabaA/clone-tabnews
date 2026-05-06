import { DatabaseStatus } from "@/components/DatabaseStatus";
import { UpdatedAt } from "@/components/UpdatedAt";
import { fetchStatus } from "@/lib/actions";

export default async function StatusPage() {
  const data = await fetchStatus();
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
