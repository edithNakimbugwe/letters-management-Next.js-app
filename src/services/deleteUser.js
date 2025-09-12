import { auth } from "../firebase-config/firebase";
import { deleteUser as firebaseDeleteUser } from "firebase/auth";

// Delete a user from Firebase Authentication (must be signed in as that user)
export const deleteUserFromAuth = async (user) => {
  try {
    // This only works for the currently signed-in user
    await firebaseDeleteUser(user);
    return true;
  } catch (error) {
    throw error;
  }
};
