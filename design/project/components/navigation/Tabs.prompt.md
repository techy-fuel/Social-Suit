Underline tab bar — Inbox's Unresolved/Unread/All, Reporting's tab groups.

```jsx
<Tabs items={[{key:'unresolved',label:'Unresolved',count:4},{key:'unread',label:'Unread',count:12},{key:'all',label:'All'}]} active="unresolved" onChange={setTab} />
```
