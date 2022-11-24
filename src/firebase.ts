import { Observable, Subject, Subscription } from 'rxjs';
import * as firebase from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  DataSnapshot,
  onChildAdded,
} from 'firebase/database';

export function connect<ItemType>(
  config: any,
  collection: string,
  keyMaker = (() => `${Date.now()}`) as (item: ItemType) => string
) {
  const allSubs = new Subscription();

  // Initialize Firebase
  firebase.initializeApp(config);
  const db = getDatabase();

  const outbox = new Subject<ItemType>();

  // Send outbox messages to the collection
  allSubs.add(
    outbox.subscribe({
      next(item) {
        const key = keyMaker(item);
        const keyRef = ref(db, `${collection}/` + key);
        set(keyRef, item);
      },
      error: console.error,
    })
  );

  // Inbox represents [key,message] recieved from child_added (currently)
  const inbox = new Observable<[string, ItemType]>((notify) => {
    const collectionRef = ref(db, `${collection}/`);

    const handleAdd = function (snapshot: DataSnapshot) {
      const key = snapshot.key as string;
      const item = snapshot.val() as ItemType;
      notify.next([key, item]);
    };
    const cancel = onChildAdded(collectionRef, handleAdd);

    return () => cancel();
  });

  return {
    inbox,
    outbox,
    disconnect: () => allSubs.unsubscribe(),
  };
}
