/* scripts/guard-admin-routes.mjs
 * Wraps all exported HTTP handlers in /app/api/admin/**/route.{ts,tsx,js,jsx}
 * with requireAdmin(...) and injects the import from "@/lib/server-guards".
 */

import fs from "fs"
import path from "path"
import { globby } from "globby"
import recast from "recast"
import * as babelParser from "@babel/parser"

const HTTP_EXPORTS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])

const parser = {
  parse(code) {
    return babelParser.parse(code, {
      sourceType: "module",
      plugins: [
        "typescript",
        "jsx",
        "decorators-legacy",
        "classProperties",
        "exportDefaultFrom",
        "exportNamespaceFrom",
        "topLevelAwait",
      ],
    })
  },
}

function hasAdminWrapOrImport(ast) {
  let has = false
  recast.types.visit(ast, {
    visitIdentifier(p) {
      if (p.node.name === "requireAdmin" || p.node.name === "withAdminRoute") {
        has = true
        return false
      }
      this.traverse(p)
    },
  })
  return has
}

function ensureImport(ast) {
  const b = recast.types.builders
  const body = ast.program.body
  const already = body.find(
    (n) =>
      n.type === "ImportDeclaration" &&
      n.source.value === "@/lib/server-guards" &&
      n.specifiers.some((s) => s.imported && s.imported.name === "requireAdmin")
  )
  if (already) return

  const importDecl = b.importDeclaration(
    [b.importSpecifier(b.identifier("requireAdmin"))],
    b.stringLiteral("@/lib/server-guards")
  )

  let lastImportIdx = -1
  for (let i = 0; i < body.length; i++) {
    if (body[i].type === "ImportDeclaration") lastImportIdx = i
  }
  if (lastImportIdx >= 0) body.splice(lastImportIdx + 1, 0, importDecl)
  else body.unshift(importDecl)
}

function wrapFunctionDeclaration(pathNode, name) {
  const b = recast.types.builders
  const func = pathNode.node.declaration
  if (!func || func.type !== "FunctionDeclaration") return false
  if (!func.id || func.id.name !== name) return false

  const fnExpr = b.functionExpression(func.id, func.params, func.body, func.generator, func.async)
  fnExpr.returnType = func.returnType || null
  fnExpr.typeParameters = func.typeParameters || null

  const call = b.callExpression(b.identifier("requireAdmin"), [fnExpr])

  const decl = b.variableDeclaration("const", [
    b.variableDeclarator(b.identifier(name), call),
  ])
  const exported = b.exportNamedDeclaration(decl, [])
  recast.types.replaceWith(pathNode, exported)
  return true
}

function wrapVariableExport(pathNode, name) {
  const b = recast.types.builders
  const decl = pathNode.node.declaration
  if (!decl || decl.type !== "VariableDeclaration") return false
  const d = decl.declarations.find(
    (v) => v.id && v.id.type === "Identifier" && v.id.name === name
  )
  if (!d || !d.init) return false

  if (d.init.type === "CallExpression" && d.init.callee.name === "requireAdmin") return false

  d.init = b.callExpression(b.identifier("requireAdmin"), [d.init])
  return true
}

function transformFile(file) {
  const code = fs.readFileSync(file, "utf8")
  const ast = recast.parse(code, { parser })

  let changed = false

  if (!hasAdminWrapOrImport(ast)) {
    ensureImport(ast)
    changed = true
  }

  recast.types.visit(ast, {
    visitExportNamedDeclaration(p) {
      const node = p.node

      // export async function GET(...) {}
      if (
        node.declaration &&
        node.declaration.type === "FunctionDeclaration" &&
        node.declaration.id &&
        HTTP_EXPORTS.has(node.declaration.id.name)
      ) {
        const ok = wrapFunctionDeclaration(p, node.declaration.id.name)
        if (ok) changed = true
        return false
      }

      // export const GET = ...
      if (node.declaration && node.declaration.type === "VariableDeclaration") {
        const names = node.declaration.declarations
          .map((d) => (d.id && d.id.type === "Identifier" ? d.id.name : null))
          .filter(Boolean)

        for (const n of names) {
          if (HTTP_EXPORTS.has(n)) {
            const ok = wrapVariableExport(p, n)
            if (ok) changed = true
          }
        }
      }

      this.traverse(p)
    },
  })

  if (changed) {
    const output = recast.print(ast, { quote: "double" }).code
    fs.writeFileSync(file, output, "utf8")
    return true
  }
  return false
}

async function main() {
  const pattern = [
    "app/api/admin/**/route.ts",
    "app/api/admin/**/route.tsx",
    "app/api/admin/**/route.js",
    "app/api/admin/**/route.jsx",
  ]
  const files = await globby(pattern, { gitignore: true })
  if (files.length === 0) {
    console.log("No admin route files found.")
    return
  }

  let touched = 0
  for (const f of files) {
    try {
      if (transformFile(f)) {
        touched++
        console.log("Wrapped:", f)
      } else {
        console.log("No change:", f)
      }
    } catch (e) {
      console.error("Failed:", f, "\n", e.message)
    }
  }

  console.log(`\nDone. Updated ${touched}/${files.length} files.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
