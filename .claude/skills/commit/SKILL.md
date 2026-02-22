---
name: commit
description: Create a Git commit with conventional commit message format
disable-model-invocation: true
argument-hint: [commit message]
---

Create a Git commit following the project's conventional commit format.

1. Run `git status` to see all changes
2. Run `git diff --staged` to review staged changes; if nothing staged, run `git diff` to review unstaged changes
3. Stage relevant files with `git add` (specific files, not `git add .`)
4. Commit with message format: `<type>: <description>`
   - feat: new feature
   - fix: bug fix
   - style: styling changes
   - refactor: code reorganization
   - docs: documentation
   - chore: dependency/config updates
5. If `$ARGUMENTS` is provided, use it as the commit message
6. Keep the first line under 72 characters
