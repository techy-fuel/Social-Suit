Chip mapping a platform name to its (Lucide, substituted) glyph in a tinted square — Composer platform picker, Connections grid, Ads campaign rows. Requires `lucide.createIcons()` after mount. Lucide has no brand/logo glyphs, so every mapping is a verified generic icon id (e.g. facebook→thumbs-up, instagram→camera) — never an assumed brand-name id like "facebook" or "instagram".

```jsx
<PlatformIcon platform="instagram" />
<PlatformIcon platform="tiktok" size={20} />
```
