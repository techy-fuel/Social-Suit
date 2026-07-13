Fixed left navigation, Deep Blue fill, covering all nine SocialSuite surfaces. Requires `lucide.createIcons()` to be called after mount for icons to render.

```jsx
<Sidebar active="analytics" onNavigate={setScreen} logoSrc="../../assets/logo/tf-mark.svg" />
```

`logoSrc` is resolved relative to the consuming page (there's no fixed project root at runtime) — pass a relative path from wherever the page actually lives. Omit it and Sidebar falls back to an inline gradient "TF" mark so it never 404s.
