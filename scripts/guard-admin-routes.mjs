// Guard all admin API routes by wrapping exported HTTP handlers in withAdmin(...).
// Targets pattern: app/api/admin/**/route.[ts|tsx|js|jsx]
// Idempotent: skips files that are already guarded.

import fs from "node:fs/promises";
import path from "node:path";
import globby from "globby";

const HTTP_VERBS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];
const GUARD_IMPORT_SOURCE = "@/lib/with-admin"; // change if your helper lives elsewhere
const GUARD_IMPORT_NAME = "withAdmin";
const PATTERN = "app/api/admin/**/route.@(ts|tsx|js|jsx)";
const MARKER = "/* ADMIN_GUARDED */";

function alreadyGuarded(source) {
  return source.includes(MARKER) || source.includes(`${GUARD_IMPORT_NAME}(`);
}

function ensureGuardImport(source) {
  const importRegex = new RegExp(`from\\s+['"]${escapeRegExp(GUARD_IMPORT_SOURCE)}['"]`);
  if (importRegex.test(source)) return source;

  const lines = source.split(/\r?\n/);
  let lastImportIdx = -1;
  let directiveBlockEnd = -1;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // capture "use client" / "use server" directives
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
    if (trimmed.startsWith("import ")) lastImportIdx = i;

    if (lastImportIdx !== -1 && trimmed && !trimmed.startsWith("import ")) break;
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
    // export async function VERB(...)
    {
      const re = new RegExp(`export\\s+(async\\s+)?function\\s+${verb}\\s*\\(`, "g");
      if (re.test(updated)) {
        updated = updated.replace(re, (_m, asyncKw) => `${asyncKw || ""}function __orig_${verb}(`);
        updated += `\nexport const ${verb} = ${GUARD_IMPORT_NAME}(__orig_${verb});`;
        changed = true;
      }
    }

    // export function VERB(...)
    {
      const re = new RegExp(`export\\s+function\\s+${verb}\\s*\\(`, "g");
      if (re.test(updated)) {
        updated = updated.replace(re, () => `function __orig_${verb}(`);
        updated += `\nexport const ${verb} = ${GUARD_IMPORT_NAME}(__orig_${verb});`;
        changed = true;
      }
    }

    // export const VERB[:type]? =
    {
      const re = new RegExp(`export\\s+(const|let|var)\\s+${verb}(\\s*:[^=]+)?\\s*=`, "g");
      if (re.test(updated)) {
        updated = updated.replace(re, (_m, decl, typeAnno = "") => `${decl} __orig_${verb}${typeAnno} =`);
        updated += `\nexport const ${verb} = ${GUARD_IMPORT_NAME}(__orig_${verb});`;
        changed = true;
      }
    }
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

    const original = source;

    source = ensureGuardImport(source);
    const { updated, changed } = wrapHandlers(source);
    source = updated;

    if (changed) {
      if (!source.includes(MARKER)) source = `${source}\n${MARKER}\n`;
      await fs.writeFile(filePath, source, "utf8");
      console.log(`OK   (guarded): ${rel}`);
      editedCount++;
    } else {
      // restore if no change
      source = original;
      console.log(`SKIP (no handlers found): ${rel}`);
    }
  }

  console.log(`Done. Guarded ${editedCount} file(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
