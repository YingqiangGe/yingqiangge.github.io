# Yingqiang Ge's Homepage

Personal academic website for Yingqiang Ge, hosted at https://yingqiangge.github.io.
Built with Jekyll 4.3 and customized from Academic Pages / Minimal Mistakes.

## Project structure

| Path | Purpose |
| --- | --- |
| `_pages/about.md` | Homepage biography and news |
| `_pages/publications.md` | Maintained publication list |
| `_pages/cv.md` | Multilingual CV; English block is the source for JSON CV generation |
| `_posts/` | Blog posts with dated filenames and YAML front matter |
| `_data/navigation.yml` | Header navigation |
| `_data/cv.json` | Generated data for `/cv-json/` |
| `_config.yml` | Site URL, author profile, theme, analytics, and Jekyll settings |
| `_layouts/`, `_includes/` | Liquid layouts and shared page components |
| `_sass/`, `assets/css/main.scss` | Theme, layout, and reading styles |
| `assets/js/i18n.js` | Language selection and content fallback |
| `assets/js/_main.js` | Navigation, light/dark theme, and optional chart loading |
| `scripts/` | JavaScript asset and CV maintenance helpers |
| `images/`, `files/` | Static images and downloadable files |

The `intelligence/` application has been removed from this repository. All We Need
links in the navigation and news point to the separate `https://allweneed.info/`
website; its source and deployment pipeline are not maintained here.

Some upstream sample pages and collections remain (`_talks/`, `_teaching/`,
`_portfolio/`, and the Markdown guide). They are not used to populate the JSON CV.
Removing a page from navigation does not prevent Jekyll from publishing it.

## Local preview

Install Ruby with Bundler. JavaScript builds require Node.js 18 or newer and npm;
CV generation requires Python 3 and PyYAML. Existing committed JavaScript assets
can be served without installing npm dependencies.

```bash
bundle install
bundle exec jekyll serve --config _config.yml,_config_docker.yml --host 127.0.0.1 --port 4000
```

Open http://127.0.0.1:4000. `_config_docker.yml` enables local preview with relative
site paths, so assets and icon fonts use the same host whether you visit
`127.0.0.1` or `localhost`. Restart Jekyll after changing configuration files. `npm run serve:local`
is an alias for the same command and does not require rbenv.

A container-based preview is also available:

```bash
docker compose up --build
```

## Editing content and languages

Write page and post content in Markdown with YAML front matter. Maintain the
publication list directly in `_pages/publications.md`; it is not generated from
an `_publications/` collection.

The language switcher supports English (`en`), Chinese (`zh`), Japanese (`ja`),
Korean (`ko`), and Spanish (`es`). Translations sit next to each other:

```html
<div data-i18n="en" markdown="1">
English content.
</div>
<div data-i18n="zh" markdown="1">
中文内容。
</div>
```

Each consecutive set of language blocks is one translation group. A repeated
language or a non-language element starts a new group. Keep the same language
order, starting with English, when adding translated sections such as biography
and news. Each group displays the selected language, then English if unavailable,
then its first available language. Content without `data-i18n` is always shown.

The chosen interface language is saved in local storage; falling back to English
content does not change that preference. Without JavaScript, English blocks
remain visible. Navigation and sidebar translations live in `assets/js/i18n.js`.

## Updating the JSON CV

Edit `_pages/cv.md` and author information in `_config.yml`, then regenerate:

```bash
python3 -m venv /tmp/homepage-cv-venv
/tmp/homepage-cv-venv/bin/pip install PyYAML
/tmp/homepage-cv-venv/bin/python scripts/cv_markdown_to_json.py
```

Alternatively, `bash scripts/update_cv_json.sh` uses `python3` from your PATH.
The converter reads the English CV's Education, Experience, Service and leadership,
and Awards sections. Keep the existing Setext headings and top-level/nested bullet
structure. Education uses year ranges; work dates retain the wording in the CV.
Unrecognized education or work entries fail the command instead of being silently
omitted. Commit `_data/cv.json` together with its source changes.

`/cv-json/` renders the generated data and links to the multilingual CV and full
publication list. It does not import the upstream sample talks, teaching, or
portfolio entries. No downloadable CV PDF is currently provided.

## JavaScript and charts

After changing `_main.js`, navigation plugins, or JavaScript dependencies:

```bash
npm install
npm run build:js
```

Commit the rebuilt `assets/js/main.min.js` and `assets/js/plotly.min.js` when they
change. `npm run watch:js` rebuilds on JavaScript edits and ignores generated files.
`i18n.js`, `plotly.js`, and `theme.js` are served directly.

The shared bundle includes jQuery, FitVids, smooth scrolling, and site behavior.
Only pages containing a fenced `plotly` code block dynamically load `plotly.js`,
its theme definitions, and the separately hosted `plotly.min.js` library. Normal
pages do not download Plotly. Charts follow light/dark theme changes; if loading
or rendering fails, the original code block stays visible.

## Validation and publishing

Before publishing, regenerate any changed assets/data and build the site:

```bash
bundle exec jekyll build
```

Preview the homepage, CV, blog, language fallback on an English-only post, and
charts at `/markdown/` when changing their associated code. Build output is in
`_site/` and is ignored by Git.

This repository targets GitHub Pages. Publishing depends on the branch/source
selected in the repository's **Settings → Pages**; check the Pages deployment
result after pushing. The only checked-in workflow, `scrape_talks.yml`, updates
talk-map data and is not the site's deployment workflow. GitHub Pages does not
run this project's npm or Python maintenance scripts automatically, so generated
JavaScript assets and JSON CV data must be committed.

## Attribution

Based on [Academic Pages](https://github.com/academicpages/academicpages.github.io),
itself derived from [Minimal Mistakes](https://github.com/mmistakes/minimal-mistakes).
See `LICENSE` for the MIT license. Plotly's distributed bundle retains its own
license header.
