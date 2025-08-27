/**
 * Guard all admin API routes by wrapping exported HTTP handlers
 * in a withAdmin(...) check.
 *
 * Targets: app/api/admin/**/route.{ts,tsx,js,jsx}
 *
 * What it does (idempotent):
 *  - Inserts:   import { withAdmin } from '@/lib/with-admin'
 *  - Rewrites:
 *      export async function GET(...)  -> async function __orig_GET(...); export const GET = withAdmin(__orig_GET)
 *      export function GET(...)        -> function __orig_GET(...);      export const GET = withAdmin(__orig_GET)
 *      export const GET[:type] = ...   -> const __orig_GET[:type] = ...; export const GET = withAdmin(__orig_GET)
 *    (and the same for POST, PUT, PATCH, DELETE, OPTIONS, HEAD)
 *  - If a file already looks guarded (contains withAdmin( ) or ADMIN_GUARDED), it’s skipped.
 */

import fs from "node:fs/promises";
import path from "node:path";
import globby from "globby";

const HTTP_VERBS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];

// CHANGE THIS IF YOUR GUARD LIVES ELSEWHERE:
const GUARD_IMPORT_SOURCE = "@/lib/with-admin";
const GUARD_IMPORT_NAME = "withAdmin";

// Files to target
const PATTERN = "app/api/admin/**/route.@(ts|tsx|js|jsx)";

// Simple marker so we don’t re-edit files repeatedly
const MARKER = "/* ADMIN_GUARDED */";

function alreadyGuarded(source) {
  return source.includes(MARKER) || source.includes(`${GUARD_IMPORT_NAME}(`);
}

function ensureGuardImport(source) {
  // Skip if already imported
  const importRegex = new RegExp(
    `from\\s+['"]${escapeRegExp(GUARD_IMPORT_SOURCE)}['"]`
  );
  if (importRegex.test(source)) return source;

  const lines = source.split(/\r?\n/);

  // Find last import line to append after; keep "use client"/"use server" at very top
  let lastImportIdx = -1;
  let directiveBlockEnd = -1;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // capture top directives
    if (
      directiveBlockEnd === -1 &&
      (trimmed === '"use client"' ||
        trimmed === "'use client'" ||
        trimmed === '"use server"' ||
        trimmed === "'use server'")
    ) {
      directiveBlockEnd = i;
      continue;
    }
    // track imports
    if (trimmed.startsWith("import ")) {
      lastImportIdx = i;
    }
    // first non-import, non-directive line
    if (
      lastImportIdx !== -1 &&
      trimmed &&
      !trimmed.startsWith("import ")
    ) {
      break;
    }
  }

  const importLine = `import { ${GUARD_IMPORT_NAME} } from '${GUARD_IMPORT_SOURCE}';`;

  if (lastImportIdx >= 0) {
    lines.splice(lastImportIdx + 1, 0, importLine);
  } else if (directiveBlockEnd >= 0) {
    lines.splice(directiveBlockEnd + 1, 0, importLine);
  } else {
    lines.unshift(importLine);
  }

  return lines.join("\n");
}

function wrapHandlers(source) {
  let changed = false;
  let updated = source;

  for (const verb of HTTP_VERBS) {
    // 1) export async function VERB(...)
    {
      const re = new RegExp(
        // export [async ] function VERB(
        `export\\s+(async\\s+)?function\\s+${verb}\\s*\\(`,
        "g"
      );
      if (re.test(updated)) {
        updated = updated.replace(
          re,
          (_m, asyncKw) => `${asyncKw || ""}function __orig_${verb}(`,
        );
        updated += `\nexport const ${verb} = ${GUARD_IMPORT_NAME}(__orig_${verb});`;
        changed = true;
      }
    }

    // 2) export function VERB(...)
    {
      const re = new RegExp(
        `export\\s+function\\s+${verb}\\s*\\(`,
        "g"
      );
      if (re.test(updated)) {
        updated = updated.replace(
          re,
          () => `function __orig_${verb}(`,
        );
        updated += `\nexport const ${verb} = ${GUARD_IMPORT_NAME}(__orig_${verb});`;
        changed = true;
      }
    }

    // 3) export const VERB[:type]? =
    {
      const re = new RegExp(
        `export\\s+(const|let|var)\\s+${verb}(\\s*:[^=]+)?\\s*=`,
        "g"
      );
      if (re.test(updated)) {
        updated = updated.replace(
          re,
          (_m, decl, typeAnno = "") => `${decl} __orig_${verb}${typeAnno} =`,
        );
        updated += `\nexport const ${verb} = ${GUARD_IMPORT_NAME}(__orig_${verb});`;
        changed = true;
      }
    }

    // 4) export { VERB } — leave these alone (can’t rewrite cleanly by regex)
  }

  return { updated, changed };
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function main() {
  const cwd = process.cwd();
  const files = await globby(PATTERN, { cwd });

  if (!files.length) {
    console.log(`No admin route files matched pattern: ${PATTERN}`);
    return;
  }

  let editedCount = 0;

  for (const rel of files) {
    const filePath = path.join(cwd, rel);
    let source = await fs.readFile(filePath, "utf8");

    if (alreadyGuarded(source)) {
      console.log(`SKIP (already guarded): ${rel}`);
      continue;
    }

    const pre = source;

    // Ensure guard import
    source = ensureGuardImport(source);

    // Wrap handlers
    const { updated, changed } = wrapHandlers(source);
    source = updated;

    if (changed) {
      // Append marker to indicate we processed this file
      if (!source.includes(MARKER)) {
        source = `${source}\n${MARKER}\n`;
      }
      await fs.writeFile(filePath, source, "utf8");
      editedCount++;
      console.log(`OK   (guarded): ${rel}`);
    } else {
      // If nothing matched, restore original
      source = pre;
      console.log(`SKIP (no handlers found): ${rel}`);
    }
  }

  console.log(`\nDone. Guarded ${editedCount} file(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
