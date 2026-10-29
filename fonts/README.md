# Checkride Connect: fonts (self-hosted, v3)

All three shipped families are under the **SIL Open Font License 1.1**: free to use, embed and self-host, including commercially; the fonts can't be sold on their own, modified versions can't use the reserved names, and the license stays with the files. License texts are in `licenses/`. Files are byte-identical copies of `/workspace/checkride-brand/fonts/` (SHA-256 below). No font is fetched from a third party at runtime.

| Family | Role in prototype (design-spec-v3 §2.2) | File(s) | License |
|---|---|---|---|
| Manrope v4.505 (© 2018 The Manrope Project Authors) | Headlines: h1 / display 800, section titles (h2) 700, stat numerals | `Manrope-Variable-latin.woff2` (24 KB), `Manrope-Variable-latin-ext.woff2` (15 KB), wght 200–800, Google Fonts unicode-range subsets | OFL 1.1, `licenses/OFL-Manrope.txt` |
| Geist v1.802 (© 2023 Vercel, with basement.studio) | Body text, 400–700 | `Geist-Variable.woff2` (68 KB), wght 100–900 | OFL 1.1, `licenses/OFL-Geist-and-GeistMono.txt` |
| Geist Mono v1.802 (© 2023 Vercel) | Codes, times, fees, the board | `GeistMono-Variable.woff2` (69 KB), wght 100–900 | OFL 1.1 (same file) |

**Bricolage Grotesque is not shipped.** It is used only inside the outlined logo SVGs (`brand/runway-horizontal-*.svg`), so it needs no webfont; its woff2 files and license were removed from this folder and from the service worker precache in v3 (sw.js `cc-proto-v6.0.0`).

Brand source row for Manrope (from checkride-brand/fonts/README.md):
| Manrope v4.505 (© 2018 The Manrope Project Authors) | **Headlines (v3, Oct 29 2026):** h1/h2, hero, stat numerals. Weight 800 (700 for h2) | `Manrope-Variable-latin.woff2` (24 KB), `Manrope-Variable-latin-ext.woff2` (15 KB) | wght 200–800 | Google Fonts CSS2 API (`https://fonts.googleapis.com/css2?family=Manrope:wght@200..800`), files https://fonts.gstatic.com/s/manrope/v23/xn7gYHE41ni1AdIRggexSg.woff2 and https://fonts.gstatic.com/s/manrope/v23/xn7gYHE41ni1AdIRggmxSuXd.woff2. Upstream: https://github.com/googlefonts/manrope | OFL 1.1, `licenses/OFL-Manrope.txt` (from https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt) |

SHA-256 (Oct 29, 2026):
- `Geist-Variable.woff2` `206f01ed08e05c98a51daa7472331c3c71bbb8c1f9d55ea8c70074f3c528a706`
- `GeistMono-Variable.woff2` `55419aa06f58adcd7f145c6c920e56936416f17e528f60efc6032ffa4269972b`
- `Manrope-Variable-latin-ext.woff2` `2f7335119075b2079f1d882530bbc18728461612bf90743203d73a74a48f4d9b`
- `Manrope-Variable-latin.woff2` `8c2def024c1bf31aacf3624ae3c4d701269b4ec3dc765c04830839f0d36b2d9e`

## Where they're wired
- `styles.css` top: `@font-face` rules (font-display: swap, unicode-range for the two Manrope subsets); stacks `--font-display` (Manrope), `--font-body` (Geist), `--font-mono` (Geist Mono).
- `index.html`: preloads the Manrope latin subset and Geist.
- `sw.js`: precaches all four woff2 files and both license texts.
