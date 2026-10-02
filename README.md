# Meowie’s Little Adventure

Play online: https://sandhyaabudhu.github.io/meowie/

Choose from four playable coats: the original blaze tuxedo, a masked tuxedo without the tall white nose marking, a tabby with white paws and chest, and a classic tabby. The choice is remembered locally and stays with Meowie through restarts and the completion screen. All four cats have locally generated artwork and four-direction movement frames.

A polished, small browser adventure about a curious cat and ten missing sardines. Explore Chamomile Garden, visit the flower patch and café, watch the lily pond, or try a particularly inviting cardboard box. Ring the bicycle bell, peek at a postcard in the mailbox, nudge the wind chimes, or bat a little ball of yarn. There is no timer or score pressure.

Built with **Phaser 3 · TypeScript · Vite**, with HTML/CSS menus and overlays. This is a deliberately contained, portfolio-ready playable demonstration: one map, exactly ten collectibles, and a few cozy interactions. Allow about 5–10 minutes for a leisurely first visit; an efficient route can be much faster.

## Run locally

Requires Node.js 22.12+ (or a supported newer version) and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite, usually http://localhost:5173. To check the production bundle:

```sh
npm run build
npm run preview
```

The finished static website is generated in **`dist/`**. It needs no server-side application, accounts, database, or external asset service.

## Controls

| Action            | Desktop                 | Phone / tablet              |
| ----------------- | ----------------------- | --------------------------- |
| Move              | WASD or arrow keys      | Drag the virtual thumbstick |
| Interact          | E near a special object | E / Explore button          |
| Find a hint       | H or “A little hint”    | Hint button                 |
| Pause             | Escape or pause button  | Pause button                |
| Collect a sardine | Walk close to it        | Walk close to it            |

Touch controls appear automatically on devices with a coarse pointer. Portrait and landscape are supported; landscape provides a wider view. Losing focus or hiding the browser pauses the adventure. Complete the collection, then choose to keep exploring, play again, or return home.

Sound is optional and can be toggled from the header. The preference is remembered locally when browser storage is available. All audio is generated using the Web Audio API after a user gesture: no bundled recordings or third-party audio licenses are needed.

## Project structure

```text
src/
  assets/             Original SVG texture and garden generators
  audio/              Small synthesized sound cues
  config/             Map layout, obstacles, sardines, interactions
  game/
    scenes/           Boot/loading and garden scene lifecycle
    Player.ts         Movement, facing, idle/walk animation
    Collectible.ts    Fish proximity, bobbing, collection sparkles
    Ambience.ts       Butterflies, birds, pond ripples
    InteractionEffects.ts  Small animated object reactions
  ui/                 Menus, HUD, icons, touchscreen controls
  main.ts             Phaser configuration and UI connection
  style.css           Responsive visual styling
scripts/              Browser integration tests and visual inspection
public/               Original favicon
```

The map is intentionally authored in `src/config/world.ts`. Major objects use Arcade Physics collision bodies. The floor is rasterized once from an original SVG, and repeated objects reuse textures. Cat frames are generated in four directions; movement uses a normalized vector and smooth acceleration/deceleration. Collection checks use world coordinates independently of camera zoom.

## Personalize the portfolio credit

Edit **`src/ui/UI.ts`**:

- Replace `Your Name` in the footer and the information overlay.
- Replace the footer credit button with an anchor pointing to your portfolio URL if desired; preserve the `credits` class styling.
- In `.portfolio-credit`, replace the placeholder sentence with your portfolio link.

The “A little about this” overlay explains the demonstration and its technologies. No external images, fonts, audio files, analytics, or APIs are required by the game. The illustrations and generated sounds were created specifically for this project.

## Browser verification

With the development server running in another terminal:

```sh
npm test
```

Tests use Playwright with installed Google Chrome by default. Set `MISO_BROWSER_CHANNEL=msedge` to use Edge instead, and `MISO_TEST_URL` to change the local URL. The development-only test hook is removed from the production build.

The suite checks title/help/about screens, sound toggling, WASD and arrow movement, collisions with the pond/fences/trees/buildings/furniture/world edge, box interaction, pause/resume/restart, and every collectible. It finds continuous routes around obstacles and drives the same movement input used by the joystick, without teleporting Meowie to collect the fish. It also checks the win screen, continued exploration, a fresh adventure after returning home, real touch events, portrait/landscape layouts, and uncaught browser errors. Screenshots and a JSON report go to `test-results/` (ignored by Git).

`npm run build` checks TypeScript and creates the production bundle. Phaser is split into its own cacheable chunk. The framework is the only production dependency; Playwright and build tooling are development dependencies.

After building, run `npm run test:production` to serve `dist/` temporarily under a subdirectory and check production asset loading, collection, and restart. This also verifies the development test hook is absent from the shipped website.

## Deployment to Cloudflare Pages

1. Create an empty repository in your GitHub account. In this project folder, commit and push the source (replace the repository URL):

   ```sh
   git init
   git add .
   git commit -m "Build Meowie’s Little Adventure"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/meowie.git
   git push -u origin main
   ```

2. In Cloudflare, open **Workers & Pages**, choose **Create application → Pages → Connect to Git**, and connect your GitHub account.
3. Select the repository and production branch (`main`). Use these build settings:

   | Setting          | Value                                  |
   | ---------------- | -------------------------------------- |
   | Framework preset | Vite (or None with the settings below) |
   | Build command    | `npm run build`                        |
   | Output directory | `dist`                                 |
   | Root directory   | Leave blank (repository root)          |
   | Node.js version  | Set `NODE_VERSION` to `22` if needed   |

4. Save and deploy. Cloudflare installs dependencies and publishes `dist/` at your `pages.dev` address. You can connect a custom domain later.
5. Future pushes to the production branch on GitHub automatically rebuild and redeploy the site. Pull requests can receive preview deployments through Cloudflare’s Git integration.

The `base: './'` Vite setting supports both root domains and subdirectory deployments. The information view is an overlay, so no `/about` routing or backend rewrite is required.

Reference: [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/) and [build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/).

## Alternative: GitHub Pages

A deployment workflow is included at `.github/workflows/deploy-pages.yml`.

1. Push the repository to GitHub as above.
2. Open **Settings → Pages → Build and deployment**, and choose **GitHub Actions** as the source.
3. Push to `main` (or run the “Deploy to GitHub Pages” workflow manually from the Actions tab).
4. The workflow installs with `npm ci`, runs `npm run build`, uploads `dist/`, and deploys it to Pages. The deployment URL is shown in the workflow and Pages settings.

Subsequent pushes to `main` automatically deploy. Relative asset paths support the usual `https://YOUR-USERNAME.github.io/meowie/` URL without changing the build configuration.

Reference: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Design and scope

The demo intentionally has no inventory, quests, multiplayer, backend, or account system. It uses one connected map with carefully placed landmarks, a lightweight hint, ten reachable fish, and a short celebration. Settings are limited to a global sound preference. Original SVG sources are kept in code so the palette and illustrations can be changed together.

Framework reference: [Phaser Arcade Physics documentation](https://docs.phaser.io/phaser/concepts/physics/arcade).
