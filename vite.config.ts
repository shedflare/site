import { cloudflare } from "@cloudflare/vite-plugin";
import { antiSlopFmt, antiSlopLint } from "./anti-slop.vite.ts";
import solid from "vite-plugin-solid";

export default {
  plugins: [solid(), ...(process.env.VITEST ? [] : [cloudflare()])],
  server: {
    allowedHosts: true,
  },
  staged: {
    "*": "vp check --fix",
  },
  lint: { ...antiSlopLint, options: { typeAware: true, typeCheck: true } },
  fmt: antiSlopFmt,
};
