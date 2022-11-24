# 𝗥𝘅𝑓𝑥 `firebase`

An 𝗥𝘅𝑓𝑥/RxJS friendly way of communicating with Firebase Realtime Database. A turnkey alternative to WebSockets.


## Overview
1. Install `yarn add @rxfx/firebase`
1. Set up a Firebase database at https://console.firebase.google.com/, following the instructions below
1. Connect with Firebase config
1. Consume from the `inbox`, and send via the `outbox`

## Approach

The Collection will contain a new item for each item passed to `outbox.next`, and every connected client will get every previous message from that collection in its `inbox` when it connects.

This is not suitable for every use case - most notably, it is not a typical CRUD model, it is more of an Event Log. To achieve CRUD, the `inbox` at each participant could reduce its events via RxJS' `scan`.

Also, this is not a great model for 'transient' messages, as every .

## Minimal Code
```js
const firebaseConfig = /* your config, perhaps loaded from localStorage */
const COLLECTION = "_test_chat";
const { inbox, outbox } = connect<{ username: string; message: string }>(
  firebaseConfig,
  COLLECTION,
);

// Send
outbox.next({username: 'Me', message: 'Hello World!'});

// Consume to update UI
inbox.subscribe(([key, msg]) => {
  const message = ```
     <li data-key=${key}><span>${msg.username}:</span>${msg.message}</li>
  ```;
  // append the message on the page
});

```

## Firebase Setup
- Run `npm install firesocket`
- [Install](https://firebase.google.com/docs/cli#install_the_firebase_cli) `firebase` cli
- Set up [Realtime Database](https://firebase.google.com/docs/database) security rules
  - Run `firebase login`
  - Run `firebase init`
    - Create new project or use existing project created in [Console](https://console.firebase.google.com/)
    - Select Database
    - For security rules, use the path `node_modules/firesocket/database.rules.json`
    - Don't delete the existing file
  - Run `firebase deploy --only database`
- Set up [Authentication](https://firebase.google.com/docs/auth)
  - https://console.firebase.google.com/u/0/project/_/authentication
  - Enable Anonymous, and/or another provider to allow for resumption of socket connection