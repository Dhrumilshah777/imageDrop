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

  // The uploader is temporarily removed until the Storage issue is resolved.
  // We will show the gallery with placeholder data for all users.

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {!user && (
         <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Welcome to ImageDrop</h2>
            <p className="text-muted-foreground mb-8">Log in or sign up to get started.</p>
         </div>
      )}
      {user && (
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Welcome, {user.displayName}!</h2>
          <p className="text-muted-foreground mb-8">The gallery is currently showing placeholder images. Once backend setup is complete, you'll be able to upload your own.</p>
        </div>
      )}
      <ImageGallery />
    </div>
  );
}
