---
name: review-code
description: Review code changes for bugs, style issues, and improvements
allowed-tools: Read, Grep, Glob
argument-hint: [file or branch]
---

Perform a code review on $ARGUMENTS (or current uncommitted changes if no argument):

1. **Correctness**: Logic errors, off-by-one, null/undefined handling
2. **Security**: XSS, injection, unsafe data handling
3. **Performance**: Unnecessary re-renders, expensive computations, memory leaks
4. **TypeScript**: Proper types, no `any` abuse, correct generics
5. **React patterns**: Hooks rules, proper state management, key props
6. **Style**: Consistent with project conventions (CSS Modules, component structure)

Output findings grouped by severity: critical / warning / suggestion.
