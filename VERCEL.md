# Deploying this app to Vercel

Quick instructions to deploy the Vite + React app to Vercel.

1) Recommended: connect the GitHub repo to Vercel
- Create a repo on GitHub and push the project (ensure `.gitignore` contains `node_modules/`).
- In Vercel dashboard, click "New Project" → import from GitHub → select the repo.
- Vercel will auto-detect a Vite / static build. Use the detected build settings or set:
  - **Framework Preset**: None / Static
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`

2) Alternative: deploy from local machine using the Vercel CLI
- Install the CLI: `npm i -g vercel`
- From project root run:
  ```bash
  vercel login
  vercel --prod
  ```
- The CLI will ask a few questions (project name, scope). Choose to link to the current directory or create a new project. It will run `npm run build` and upload the `dist` output.

3) Environment variables
- Do NOT commit secret values to the repo. Add secrets in the Vercel dashboard (Project Settings → Environment Variables) or use `vercel env add`.

4) SPA fallback / rewrites
- `vercel.json` already includes a rewrite so client-side routing works (routes fallback to `/index.html`).

5) Troubleshooting
- If the build fails, check Vercel build logs. Common issues:
  - Missing `node` / `npm` version: set `engines.node` in `package.json` or configure in Vercel project settings.
  - TypeScript errors: the `build` script runs `tsc -b` before `vite build`; adjust if you want Vercel to skip type-checking during deploy.

If you want, I can try to run the `vercel` CLI from here (you may need to complete authentication) or help create the GitHub repo and push the cleaned repository first.
