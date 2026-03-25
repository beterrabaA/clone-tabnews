import nextJest from "next/jest.js";
import dotenv from "dotenv";

dotenv.config({
  path: ".env.development",
});

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: ".",
  moduleDirectories: ["node_modules", "<rootDir>"],
});

// Add any custom config to be passed to Jest
const config = {
  coverageProvider: "v8",
  testTimout: 10000,
  // testEnvironment: "jsdom",
  // Add more setup options before each test is run
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
