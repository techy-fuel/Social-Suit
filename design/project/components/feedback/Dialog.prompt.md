Modal for confirmations and focused tasks — disconnect confirmation, new tracking session, report scheduling. Position the containing element `relative` so the overlay scopes to the demo/app frame.

```jsx
<Dialog open={open} title="Disconnect TikTok?" onClose={close}
  footer={<>
    <Button variant="ghost" onClick={close}>Cancel</Button>
    <Button variant="danger" onClick={confirm}>Disconnect</Button>
  </>}>
  Scheduled posts for this account will not be published.
</Dialog>
```
