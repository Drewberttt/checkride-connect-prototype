# Checkride Connect: brand fonts (self-hosted)

All three families are under the **SIL Open Font License 1.1**. They're free to use, embed and self-host, including commercially. You can't sell the fonts on their own. Modified versions can't use the reserved font names, and the license has to stay with the font files. The license texts are in `licenses/`.

| Family | Role in prototype | File(s) | Axes | Source | License |
|---|---|---|---|---|---|
| Bricolage Grotesque v1.001 (© 2022 The Bricolage Grotesque Project Authors) | Display: h1/h2, hero, big numbers. Weights 500–800 | `BricolageGrotesque-Variable-latin.woff2` (128 KB), `BricolageGrotesque-Variable-latin-ext.woff2` (52 KB) | opsz 12–96, wght 200–800, wdth 75–100 | Google Fonts CSS2 API (`https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800`), files https://fonts.gstatic.com/s/bricolagegrotesque/v9/3y996as8bTXq_nANBjzKo3IeZx8z6up5L-iNGQ.woff2 and https://fonts.gstatic.com/s/bricolagegrotesque/v9/3y996as8bTXq_nANBjzKo3IeZx8z6up5L-aNGe6N.woff2. Upstream: https://github.com/ateliertriay/bricolage | OFL 1.1, `licenses/OFL-BricolageGrotesque.txt` (from npm `@fontsource-variable/bricolage-grotesque@5.3.0`) |
| Geist v1.802 (© 2023 Vercel, with basement.studio) | Body text. Weights 400–700 | `Geist-Variable.woff2` (67 KB, full character set) | wght 100–900 | npm `geist@1.8.2` (`dist/fonts/geist-sans/`), the official package from https://github.com/vercel/geist-font | OFL 1.1, `licenses/OFL-Geist-and-GeistMono.txt` |
| Geist Mono v1.802 (© 2023 Vercel) | Data: codes, times, fees, the board | `GeistMono-Variable.woff2` (69 KB) | wght 100–900 | npm `geist@1.8.2` (`dist/fonts/geist-mono/`) | OFL 1.1 (same file) |

**Checks (Oct 29, 2026):** every file starts with the `wOF2` signature, opens with fontTools (WOFF2 flavor) and carries the fvar axes listed above. The Bricolage files are the Google Fonts unicode-range subsets (latin 268 glyphs, latin-ext 208 glyphs) and include the `opsz` axis that fontsource's files lack.
SHA-256:
- `BricolageGrotesque-Variable-latin-ext.woff2` `e1a04c169c022f63ad24fc1b6fbd932dee1ded62ac08734eeb1d5d51afee38dd`
- `BricolageGrotesque-Variable-latin.woff2` `a756882d8a7802ebd4663b4544a62ebedafc7227c1c159ab95eea61393af3f8e`
- `Geist-Variable.woff2` `206f01ed08e05c98a51daa7472331c3c71bbb8c1f9d55ea8c70074f3c528a706`
- `GeistMono-Variable.woff2` `55419aa06f58adcd7f145c6c920e56936416f17e528f60efc6032ffa4269972b`

## Paste-ready CSS
Copy this folder to the site, for example as `/fonts/`, and adjust the URLs.
```css
@font-face {
  font-family: "Bricolage Grotesque";
  src: url("fonts/BricolageGrotesque-Variable-latin.woff2") format("woff2");
  font-weight: 200 800; font-stretch: 75% 100%; font-style: normal; font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: "Bricolage Grotesque";
  src: url("fonts/BricolageGrotesque-Variable-latin-ext.woff2") format("woff2");
  font-weight: 200 800; font-stretch: 75% 100%; font-style: normal; font-display: swap;
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: "Geist";
  src: url("fonts/Geist-Variable.woff2") format("woff2");
  font-weight: 100 900; font-style: normal; font-display: swap;
}
@font-face {
  font-family: "Geist Mono";
  src: url("fonts/GeistMono-Variable.woff2") format("woff2");
  font-weight: 100 900; font-style: normal; font-display: swap;
}

/* Stacks: identical to the prototype's styles.css */
:root {
  --font-display: "Bricolage Grotesque", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-body: "Geist", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
}
```
Optional: preload the two files used above the fold.
```html
<link rel="preload" href="fonts/BricolageGrotesque-Variable-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossorigin>
```
Notes:
- Browsers set Bricolage's `opsz` automatically from font-size (`font-optical-sizing: auto`). The logo wordmark was drawn at opsz 36.
- No italics are included, since the prototype uses none. Vercel's package and Google Fonts don't ship a Bricolage italic, though Geist italics exist (fontsource `@fontsource-variable/geist`).
