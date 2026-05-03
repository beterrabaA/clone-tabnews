import { DatabaseStatus } from "@/components/DatabaseStatus";
import { UpdatedAt } from "@/components/UpdatedAt";
import webserver from "@/infra/webserver";

export default function StatusPage({ data }) {
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

export async function getServerSideProps() {
  const response = await fetch(`${webserver.getOrigin}/api/v1/status`);
  const data = await response.json();
  return {
    props: {
      data,
    },
  };
}
