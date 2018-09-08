import { environment } from '../environments/environment';
import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/database';
import { authState } from 'rxfire/auth';
import * as rxDb from 'rxfire/database';
import { of as observableOf, from as observableFrom } from 'rxjs';
import { switchMap, filter, map, combineLatest, tap } from 'rxjs/operators';

const PENDING = 1
const SENT = 2
const DELIVERED = 3

const app = firebase.initializeApp(environment.firebase_config);
const authObj = app.auth();
const dbObj = app.database()

// .subscribe(user => {
//     console.log(user, ' will be null if logged out');
// });

export const authStateListener = () => {
    return authState(authObj)
}

export const signIn = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithRedirect(provider);
}

export const signOut = () => {
    firebase.auth().signOut().then(console.log).catch(console.log)
}

export const getRedirectResult = () => {
    return firebase.auth().getRedirectResult()
}

export const fetchLoggedInUser = () => {
    return authStateListener()
        .pipe(
            filter(user => !!user),
            switchMap(user => {
                return getObject(`users/${user.uid}`)
            })
        )
}

export const getChats = () => {
    return fetchLoggedInUser()
        .pipe(
            switchMap((user: any) => {
                return getP2PMap(user.uid)
                    .pipe(
                        combineLatest(getAllUsers(), (val1, val2) => { return { 'p2p': val1, 'users': val2 } }),
                        map(data => prepareChats(data, user.uid))
                    )
            })
        )
}

export const prepareChats = (result, uid) => {
    // Get all p2p uid array
    let p2p = getP2PFromSnapshot(result.p2p)
    let usersSnapshots = result.users
    let recent = []
    let friends = []
    iterateUsersSnapshot(usersSnapshots, p2p, recent, friends, uid)

    return {
        'recent': recent,
        'friends': friends
    }
}

export const getP2PFromSnapshot = (p2pSnapshots) => {
    let p2p = []

    p2pSnapshots.forEach(peerSnapshot => p2p.push(peerSnapshot.key))
    return p2p;
}

export const iterateUsersSnapshot = (usersSnapshots, p2p: Array<any>, recent, friends, uid) => {
    usersSnapshots.forEach(userSnapshot => {
        const user = userSnapshot

        if (user.uid == uid) return

        if (p2p.includes(user.uid)) {
            // Recent
            recent.push(user)
        } else {
            // Friends
            friends.push(user)
        }
    })
}

export const getP2PMap = (uid) => {
    return getList(`p2pMap/${uid}`)
}

export const getAllUsers = () => {
    return getList('users')
}

const getList = (path) => {
    const ref = dbObj.ref(path);
    return rxDb.list(ref).pipe(
        map((changes: any[]) => changes.map((c: any) => {
            return { key: c.snapshot.key, event: c.event, ...c.snapshot.val() };
        }))
    )
}

const getObject = (path) => {
    const ref = dbObj.ref(path)
    return rxDb.object(ref)
        .pipe(map((change: any) => ({ _key: change.snapshot.key, ...change.snapshot.val() })))
}

export const toChatRoom = (uid) => {
    return fetchLoggedInUser()
        .pipe(
            switchMap((user: any) => {
                const ref = dbObj.ref(`p2pMap/${user.uid}/${uid}`)

                return rxDb.object(ref)
            }),
            switchMap((change: any) => {
                const uid1 = change.snapshot.ref.parent.key
                const uid2 = change.snapshot.ref.key

                if (change.snapshot.exists) {
                    return observableOf({
                        convId: change.snapshot.val(),
                        uid1: uid1,
                        uid2: uid2,
                    })
                } else {
                    // create conversation
                    let users_list = []
                    users_list.push(uid1)
                    users_list.push(uid2)

                    const p2pRef = dbObj.ref('p2p')
                    return observableFrom(p2pRef.push({ "users": users_list }))
                        .pipe(
                            map((newConvSnapshot: any) => ({
                                convId: newConvSnapshot.key,
                                uid1: uid1,
                                uid2: uid2,
                            }))
                        )
                }
            }),
            switchMap(conv => getMessages(conv))

        )
}

const getMessages = (conv) => {
    const messageRef = dbObj.ref(`p2p/${conv.convId}/messages`)

    return getList(messageRef)
        .pipe(
            tap(msgs => { updateStatus(msgs, conv) }),
            map(msgs => ({ msgs: msgs, conv:conv }))
        )
}

export const sendMessage = (msg, conv) => {
    msg.status = PENDING
    const messageRef = dbObj.ref(`p2p/${conv.convId}/messages`)
    messageRef.push(msg).then()
}

const updateStatus = (msgs, conv) => {
    doProcess(msgs, conv.convId, sentPredicate, SENT, conv.uid1)
    doProcess(msgs, conv.convId, deliverPredicate, DELIVERED, conv.uid1)
}

const deliverPredicate = (msg, currUid) => { return msg.sender != currUid && msg.status == SENT }

const sentPredicate = (msg, currUid) => { return msg.sender == currUid && msg.status == PENDING }

const doProcess = (msgs, convId, predicate, status, currUid) => {
    let filteredMsgs = msgs.filter(msg => { return predicate(msg, currUid) })
    let data = {}
    filteredMsgs.forEach(msg => {
        let path = `p2p/${convId}/messages/${msg.key}/status`
        data[path] = status
    });

    if (Object.keys(data).length === 0 && data.constructor === Object) return

    dbObj.ref().update(data).then()
}