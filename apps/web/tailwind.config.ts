import type { Config } from "tailwindcss";
import { jemonPreset } from "@jemon/ui/preset";

const config: Config = {
  presets: [jemonPreset as unknown as Config],
  content: [
    "./src/**/*.{ts,tsx}",
    // Include ui package source so Tailwind picks up classes used there
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  plugins: [],
};

export default config;
