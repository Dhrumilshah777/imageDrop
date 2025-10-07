'use client';

import ImageGallery from './image-gallery';
import ImageUploader from './image-uploader';
import { useUser } from '@/firebase';
import AuthButtons from './auth-buttons';

export default function MainApp() {
  const { user, isUserLoading } = useUser();
  
  if (isUserLoading) {
    return <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">Loading...</div>
  }

  if (!user) {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Welcome to ImageDrop</h2>
            <p className="text-muted-foreground mb-8">Please log in to upload and view images.</p>
            <div className="flex justify-center gap-4">
                <AuthButtons />
            </div>
        </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <ImageUploader />
      <ImageGallery />
    </div>
  );
}
