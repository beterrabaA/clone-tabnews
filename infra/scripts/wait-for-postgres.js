import { exec } from "child_process";

const DATABASE_CONTAINER_NAME = "clone-tabnews-database-dev";

function checkPostgres() {
  exec(`docker exec ${DATABASE_CONTAINER_NAME} pg_isready`, handleReturn);

  function handleReturn(_error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(".");
      setTimeout(checkPostgres, 2000);
      return;
    }

    console.log("\n🟢 Database is ready and accepting connections\n");
  }
}

process.stdout.write("\n\n🔴 Waiting for Postgres to be ready...");
checkPostgres();
