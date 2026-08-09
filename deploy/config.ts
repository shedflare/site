import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "jsonc-parser";

type ConfigFile = { readonly domains?: unknown };
export type DeployConfig = { readonly domains: readonly [string, ...string[]] };

function loadConfigFile(): ConfigFile {
  const path = resolve("shedflare.config.jsonc");
  if (!existsSync(path)) return {};
  const parsed = parse(readFileSync(path, "utf8"), undefined, {
    allowTrailingComma: true,
    disallowComments: false,
  });
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("CONFIG_INVALID: shedflare.config.jsonc must contain an object");
  }
  return parsed as ConfigFile;
}

function domains(value: unknown): readonly [string, ...string[]] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("CONFIG_INVALID: domains must be a non-empty array");
  }
  const validated = value.map((domain) => {
    if (typeof domain !== "string" || domain.trim() === "") {
      throw new Error("CONFIG_INVALID: every domain must be a non-empty string");
    }
    const normalized = domain.trim().toLowerCase();
    const url = new URL(`https://${normalized}`);
    if (url.hostname !== normalized || url.pathname !== "/") {
      throw new Error(`CONFIG_INVALID: invalid domain ${domain}`);
    }
    return normalized;
  });
  return validated as [string, ...string[]];
}

export function loadDeployConfig(): DeployConfig {
  const file = loadConfigFile();
  const environmentDomains = process.env.SHEDFLARE_SITE_DOMAIN?.split(",");
  return { domains: domains(environmentDomains ?? file.domains) };
}
