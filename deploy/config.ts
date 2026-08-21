import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseJsonc } from "jsonc-parser";
import { array, minLength, object, optional, parse, pipe, string, trim } from "valibot";

type ConfigFile = { readonly domains?: readonly string[] };
export type DeployConfig = { readonly domains: readonly [string, ...string[]] };

const ConfigFileSchema = object({ domains: optional(array(pipe(string(), trim(), minLength(1)))) });

function loadConfigFile(): ConfigFile {
  const path = resolve("shedflare.config.jsonc");
  if (!existsSync(path)) return {};
  return parse(
    ConfigFileSchema,
    parseJsonc(readFileSync(path, "utf8"), undefined, {
      allowTrailingComma: true,
      disallowComments: false,
    }),
  ) satisfies ConfigFile;
}

function domains(value: readonly string[] | undefined): readonly [string, ...string[]] {
  const [firstDomain, ...remainingDomains] = value ?? [];
  if (firstDomain === undefined)
    throw new Error("CONFIG_INVALID: domains must be a non-empty array");
  function normalizeDomain(domain: string) {
    const normalized = domain.trim().toLowerCase();
    const url = new URL(`https://${normalized}`);
    if (url.hostname !== normalized || url.pathname !== "/") {
      throw new Error(`CONFIG_INVALID: invalid domain ${domain}`);
    }
    return normalized;
  }
  return [normalizeDomain(firstDomain), ...remainingDomains.map(normalizeDomain)];
}

export function loadDeployConfig(): DeployConfig {
  const file = loadConfigFile();
  const environmentDomains = process.env.SHEDFLARE_SITE_DOMAIN?.split(",");
  return { domains: domains(environmentDomains ?? file.domains) };
}
