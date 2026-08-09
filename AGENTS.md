# Shedflare Site – Agent Guidance

This repository is the standalone public Shedflare project website. It must install, build, test, and deploy without another Shedflare checkout.

- Shared Shedflare dependencies must use released semver versions. Never commit `workspace:`, `file:`, `link:`, or sibling paths.
- Use non-production stages for deployment proofs; preview stages must not claim production custom domains.
- Do not change production resources or deploy to `prod` unless explicitly requested.
- Do not add `as any`; validate external inputs at their boundaries.
