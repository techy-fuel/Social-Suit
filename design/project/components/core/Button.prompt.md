Primary action control used across every SocialSuite screen — top-right page actions, form submits, composer publish/save.

```jsx
<Button variant="primary" size="md" onClick={handlePublish}>Publish now</Button>
<Button variant="secondary" size="sm">Save as draft</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="danger">Disconnect</Button>
```

Variants: `primary` (Royal Blue fill, one per view), `secondary` (white + border), `ghost` (no fill/border, hover-only), `danger` (red, destructive actions only — disconnect, delete). Sizes: `sm` (32px, dense toolbars), `md` (38px, default), `lg` (44px, empty-state / marketing CTAs). Never a `success` variant — positive states never colored, only status badges/text are.
