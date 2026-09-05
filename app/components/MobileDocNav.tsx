import { useState, type ReactNode } from 'react';
import { List, ListTree } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { ScrollArea } from '~/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet';
import { TableOfContents, type TocEntry } from '~/components/TableOfContents';

export function MobileDocNav({
  toc,
  sidebar,
}: {
  toc: TocEntry[];
  sidebar?: ReactNode;
}) {
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);

  if (!sidebar && toc.length === 0) return null;

  return (
    <div className="mb-6 flex gap-2 lg:hidden">
      {sidebar ? (
        <Sheet open={chaptersOpen} onOpenChange={setChaptersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <List data-icon="inline-start" />
              章节
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader>
              <SheetTitle>章节导航</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-5rem)] px-4 pb-6">{sidebar}</ScrollArea>
          </SheetContent>
        </Sheet>
      ) : null}

      {toc.length > 0 ? (
        <Sheet open={tocOpen} onOpenChange={setTocOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <ListTree data-icon="inline-start" />
              目录
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-0">
            <SheetHeader>
              <SheetTitle>本页目录</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-5rem)] px-4 pb-6">
              <TableOfContents entries={toc} onNavigate={() => setTocOpen(false)} />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      ) : null}
    </div>
  );
}
