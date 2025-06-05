import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";

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

export { addPlanejamento, getPlanejamentos, updatePlanejamento, deletePlanejamento };