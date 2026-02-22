---
name: deploy
description: Build and deploy the project to GitHub Pages
disable-model-invocation: true
---

Deploy the project to GitHub Pages:

1. Run `npm run build` to create production build
2. Verify the build succeeded and `dist/` directory was created
3. Commit any pending changes
4. Push to master branch (triggers GitHub Actions auto-deploy)
5. Verify deployment status with `gh run list --limit 1`
