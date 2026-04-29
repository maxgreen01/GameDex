import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../firebaseClient";

async function getUserDetails() {
  let firebaseUser = auth.currentUser;

  if (!firebaseUser) {
    return null;
  }

  let snap = await getDoc(doc(db, "users", firebaseUser.uid));

  if (snap.exists()) {
    let data = snap.data();

    return {
      user: firebaseUser,
      username: data.username,
      displayName: data.displayName,
    };
  }

  return {
    user: firebaseUser,
    username: "User",
    displayName: "User",
  };
}

export default getUserDetails;
