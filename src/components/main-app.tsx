'use client';

import { useState } from 'react';
import ImageGallery from './image-gallery';
import ImageUploader from './image-uploader';
import type { ImageData } from '@/types';
import { placeholderImages } from '@/lib/placeholder-images.json';

const initialImages: ImageData[] = placeholderImages.map(p => ({
    ...p,
    userId: `user-${Math.random().toString(36).substring(7)}`,
}));

export default function MainApp() {
  const [images, setImages] = useState<ImageData[]>(initialImages);

  const handleImageUpload = (newImage: Omit<ImageData, 'id' | 'createdAt' | 'userId' | 'aiHint'>) => {
    const fullNewImage: ImageData = {
      ...newImage,
      id: new Date().getTime().toString(),
      createdAt: new Date().getTime(),
      userId: 'current-user',
    };
    setImages(prevImages => [fullNewImage, ...prevImages]);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <ImageUploader onImageUploaded={handleImageUpload} />
      <ImageGallery images={images} />
    </div>
  );
}
