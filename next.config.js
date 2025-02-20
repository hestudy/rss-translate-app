/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import { codeInspectorPlugin } from "code-inspector-plugin";
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  webpack: (config, { dev, isServer }) => {
    config.plugins.push(codeInspectorPlugin({ bundler: "webpack" }));

    return config;
  },
  experimental: {
    turbo: {},
  },
};

export default config;
