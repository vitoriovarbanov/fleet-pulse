import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = tseslint.config(
  // Next.js recommended rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // TypeScript strict rules
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // Type imports - cleaner imports
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],

      // Unused vars - allow underscore prefix
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      // Prevent floating promises (catches async bugs)
      "@typescript-eslint/no-floating-promises": "error",

      // No any - enforce type safety
      "@typescript-eslint/no-explicit-any": "error",

      // Prefer nullish coalescing over ||
      "@typescript-eslint/prefer-nullish-coalescing": "warn",

      // Consistent type definitions
      "@typescript-eslint/consistent-type-definitions": ["warn", "type"],

      // No misused promises in attributes
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: { attributes: false },
        },
      ],
    },
  },

  // General JavaScript/TypeScript rules
  {
    rules: {
      // Prevent common bugs
      "no-duplicate-imports": "error",
      "no-self-compare": "error",
      eqeqeq: "error",

      // Code style
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-template": "error",
      "no-unneeded-ternary": "error",
      "no-else-return": "error",
      "no-lonely-if": "error",

      // Console warnings (use logger instead)
      "no-console": "warn",
    },
  },

  // React rules
  {
    files: ["**/*.tsx"],
    rules: {
      // Key prop in lists
      "react/jsx-key": "error",

      // Security
      "react/jsx-no-target-blank": "error",

      // Performance
      "react/no-array-index-key": "warn",

      // Hooks
      "react/hook-use-state": "error",

      // Accessibility
      "react/button-has-type": "error",
    },
  },

  // Ignore patterns
  {
    ignores: [".next/**", "out/**", "build/**", "node_modules/**"],
  }
);

export default eslintConfig;
