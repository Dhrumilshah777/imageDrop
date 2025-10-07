import { GalleryVertical } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <GalleryVertical className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">ImageDrop</h1>
        </div>
      </div>
    </header>
  );
}
