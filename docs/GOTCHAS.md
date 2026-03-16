## Ambient `.d.ts` files can silently shadow your `node_modules` packages

### The problem

If you have a file like `vitest.d.ts` (or `vitest-temp.d.ts`, or any `<package-name>.d.ts`) at your project root, and it looks like this:

```typescript
declare module "vitest" {
    export interface ProvidedContext {
        // ...
    }
}
```

TypeScript may **completely ignore** the real `vitest` package in `node_modules` and use this file as the sole type definition for the module. You'll lose all the real exports (`describe`, `it`, `expect`, etc.) and only see whatever is declared in this file.

### Why it happens

TypeScript treats any file without a top-level `import` or `export` as a **script** (not a module). Inside a script, `declare module "X"` creates an **ambient module declaration** — it defines the entire module `"X"` from scratch rather than augmenting it.

Ambient module declarations are resolved by name, not by file path. So when TypeScript sees `import { describe } from "vitest"`, it finds the ambient `declare module "vitest"` and treats that as the authoritative definition. It never looks in `node_modules`.

This is the same mechanism that powers `declare module "fs"` in Node's built-in type definitions — it's intentional, just easy to trigger accidentally.

### Module augmentation vs ambient declaration

The difference comes down to whether the `.d.ts` file is a module or a script:

```typescript
// Script (no top-level import/export) → AMBIENT DECLARATION
// This REPLACES the module definition entirely
declare module "vitest" {
    export interface ProvidedContext {
        /* ... */
    }
}
```

```typescript
// Module (has a top-level import) → MODULE AUGMENTATION
// This EXTENDS the existing module definition
import "vitest";

declare module "vitest" {
    export interface ProvidedContext {
        /* ... */
    }
}
```

The `import "vitest"` at the top makes the file a module, which turns `declare module "vitest"` into an augmentation that merges with the real package types.

### How to avoid it

1. **Always include a top-level `import` or `export` in `.d.ts` files** that are meant to augment existing packages. Even a bare `export {}` is enough.
2. **Don't name `.d.ts` files after packages** unless you intend to define or augment them. A file named `vitest.d.ts` at the project root is an easy footgun.
3. **If types suddenly go missing** from a package you know is installed, check for stray `.d.ts` files with `declare module` that might be shadowing it.

### Relevant TypeScript docs

- [Modules — script vs module distinction](https://www.typescriptlang.org/docs/handbook/2/modules.html)
- [Declaration Merging — module augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
- [Modules Reference — ambient module declarations](https://www.typescriptlang.org/docs/handbook/modules/reference.html)

---
