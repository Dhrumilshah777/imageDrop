'use client';

import { useState } from 'react';
import ImageGallery from './image-gallery';
import ImageUploader from './image-uploader';
import type { ImageData } from '@/types';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { useUser } from '@/firebase';
import { Button } from './ui/button';
import Link from 'next/link';

const initialImages: ImageData[] = placeholderImages.map(p => ({
    ...p,
    userId: `user-${Math.random().toString(36).substring(7)}`,
}));

export default function MainApp() {
  const [images, setImages] = useState<ImageData[]>(initialImages);
  const { user, isUserLoading } = useUser();

  const handleImageUpload = (newImage: Omit<ImageData, 'id' | 'createdAt' | 'userId' | 'aiHint'>) => {
    if (!user) return;
    const fullNewImage: ImageData = {
      ...newImage,
      id: new Date().getTime().toString(),
      createdAt: new Date().getTime(),
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      userPhotoURL: user.photoURL || `https://i.pravatar.cc/40?u=${user.uid}`,
    };
    setImages(prevImages => [fullNewImage, ...prevImages]);
  };
  
  if (isUserLoading) {
    return <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">Loading...</div>
  }

  if (!user) {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Welcome to ImageDrop</h2>
            <p className="text-muted-foreground mb-8">Please log in to upload and view images.</p>
            <div className="flex justify-center gap-4">
                <Button asChild>
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild variant="secondary">
                    <Link href="/signup">Sign Up</Link>
                </Button>
            </div>
        </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <ImageUploader onImageUploaded={handleImageUpload} />
      <ImageGallery images={images} />
    </div>
  );
}