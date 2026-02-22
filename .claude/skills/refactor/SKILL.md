---
name: refactor
description: Refactor code to improve structure without changing behavior
argument-hint: [file or component name]
---

Refactor $ARGUMENTS while preserving existing behavior:

1. Read the target code and understand its current behavior
2. Identify improvement opportunities:
   - Extract reusable logic into custom hooks
   - Split large components into smaller ones
   - Improve type definitions
   - Reduce code duplication
   - Simplify complex logic
3. Make changes incrementally, verifying each step
4. Run `npm run build` to ensure no type errors after refactoring
5. Commit with message: `refactor: <what was improved>`
