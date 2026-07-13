Native-backed dropdown — period selectors on Analytics, platform/duration pickers on Hashtag Tracker.

```jsx
<Select label="Period" value={period} onChange={e => setPeriod(e.target.value)}
  options={[{value:'7d',label:'Last 7 days'},{value:'28d',label:'Last 28 days'}]} />
```
