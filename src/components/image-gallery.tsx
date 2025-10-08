'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import type { ImageData } from '@/types';
import { Skeleton } from './ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';

const getInitials = (name: string | null | undefined) => {
  if (!name) return 'U';
  const names = name.split(' ');
  const initials = names.map((n) => n[0]).join('');
  return initials.toUpperCase().slice(0, 2);
};

const toDate = (date: Timestamp | number | Date): Date => {
  if (date instanceof Timestamp) {
    return date.toDate();
  }
  return new Date(date);
}

export default function ImageGallery() {
  const firestore = useFirestore();
  
  const imagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'images'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: images, isLoading } = useCollection<ImageData>(imagesQuery);

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
         <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
                <Skeleton className="aspect-square w-full" />
                <div className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className='space-y-1'>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                </div>
            </CardContent>
         </Card>
      ))}
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-4">Gallery</h2>
      {isLoading ? renderSkeleton() :
        !images || images.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-8 border-dashed">
              <p className="text-muted-foreground">The gallery is empty. Upload an image to get started!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:_cols-4 xl:grid-cols-5 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:scale-105">
                <CardContent className="p-0">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={image.url}
                      alt={`Image uploaded by ${image.userName}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      data-ai-hint={image.aiHint}
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    />
                  </div>
                  <div className="p-3 bg-card/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={image.userPhotoURL} />
                        <AvatarFallback>{getInitials(image.userName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium truncate">{image.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {image.createdAt ? formatDistanceToNow(toDate(image.createdAt), { addSuffix: true }) : 'Just now'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      }
    </div>
  );
}
