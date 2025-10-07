'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import type { ImageData } from '@/types';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';

const getInitials = (name: string | null | undefined) => {
  if (!name) return 'U';
  const names = name.split(' ');
  const initials = names.map((n) => n[0]).join('');
  return initials.toUpperCase().slice(0, 2);
};

export default function ImageGallery() {
  const { user } = useUser();
  const firestore = useFirestore();

  const allImagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Note: This query requires a composite index on `createdAt` desc.
    // Firestore will provide a link in the console error to create it automatically.
    return query(collection(firestore, 'images'), orderBy('createdAt', 'desc'), limit(50));
  }, [firestore]);

  const { data: images, isLoading, error } = useCollection<ImageData>(allImagesQuery);
  
  // This composite index can be created from the link firebase provides in the browser console.
  const userImagesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, `users/${user.uid}/images`), orderBy('createdAt', 'desc'), limit(20));
  }, [firestore, user]);

  const { data: userImages, isLoading: isUserImagesLoading } = useCollection<ImageData>(userImagesQuery);
  
  const mergedImages = useMemoFirebase(() => {
    const all = [...(userImages || []), ...(images || [])];
    const uniqueImages = Array.from(new Map(all.map(item => [item.id, item])).values());
    return uniqueImages.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  }, [userImages, images]);

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
         <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
                <Skeleton className="aspect-square w-full" />
                <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </CardContent>
         </Card>
      ))}
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-4">Gallery</h2>
      {(isLoading || isUserImagesLoading) && !mergedImages ? renderSkeleton() :
        error ? <p className="text-destructive">Error loading images: {error.message}</p> :
        mergedImages && mergedImages.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-8 border-dashed">
              <p className="text-muted-foreground">The gallery is empty. Be the first to upload an image!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {mergedImages && mergedImages.map((image) => (
              <Card key={image.id} className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:scale-105">
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <Image
                      src={image.url}
                      alt={`Image uploaded by ${image.userName}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      data-ai-hint={image.aiHint}
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
                          {formatDistanceToNow(image.createdAt.toDate(), { addSuffix: true })}
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
