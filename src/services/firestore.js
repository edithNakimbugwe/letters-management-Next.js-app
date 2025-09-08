import { db } from '../firebase-config/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';

// Users Collection Functions
export const createUserDocument = async (user, additionalData = {}) => {
  if (!user) return;
  
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnapshot = await getDoc(userRef);
    
    if (!userSnapshot.exists()) {
      const { displayName, email } = user;
      const createdAt = serverTimestamp();
      
      await setDoc(userRef, {
        displayName: displayName || additionalData.displayName || '',
        email,
        createdAt,
        updatedAt: createdAt,
        ...additionalData
      });
      console.log('User document created successfully');
    }
    
    return userRef;
  } catch (error) {
    console.error('Error creating user document:', error);
    if (error.code === 'permission-denied') {
      console.error('Permission denied. Please check Firestore security rules.');
    }
    throw error;
  }
};

export const getUserDocument = async (uid) => {
  if (!uid) return null;
  
  try {
    const userRef = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userRef);
    
    if (userSnapshot.exists()) {
      return { id: userSnapshot.id, ...userSnapshot.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user document:', error);
    if (error.code === 'permission-denied') {
      console.error('Permission denied. Please check Firestore security rules.');
      return null; // Return null instead of throwing to prevent app crash
    }
    throw error;
  }
};

export const updateUserDocument = async (uid, updates) => {
  if (!uid) return;
  
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    console.log('User document updated successfully');
  } catch (error) {
    console.error('Error updating user document:', error);
    throw error;
  }
};

// Letters Collection Functions
export const createLetter = async (letterData, currentUser) => {
  if (!currentUser) {
    throw new Error('User must be logged in to create a letter');
  }
  
  try {
    // Get the current user's document to get their full name
    const userDoc = await getUserDocument(currentUser.uid);
    const receivedBy = userDoc?.displayName || currentUser.displayName || currentUser.email;
    
    const letterRef = await addDoc(collection(db, 'letters'), {
      ...letterData,
      receivedBy,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Letter created successfully with ID:', letterRef.id);
    return letterRef;
  } catch (error) {
    console.error('Error creating letter:', error);
    throw error;
  }
};

export const getLetters = async (userId = null) => {
  try {
    let q;
    
    if (userId) {
      // Get letters for specific user (without orderBy to avoid composite index requirement)
      q = query(
        collection(db, 'letters'), 
        where('createdBy', '==', userId)
      );
    } else {
      // Get all letters (for admin view)
      q = query(collection(db, 'letters'));
    }
    
    const querySnapshot = await getDocs(q);
    const letters = [];
    
    querySnapshot.forEach((doc) => {
      letters.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort on the client side to avoid composite index requirement
    letters.sort((a, b) => {
      const aDate = a.createdAt?.toDate() || new Date(0);
      const bDate = b.createdAt?.toDate() || new Date(0);
      return bDate - aDate; // Descending order (newest first)
    });
    
    return letters;
  } catch (error) {
    console.error('Error getting letters:', error);
    throw error;
  }
};

export const getLetterById = async (letterId) => {
  if (!letterId) return null;
  
  try {
    const letterRef = doc(db, 'letters', letterId);
    const letterSnapshot = await getDoc(letterRef);
    
    if (letterSnapshot.exists()) {
      return { id: letterSnapshot.id, ...letterSnapshot.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting letter:', error);
    throw error;
  }
};

export const updateLetter = async (letterId, updates, currentUser) => {
  if (!letterId || !currentUser) return;
  
  try {
    const letterRef = doc(db, 'letters', letterId);
    
    // Get the current user's document to get their full name (in case name changed)
    const userDoc = await getUserDocument(currentUser.uid);
    const receivedBy = userDoc?.displayName || currentUser.displayName || currentUser.email;
    
    await updateDoc(letterRef, {
      ...updates,
      receivedBy, // Update receivedBy in case user's name changed
      updatedAt: serverTimestamp()
    });
    
    console.log('Letter updated successfully');
  } catch (error) {
    console.error('Error updating letter:', error);
    throw error;
  }
};

export const deleteLetter = async (letterId) => {
  if (!letterId) return;
  
  try {
    const letterRef = doc(db, 'letters', letterId);
    await deleteDoc(letterRef);
    console.log('Letter deleted successfully');
  } catch (error) {
    console.error('Error deleting letter:', error);
    throw error;
  }
};

// Search letters
export const searchLetters = async (searchTerm, userId = null) => {
  try {
    let q;
    
    if (userId) {
      q = query(
        collection(db, 'letters'),
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(collection(db, 'letters'), orderBy('createdAt', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    const letters = [];
    
    querySnapshot.forEach((doc) => {
      const letterData = { id: doc.id, ...doc.data() };
      
      // Simple text search (you can enhance this with better search logic)
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = (
        letterData.title?.toLowerCase().includes(searchTermLower) ||
        letterData.content?.toLowerCase().includes(searchTermLower) ||
        letterData.senderName?.toLowerCase().includes(searchTermLower) ||
        letterData.receivedBy?.toLowerCase().includes(searchTermLower)
      );
      
      if (matchesSearch) {
        letters.push(letterData);
      }
    });
    
    return letters;
  } catch (error) {
    console.error('Error searching letters:', error);
    throw error;
  }
};
