# Mavocado Design — GitHub Pages website

Version 41. Ready-to-serve HTML, CSS, JavaScript, images, fonts, guides and local video. No npm install or build is required.

## Upload and publish

1. Extract the ZIP on your computer.
2. Upload the extracted contents to your repository root. `index.html` and `assets/` must sit at the top level. Do not upload the ZIP itself as the website.
3. Keep `.nojekyll` at the repository root. Keep all filenames and asset folders unchanged.
4. In GitHub, open **Settings → Pages → Build and deployment**. Choose **Deploy from a branch**, select your main branch, choose **/(root)**, and save.
5. Wait for the Pages deployment to finish. Open the URL GitHub displays in Settings → Pages.

This supports both `username.github.io` repositories and project sites at `username.github.io/repository-name/` because page and asset links are relative.

## Local preview

From the extracted folder, run `python3 -m http.server 8000` and open `http://localhost:8000`. On Windows, `py -m http.server 8000` also works. Use an HTTP server for a faithful preview rather than double-clicking HTML files.

## What is included

- All 28 website pages and their referenced local assets.
- Six supplied service visuals, fitted without cropping.
- Founder portrait: grayscale by default, colour on hover or keyboard focus.
- Smaller animated wordmark/service header with “SAAS PRODUCT DESIGN”.
- Borderless local Nothing Pay video, with 64px desktop / 40px mobile spacing below it.
- Shared footer, live IST analog clock, keyboard-accessible timeline and enquiry dialogs.

## External services

Enquiry and audit forms retain the existing Formspree endpoint. They need an internet connection and an active Formspree account/endpoint; this export does not configure or verify that account. Email, phone, social links and browser sharing remain available.

Shared view totals need a database-backed API. GitHub Pages is static hosting and cannot run the original Sites Worker/D1 backend. The export disables those requests and hides view totals through `site-config.js`, preventing broken `/api/views` requests or fabricated counts. The live ChatGPT-hosted site retains its existing shared counter.

To connect a compatible backend later, set `window.MAVOCADO_VIEWS_API` in `site-config.js` to its URL. GET must return a JSON object keyed by page slug with integer totals; POST to `<URL>/<page-slug>` records a view. A backend on another origin must allow the website origin through CORS. No secret keys belong in this public configuration.

## Editing

Edit the HTML page for copy and structure. The latest visual overrides are in `polish-41.css`. Earlier stylesheets remain because they supply the established layout, animations and responsive rules. Keep their order. The shared header/footer are present in each HTML page.

Validation covers ZIP integrity, JavaScript parsing, local HTML/CSS asset references, page anchors, image decoding and video metadata. It cannot guarantee a third-party service’s availability or configure a GitHub repository automatically.

GitHub publishing reference: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
