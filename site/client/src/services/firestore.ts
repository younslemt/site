import { 
  collection, 
  getDocs, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Organization, User, Sprint, Task, Document, Diagnostic } from '../types';

// Generic converter could be used, but for now let's keep it simple with manual mapping if needed
// or just direct usage if types match.

// Organizations
export const getOrganizations = async (): Promise<Organization[]> => {
  const querySnapshot = await getDocs(collection(db, 'organizations'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Organization));
};

export const addOrganization = async (org: Omit<Organization, 'id'>): Promise<Organization> => {
  const docRef = await addDoc(collection(db, 'organizations'), org);
  return { id: docRef.id, ...org };
};

export const updateOrganization = async (id: string, org: Partial<Organization>) => {
  const docRef = doc(db, 'organizations', id);
  await updateDoc(docRef, org);
};

export const deleteOrganization = async (id: string) => {
  await deleteDoc(doc(db, 'organizations', id));
};

// Users
export const getUsers = async (organizationId?: string): Promise<User[]> => {
  let q = collection(db, 'users');
  if (organizationId) {
    // @ts-ignore
    q = query(collection(db, 'users'), where('organizationId', '==', organizationId));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

export const addUser = async (user: Omit<User, 'id'>, customId?: string): Promise<User> => {
  // Note: In a real app, you'd also create the Auth user here using Cloud Functions or Admin SDK
  if (customId) {
    await setDoc(doc(db, 'users', customId), user);
    return { id: customId, ...user };
  } else {
    const docRef = await addDoc(collection(db, 'users'), user);
    return { id: docRef.id, ...user };
  }
};

export const updateUser = async (id: string, user: Partial<User>) => {
  const docRef = doc(db, 'users', id);
  await updateDoc(docRef, user);
};

export const deleteUser = async (id: string) => {
  await deleteDoc(doc(db, 'users', id));
};

// Sprints
export const getSprints = async (organizationId?: string): Promise<Sprint[]> => {
  let q = collection(db, 'sprints');
  if (organizationId) {
    // @ts-ignore
    q = query(collection(db, 'sprints'), where('organizationId', '==', organizationId));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sprint));
};

export const addSprint = async (sprint: Omit<Sprint, 'id'>): Promise<Sprint> => {
  const docRef = await addDoc(collection(db, 'sprints'), sprint);
  return { id: docRef.id, ...sprint };
};

export const updateSprint = async (id: string, sprint: Partial<Sprint>) => {
  const docRef = doc(db, 'sprints', id);
  await updateDoc(docRef, sprint);
};

export const deleteSprint = async (id: string) => {
  await deleteDoc(doc(db, 'sprints', id));
};

// Tasks
export const getTasks = async (sprintId?: string): Promise<Task[]> => {
  let q = collection(db, 'tasks');
  if (sprintId) {
    // @ts-ignore - simple query
    q = query(collection(db, 'tasks'), where('sprintId', '==', sprintId));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
};

export const addTask = async (task: Omit<Task, 'id'>): Promise<Task> => {
  const docRef = await addDoc(collection(db, 'tasks'), task);
  return { id: docRef.id, ...task };
};

export const updateTask = async (id: string, task: Partial<Task>) => {
  const docRef = doc(db, 'tasks', id);
  await updateDoc(docRef, task);
};

export const deleteTask = async (id: string) => {
  await deleteDoc(doc(db, 'tasks', id));
};

// Documents
export const getDocuments = async (organizationId?: string): Promise<Document[]> => {
  let q = collection(db, 'documents');
  if (organizationId) {
    // @ts-ignore
    q = query(collection(db, 'documents'), where('organizationId', '==', organizationId));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
};

export const addDocument = async (docData: Omit<Document, 'id'>): Promise<Document> => {
  const docRef = await addDoc(collection(db, 'documents'), docData);
  return { id: docRef.id, ...docData };
};

export const deleteDocument = async (id: string) => {
  await deleteDoc(doc(db, 'documents', id));
};

// Diagnostics
export const getDiagnostics = async (organizationId?: string): Promise<Diagnostic[]> => {
  let q = collection(db, 'diagnostics');
  if (organizationId) {
    // @ts-ignore
    q = query(collection(db, 'diagnostics'), where('organizationId', '==', organizationId));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Diagnostic));
};

export const addDiagnostic = async (diag: Omit<Diagnostic, 'id'>): Promise<Diagnostic> => {
  const docRef = await addDoc(collection(db, 'diagnostics'), diag);
  return { id: docRef.id, ...diag };
};

export const updateDiagnostic = async (id: string, diag: Partial<Diagnostic>) => {
  const docRef = doc(db, 'diagnostics', id);
  await updateDoc(docRef, diag);
};

export const deleteDiagnostic = async (id: string) => {
  await deleteDoc(doc(db, 'diagnostics', id));
};
