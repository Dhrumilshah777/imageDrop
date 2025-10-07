import { Timestamp } from 'firebase/firestore';

export interface ImageData {
  id: string;
  url: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  // Allow createdAt to be a Timestamp from Firestore or a number from JSON
  createdAt: Timestamp | number;
  aiHint?: string;
}
