import { createSystem, defaultConfig } from "@chakra-ui/react";

export const system = createSystem(defaultConfig, {
  theme: {
    semanticTokens: {
      colors: {
        "text.primary": { value: "{colors.gray.700}" },
        "text.secondary": { value: "{colors.gray.500}" },
      },
    },
    tokens: {
      colors: {
        brand: {
          50: { value: "#e3f2ff" },
          100: { value: "#b3daff" },
          200: { value: "#81c2ff" },
          300: { value: "#4faaff" },
          400: { value: "#1d92ff" },
          500: { value: "#0077e6" },
          600: { value: "#005bb4" },
          700: { value: "#004182" },
          800: { value: "#002750" },
          900: { value: "#00101f" },
        },

        // ✅ These must NOT be nested under "colors.colors"
        background: { value: "{colors.gray.50}" },
        foreground: { value: "{colors.gray.800}" },
      },

      fonts: {
        heading: { value: `'Figtree', sans-serif` },
        body: { value: `'Figtree', sans-serif` },
      },

      radii: {
        sm: { value: "4px" },
        md: { value: "8px" },
        lg: { value: "12px" },
        xl: { value: "16px" },
      },

      shadows: {
        sm: { value: "0 1px 2px rgba(0,0,0,0.05)" },
        md: { value: "0 4px 6px rgba(0,0,0,0.1)" },
        lg: { value: "0 10px 15px rgba(0,0,0,0.15)" },
      },
    },
    recipes: {
      button: {
        base: {
          borderRadius: "md",
          fontWeight: "semibold",
        },
      },
    },
  },
});
