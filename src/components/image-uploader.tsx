'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import type { ImageData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, X, FileImage } from 'lucide-react';

interface ImageUploaderProps {
  onImageUploaded: (image: Omit<ImageData, 'id' | 'createdAt' | 'userId' | 'aiHint'>) => void;
}

export default function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "File too large", description: "Please select an image smaller than 5MB.", variant: "destructive" });
        return;
      }
      setFile(selectedFile);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const clearSelection = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file || !previewUrl) return;

    setIsUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return 10;
        if (prev >= 90) return 95;
        return prev + 10;
      });
    }, 100);

    // Simulate upload delay
    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);

      onImageUploaded({
        url: previewUrl, // This is a local blob URL
        userName: 'You',
        userPhotoURL: 'https://i.pravatar.cc/40?u=you',
      });

      toast({ title: "Upload successful!", description: "Your image has been added to the gallery." });
      
      // Do not revoke object URL here as it's passed to parent
      // It will be naturally garbage collected when the component unmounts or page is left
      
      setFile(null);
      setPreviewUrl(null);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
      
      setIsUploading(false);
      setUploadProgress(null);
    }, 1500);
  };
  
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
        if (droppedFile.size > 5 * 1024 * 1024) {
            toast({ title: "File too large", description: "Please select an image smaller than 5MB.", variant: "destructive" });
            return;
        }
        setFile(droppedFile);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(URL.createObjectURL(droppedFile));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload an Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!previewUrl ? (
          <div 
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted rounded-lg text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-semibold text-accent">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, image/gif"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative w-full max-w-sm mx-auto aspect-video rounded-lg overflow-hidden border">
              <Image src={previewUrl} alt="Image preview" fill className="object-contain" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 rounded-full z-10"
                onClick={clearSelection}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded-md">
                <FileImage className="h-5 w-5 flex-shrink-0"/>
                <span className="truncate flex-grow">{file?.name}</span>
                <span className="flex-shrink-0 text-xs">({file && (file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          </div>
        )}

        {uploadProgress !== null && (
          <Progress value={uploadProgress} className="w-full" />
        )}
        
        <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full bg-accent hover:bg-accent/90">
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </Button>
      </CardContent>
    </Card>
  );
}
