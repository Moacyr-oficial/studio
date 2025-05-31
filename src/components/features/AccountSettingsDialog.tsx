
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageUp, Settings as SettingsIcon } from 'lucide-react';

interface AccountSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AccountSettingsDialog({ isOpen, onOpenChange }: AccountSettingsDialogProps) {
  const [name, setName] = useState("Current User Name"); // Placeholder name

  const handleSave = () => {
    // Placeholder for save logic
    console.log("Saving account settings:", { name });
    onOpenChange(false); // Close dialog on save
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-xl shadow-2xl">
        <DialogHeader className="pt-2">
          <DialogTitle className="text-2xl font-semibold">Account Settings</DialogTitle>
          <DialogDescription>
            Manage your profile and preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-6 px-2">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-28 w-28 border-2 border-primary/50">
              <AvatarImage src="https://placehold.co/120x120.png" alt="User avatar" data-ai-hint="profile person" />
              <AvatarFallback>{name.substring(0,1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Button variant="outline" className="rounded-lg text-sm">
              <ImageUp className="mr-2 h-4 w-4" />
              Change Photo
            </Button>
          </div>

          <div className="grid gap-2 px-4">
            <Label htmlFor="name" className="text-left font-medium">
              Display Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg text-base"
              placeholder="Enter your name"
            />
          </div>

          <div className="px-4">
            <Button variant="outline" className="w-full justify-start gap-3 rounded-lg text-base py-6">
              <SettingsIcon className="h-5 w-5 text-muted-foreground" />
              <span>General Settings</span>
            </Button>
          </div>
        </div>
        <DialogFooter className="pb-4 px-6">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="rounded-lg text-base px-6 py-5">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSave} className="rounded-lg text-base px-6 py-5 bg-primary text-primary-foreground hover:bg-primary/90">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
