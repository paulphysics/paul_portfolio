# Paul Owuor — Portfolio

A static, single-screen portfolio: Vite + vanilla JavaScript, no backend, no API calls.
Only runtime dependency: the self-hosted Inter font (`@fontsource-variable/inter`). Icons are inlined.

## Configure

Edit **`src/config.js`**: `WRITERSADMIN_URL`, `GITHUB_PROFILE_URL`, `WHATSAPP_NUMBER`
(digits only, international format, no `+`) and `LINKEDIN_URL`. All are already set.
If a value is ever left empty, its button shows a "not configured" notice instead of a broken link.

> LinkedIn is also written directly in `index.html` (header and contact row) so it works without JavaScript.

## Develop / build

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs ./dist
npm run preview    # serve the production build locally
```

## Deploy on Netlify (GitHub-connected)

`netlify.toml` already sets everything:
- Build command: `npm run build`
- Publish directory: `dist`
- Node 20

Push to GitHub → Netlify → "Add new site" → "Import from Git" → pick the repo → deploy.

## Structure

```
index.html            semantic markup (content works without JS)
src/config.js         URLs / WhatsApp number
src/skills.js         skill copy (CV-grounded)
src/constellation.js  interactive SVG network
src/particles.js      low-count canvas background
src/icons.js          inline icon set
src/styles.css        layout + theme
```

## Behaviour notes
- Desktop (>900px wide, >540px tall) fits one viewport with no scrolling; smaller screens flow and scroll naturally.
- Animations pause when the tab is hidden or the network is off-screen; `prefers-reduced-motion` renders everything static.
