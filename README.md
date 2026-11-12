# Harbor

The website for Harbor: the working notebook of Abdullah Saghir. It holds his
software, websites and writing, and it is the place to hire him (through his
Upwork profile) for websites, web apps and small tools.

The site is designed as a vintage diary. It opens as a closed book and is read
chapter by chapter, with real page turns on laptop and on phone.

**Status:** finished, getting ready to go live at harbordevs.com (hosted on Netlify).

## Built with

- [Next.js](https://nextjs.org) 16 (App Router) and React 19
- TypeScript
- Tailwind CSS v4 and CSS Modules
- [page-flip](https://github.com/Nodlik/StPageFlip) for the laptop page turn,
  and a small WebGL page curl for phones

No backend, database or tracking.

## Run it locally

Needs [Node.js](https://nodejs.org) (LTS).

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the dev server |
| `npm run lint` | Checks code style |
| `npm run build` | Makes a production build |
| `npm run start` | Runs the production build locally |

## Project docs

- [PROJECT.md](PROJECT.md): design rules, folder map, standards and the plan
- [docs/book-engine.md](docs/book-engine.md): how the book and its page turns work
- [docs/textures.md](docs/textures.md): how the paper and desk textures are made

## License

All rights reserved. The code is public so it can be read, not reused.
See [LICENSE](LICENSE).
