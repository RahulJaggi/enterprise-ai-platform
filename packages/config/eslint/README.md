# @enterprise-ai/eslint-config

## Purpose

Provides reusable ESLint rules and static code analysis presets across all monorepo applications and packages.

---

## 🛠 Presets

- **`@enterprise-ai/eslint-config/base`**: Base JavaScript/TypeScript linting rules.
- **`@enterprise-ai/eslint-config/node`**: Preset optimized for NestJS & Node.js services.
- **`@enterprise-ai/eslint-config/react`**: Preset optimized for Next.js & React 19 apps.

---

## 🚀 Usage

In any workspace `.eslintrc.js`:

```javascript
module.exports = {
  extends: ['@enterprise-ai/eslint-config/node'],
};
```
