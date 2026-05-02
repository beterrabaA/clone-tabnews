import { execSync, spawn } from "child_process";
import { log } from "console";

try {
  log("🚀 Iniciando aplicação...");
  process.stdin.resume();

  // Run setup steps sequentially and synchronously
  execSync("npm run services:up", { stdio: "inherit" });
  execSync("npm run services:wait:database", { stdio: "inherit" });
  execSync("npm run migration:up", { stdio: "inherit" });

  // Start Next.js dev server as a long-running process
  const nextProcess = spawn("next", ["dev"], { stdio: "inherit" });

  nextProcess.on("error", (error) => {
    console.error("❌ Erro ao iniciar Next.js", error);
    process.exit(1);
  });

  nextProcess.on("close", (code) => {
    console.log(`Next.js encerrado com código ${code}`);
    execSync("npm run services:stop", { stdio: "inherit" });
    process.exit(code);
  });

  process.on("SIGINT", () => {
    console.log("Received SIGINT. Cleaning up...");
    nextProcess.emit("close", 0);
  });

  process.on("SIGTERM", () => {
    console.log("Received SIGTERM. Cleaning up...");
    nextProcess.emit("close", 0);
  });

  process.on("exit", () => {
    console.log("Saindo...");
    nextProcess.kill();
  });
} catch (error) {
  console.error("❌ Erro ao inicializar aplicação", error);
  process.exit(1);
}
