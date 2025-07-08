import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, getDoc, setDoc } from "firebase/firestore";

const addPlanejamento = async (perfil, planejamento) => {
  try {
    const docRef = await addDoc(collection(db, perfil), planejamento);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

const getPlanejamentos = async (perfil) => {
  const querySnapshot = await getDocs(collection(db, perfil));
  const planejamentos = [];
  querySnapshot.forEach((doc) => {
    planejamentos.push({ id: doc.id, ...doc.data() });
  });
  return planejamentos;
};

const updatePlanejamento = async (perfil, id, updatedData) => {
  const docRef = doc(db, perfil, id);
  await updateDoc(docRef, updatedData);
};

const deletePlanejamento = async (perfil, id) => {
  const docRef = doc(db, perfil, id);
  await deleteDoc(docRef);
};

// Generic document methods for the new modules
const addDocument = async (collectionName, document) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), document);
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

const getDocuments = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    return documents;
  } catch (e) {
    console.error("Error getting documents: ", e);
    throw e;
  }
};

const updateDocument = async (collectionName, id, updatedData) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, updatedData);
  } catch (e) {
    console.error("Error updating document: ", e);
    throw e;
  }
};

const deleteDocument = async (collectionName, id) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw e;
  }
};

const getDocument = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error getting document: ", e);
    throw e;
  }
};

const setDocument = async (collectionName, documentId, data) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await setDoc(docRef, data);
  } catch (e) {
    console.error("Error setting document: ", e);
    throw e;
  }
};

export { 
  addPlanejamento, 
  getPlanejamentos, 
  updatePlanejamento, 
  deletePlanejamento,
  addDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
  getDocument,
  setDocument
};