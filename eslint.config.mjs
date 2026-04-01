import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";
import js from "@eslint/js";
import jest from "eslint-plugin-jest";

const eslintConfig = defineConfig([
  js.configs.recommended,
  ...nextVitals,
  prettier,
  {
    files: ["**/*.test.js", "**/*.test.ts", "**/*.spec.js", "**/*.spec.ts"],
    languageOptions: {
      globals: jest.environments.globals.globals,
    },
    plugins: { jest: jest },
    rules: jest.configs.recommended.rules,
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
