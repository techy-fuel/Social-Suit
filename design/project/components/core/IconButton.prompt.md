Square icon-only control for toolbars, table row actions, calendar nav arrows.

```jsx
<IconButton icon={<i data-lucide="chevron-left" />} label="Previous week" onClick={prevWeek} />
<IconButton icon={<i data-lucide="more-horizontal" />} label="More actions" variant="outline" />
```

`active` gives a Blue-100 tint + Royal Blue icon color (e.g. current view toggle). Always pass `label` — it's used as both `aria-label` and native tooltip.
