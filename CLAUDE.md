# CLAUDE.md

Working notes for this portfolio site. Read this first when making changes.

## Repo basics

- Static site, no build step. HTML + CSS + a small `js/main.js`.
- Two git remotes:
  - `origin` — `git@github.com:sohamghoshal/portfolio-code-log.git` (code log)
  - `pages`  — `git@github.com:sohamghoshal/sohamghoshal.github.io.git` (live site, GitHub Pages, 1 GB hard limit)
- **Commit and push both happen on the Mac.** The Cowork sandbox can't write into `.git/` (FUSE mount is read-only there) — `git commit` fails with "Operation not permitted" and leaves a stale `.git/index.lock`. The sandbox also has no SSH key for GitHub, so pushes would fail anyway. Workflow from the sandbox: do the file work, validate, then hand the user a `git add` / `git commit` / `git push` block to run on the Mac. If a previous session left `.git/index.lock` behind, the hand-off should include `rm -f .git/index.lock` first.
- Validation: `python3 outputs/validate.py` (or wherever the script lives in `outputs/`). Checks tag balance for every HTML file, CSS brace balance, and `node --check` on `js/main.js`.

## File layout

- `index.html` — homepage, horizontal album gallery. Each album is one `<a class="album-card">` block.
- `albums/<slug>.html` — one page per album. All built from the same template; the only things that change are the slug, the title, and the photo count.
- `podcast.html`, `music.html`, `contact.html` — top-level inner pages.
- `css/style.css` — one global stylesheet. Mobile breakpoint at 768px (hamburger replaces sidebar).
- `js/main.js` — nav toggle, lightbox, scroll behaviors.
- `images/<Source Folder>/` — raw, full-resolution photos straight from the camera. **Do not link these from HTML** — they're too big for Pages.
- `images/opt/<slug>/NN.jpg` — web-optimized album images. **Link these from HTML.**
- `images/opt/covers/<slug>.jpg` — web-optimized cover thumbnail for the homepage card.

## Image optimization (CRITICAL — Pages has a 1 GB limit)

Never commit raw camera JPGs. Always run them through optimization first.

Sizes used across the site:
- Album photos: long edge 1920 px, JPEG quality 80, progressive.
- Cover thumbnails: long edge 2560 px, JPEG quality 82, progressive. (Homepage cards render at full viewport width, so anything smaller looks soft on retina/4K.)
- Music studio photos: long edge 1200 px, JPEG quality 82.

The repo has `optimize.sh` (uses macOS `sips`). It is the source of truth when running on the Mac. When running inside Cowork's Linux sandbox, `sips` is not available — use the Python (Pillow) snippet below instead, which produces equivalent output. Always strip EXIF orientation via `ImageOps.exif_transpose` so portraits don't rotate sideways.

### Adding a new album (full recipe)

1. **Drop the raw photos** in `images/<Source Folder>/` (e.g. `images/Taiwan/`).
2. **Pick a URL slug** in `lowercase-with-hyphens-and-country`, like the city-comma-country pattern used elsewhere: `taipei-taiwan`, `manila-philippines`, `kyoto-osaka-japan`. The display title uses `City, Country`. (Hong Kong is shorter — slug `hong-kong`, title `Hong Kong` — because the country qualifier is redundant for it.)
3. **Optimize** into `images/opt/<slug>/` and the cover into `images/opt/covers/<slug>.jpg`. From the sandbox, run:

   ```python
   from PIL import Image, ImageOps
   from pathlib import Path
   SRC = Path("images/<Source Folder>")
   ALBUM = Path("images/opt/<slug>"); ALBUM.mkdir(parents=True, exist_ok=True)
   COVER = Path("images/opt/covers/<slug>.jpg"); COVER.parent.mkdir(parents=True, exist_ok=True)
   files = sorted(p for p in SRC.iterdir() if p.suffix.lower() in (".jpg", ".jpeg"))
   for i, src in enumerate(files, 1):
       img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
       w, h = img.size; s = 1920/max(w, h) if max(w, h) > 1920 else 1
       if s < 1: img = img.resize((int(w*s), int(h*s)), Image.LANCZOS)
       img.save(ALBUM / f"{i:02d}.jpg", "JPEG", quality=80, optimize=True, progressive=True)
   img = ImageOps.exif_transpose(Image.open(files[0])).convert("RGB")
   w, h = img.size; s = 2560/max(w, h) if max(w, h) > 2560 else 1
   if s < 1: img = img.resize((int(w*s), int(h*s)), Image.LANCZOS)
   img.save(COVER, "JPEG", quality=82, optimize=True, progressive=True)
   ```

   On the Mac: add the slug to the `SLUGS=()` array in `optimize.sh` and run `./optimize.sh`.

4. **Create `albums/<slug>.html`** by copying any existing album page (e.g. `manila-philippines.html`) and replacing:
   - `<title>` and `<meta name="description">`
   - The `<h1>` (just the title — there's no longer a separate subtitle line)
   - Every `images/opt/<old-slug>/NN.jpg` path
   - Every `alt` attribute
   - The number of `.album-photo-item` blocks (one per photo, with `data-index` starting at 0)

5. **Add the homepage card** to `index.html`'s `.home-gallery`. The card markup is:

   ```html
   <a href="albums/<slug>.html" class="album-card">
     <img src="images/opt/covers/<slug>.jpg" alt="<City, Country>" class="album-card-img" loading="lazy" />
     <div class="album-card-info">
       <span class="album-card-title"><City, Country></span>
       <span class="album-card-count">N photos</span>
     </div>
   </a>
   ```

   Position the card wherever the user wants in the scroll order (first card = leftmost = first thing visitors see).

6. **Validate**: `python3 outputs/validate.py` — expects "All checks passed."
7. **Hand off commit + push to the Mac.** Sandbox can't write `.git/` (see Repo basics). Give the user a block like:

   ```
   cd ~/Desktop/portfolio-website
   rm -f .git/index.lock
   git add index.html albums/<slug>.html images/opt/<slug>/ images/opt/covers/<slug>.jpg
   git commit -m "Add <City, Country> album (N photos)"
   git push origin main && git push pages main
   ```

### Removing or renaming an album

- Remove the card from `index.html`.
- Optionally delete `albums/<slug>.html`, `images/opt/<slug>/`, and `images/opt/covers/<slug>.jpg` if you want it fully gone. Source `images/<Source Folder>/` stays (it's not served).

## Inner pages (podcast, music, contact)

These all use `<body class="has-sidebar">` with the shared `.site-layout > .site-sidebar + .site-content > main` structure. The sidebar's active link is set by adding `class="active"` to the matching `<a>` inside `nav.sidebar-nav`. If you add a new top-level page, make sure to add the link in both the header `<nav id="main-nav">` and the `nav.sidebar-nav` on every page (`index.html`, all albums, podcast, music, contact).

## Style/voice

- Light cream palette, Archivo font, minimalist Seif Kousmate-inspired galleries.
- All headings use `letter-spacing: 0.22em; text-transform: uppercase` at small sizes for a magazine feel.
- Photos are shown at natural aspect ratio (no `object-fit: cover` for hero/feature images) — the user has been explicit about not wanting crops.
- Hover overlay on homepage cards covers the whole image with a translucent cream wash; title text is white with a soft drop shadow.

## Things to never do

- Don't link `images/<Source Folder>/` paths from HTML (uses raw, full-res files — blows past Pages' 1 GB cap fast).
- Don't reintroduce "2018–2026" or similar date ranges in sidebars — the user removed them deliberately.
- Don't try to `git commit` or `git push` from the sandbox; both fail. Do the file work, validate, hand the commands off to the user.
