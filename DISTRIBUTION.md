# iMessage distribution

The app must be published at a public HTTPS address before it can be opened by another person from an iMessage link. A local Vite address only works on the development computer.

## Vercel

Create a Vercel project with `mobile-app` as the project root:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

The included `vercel.json` keeps direct links working when a recipient opens a shared URL. The `Share App` control includes the current risk state and selected anatomical locations in the URL.

This prototype is for research and education. It does not replace clinician judgment or institutional protocols.
