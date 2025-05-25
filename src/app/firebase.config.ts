import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { environment } from '../environments/environment';

const app = initializeApp(environment.firebase);
export const db: Firestore = getFirestore(app); 