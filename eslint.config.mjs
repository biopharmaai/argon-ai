import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:prettier/recommended", // Prettier plugin with recommended settings
  ),
  {
    settings: {
      "import/resolver": {
        typescript: {
          // Uses tsconfig.json to resolve imports
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
      "import/no-unresolved": "error", // Ensure imports resolve correctly
    },
  },
];

export default eslintConfig;
