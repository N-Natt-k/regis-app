import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  setDoc,
  Timestamp 
} from "firebase/firestore";
import { db } from "../firebase";
import { StudentData, SystemConfig, Announcement, UserRole, Project, SystemSettings } from "../types";

// --- Users (Students) ---

export const registerStudent = async (data: Omit<StudentData, 'role' | 'isCoreLeader' | 'isCommittee'>) => {
  // Check if student ID already exists
  const q = query(collection(db, "users"), where("studentId", "==", data.studentId));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    throw new Error(`รหัสนักเรียน ${data.studentId} นี้ลงทะเบียนไปแล้ว`);
  }

  const newStudent: StudentData = {
    ...data,
    role: UserRole.STUDENT,
    isCoreLeader: false,
    isCommittee: false,
    academicYear: data.academicYear || "" // Use provided year or empty
  };

  return await addDoc(collection(db, "users"), newStudent);
};

export const loginStudent = async (studentId: string, phone: string): Promise<StudentData | null> => {
  const q = query(
    collection(db, "users"), 
    where("studentId", "==", studentId),
    where("phone", "==", phone)
  );
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const docData = querySnapshot.docs[0];
  return { id: docData.id, ...docData.data() } as StudentData;
};

export const getAllStudents = async (): Promise<StudentData[]> => {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as StudentData));
};

export const getStudentByStdId = async (studentId: string): Promise<StudentData | null> => {
  const q = query(collection(db, "users"), where("studentId", "==", studentId));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const docData = querySnapshot.docs[0];
  return { id: docData.id, ...docData.data() } as StudentData;
};

export const updateStudent = async (id: string, data: Partial<StudentData>) => {
  const ref = doc(db, "users", id);
  await updateDoc(ref, data);
};

export const deleteStudent = async (id: string) => {
  await deleteDoc(doc(db, "users", id));
};

export const bulkDeleteApplications = async (field: 'isCoreLeader' | 'isCommittee') => {
  const q = query(collection(db, "users"), where(field, "==", true));
  const snapshot = await getDocs(q);
  const updatePromises = snapshot.docs.map(d => updateDoc(d.ref, { 
    [field]: false,
    [field === 'isCoreLeader' ? 'coreLeaderAppliedDate' : 'committeeAppliedDate']: null 
  }));
  await Promise.all(updatePromises);
};

// --- Config ---

export const getSystemConfig = async (key: string): Promise<SystemConfig | null> => {
  const ref = doc(db, "config", key);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as SystemConfig;
  }
  return null;
};

export const saveSystemConfig = async (key: string, data: Partial<SystemConfig>) => {
  const ref = doc(db, "config", key);
  await setDoc(ref, { key, ...data }, { merge: true });
};

// --- System Settings (Academic Year) ---

export const getSystemSettings = async (): Promise<SystemSettings> => {
  const ref = doc(db, "settings", "general");
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as SystemSettings;
  }
  // Default if not exists
  return { currentAcademicYear: "2567" };
};

export const saveSystemSettings = async (data: Partial<SystemSettings>) => {
  const ref = doc(db, "settings", "general");
  await setDoc(ref, data, { merge: true });
};

// --- Projects ---

export const getProjects = async (academicYear?: string): Promise<Project[]> => {
  let q = query(collection(db, "projects"));
  if (academicYear) {
    q = query(collection(db, "projects"), where("academicYear", "==", academicYear));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
};

export const getProjectByRoom = async (academicYear: string, grade: string, room: string): Promise<Project | null> => {
  const q = query(
    collection(db, "projects"), 
    where("academicYear", "==", academicYear),
    where("grade", "==", grade),
    where("room", "==", room)
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Project;
  }
  return null;
};

export const addProject = async (project: Project) => {
  await addDoc(collection(db, "projects"), project);
};

export const updateProject = async (id: string, data: Partial<Project>) => {
  await updateDoc(doc(db, "projects", id), data);
};

export const deleteProject = async (id: string) => {
  await deleteDoc(doc(db, "projects", id));
};

// --- Announcements ---

export const getAnnouncements = async (category: string): Promise<Announcement[]> => {
  const q = query(collection(db, "announcements"), where("category", "==", category));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
};

export const addAnnouncement = async (announcement: Announcement) => {
  await addDoc(collection(db, "announcements"), announcement);
};

export const deleteAnnouncement = async (id: string) => {
  await deleteDoc(doc(db, "announcements", id));
};