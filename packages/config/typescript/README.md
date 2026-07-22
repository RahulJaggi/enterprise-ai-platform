# @enterprise-ai/tsconfig

## Purpose

Provides reusable, strict TypeScript configurations across all apps and packages in the Enterprise AI Platform monorepo.

---

## 🛠 Available Configurations

- **`@enterprise-ai/tsconfig/base.json`**: Core strict TypeScript settings (`"strict": true`, ES2022 target).
- **`@enterprise-ai/tsconfig/node.json`**: Extends `base.json` with decorator metadata for NestJS & Node.js backend microservices.
- **`@enterprise-ai/tsconfig/react.json`**: Extends `base.json` with JSX preservation and bundler resolution for Next.js & React 19 apps.

---

## 🚀 Usage

In any workspace `tsconfig.json`:

```json
{
  "extends": "@enterprise-ai/tsconfig/node.json",
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```
