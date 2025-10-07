import { Timestamp } from 'firebase/firestore';

export interface ImageData {
  id: string;
  url: string;
  userId: string;
  userName: string;
  userPhotoURL: string;
  createdAt: Timestamp;
  aiHint?: string;
}
