import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import { physicalName } from "@shedflare/alchemy";
import * as Effect from "effect/Effect";
import { loadDeployConfig } from "./deploy/config.ts";

export const SiteStack = Alchemy.Stack(
  "ShedflareSite",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage;
    const config = loadDeployConfig();
    const production = stage === "prod";

    const worker = yield* Cloudflare.Worker("SiteWorker", {
      name: physicalName(stage, "site"),
      main: "src/worker.ts",
      assets: "dist",
      compatibility: {
        date: "2026-05-16",
        flags: ["nodejs_compat"],
      },
      observability: {
        enabled: true,
        headSamplingRate: 1,
      },
      url: !production,
      domain: production ? [...config.domains] : undefined,
    });

    return {
      app: "site" as const,
      url: worker.url ?? `https://${config.domains[0]}`,
      domains: config.domains,
      workerName: worker.workerName,
    };
  }),
);

export default SiteStack;
