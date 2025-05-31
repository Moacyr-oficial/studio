
"use client";

import { useState, useEffect } from 'react';
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
import { ImageUp, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccountSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const DEFAULT_USER_NAME = "Bedrock Developer";

export function AccountSettingsDialog({ isOpen, onOpenChange }: AccountSettingsDialogProps) {
  const [name, setName] = useState(DEFAULT_USER_NAME);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  // const [avatarSrc, setAvatarSrc] = useState("https://placehold.co/120x120.png");

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const storedName = localStorage.getItem('bedrockAIUserName');
      setName(storedName || DEFAULT_USER_NAME);
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    // Placeholder for save logic
    console.log("Saving account settings:", { name });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (typeof window !== 'undefined') {
      localStorage.setItem('bedrockAIUserName', name);
    }

    setIsSaving(false);
    toast({
      title: "Settings Saved",
      description: "Your account settings have been updated.",
    });
    onOpenChange(false); // Close dialog on save
  };

  const handlePhotoChange = () => {
    // Placeholder for photo change logic
    console.log("Change photo clicked");
    toast({
      title: "Feature not implemented",
      description: "Changing photo is not yet available.",
      variant: "default",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-xl shadow-2xl bg-background">
        <DialogHeader className="pt-2">
          <DialogTitle className="text-2xl font-semibold text-foreground">Account Settings</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Manage your profile and preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-6 px-2">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-28 w-28 border-2 border-primary/50">
              <AvatarImage src="https://placehold.co/120x120.png" alt="User avatar" data-ai-hint="profile person" />
              <AvatarFallback>{name.substring(0,1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Button variant="outline" className="rounded-lg text-sm border-border hover:bg-accent hover:text-accent-foreground" onClick={handlePhotoChange}>
              <ImageUp className="mr-2 h-4 w-4" />
              Change Photo
            </Button>
          </div>

          <div className="grid gap-2 px-4">
            <Label htmlFor="name" className="text-left font-medium text-foreground">
              Display Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg text-base border-input bg-secondary text-secondary-foreground placeholder:text-muted-foreground focus:ring-ring"
              placeholder="Enter your name"
              disabled={isSaving}
            />
          </div>

          <div className="px-4">
            <Button variant="outline" className="w-full justify-start gap-3 rounded-lg text-base py-6 border-border hover:bg-accent hover:text-accent-foreground text-foreground" disabled={isSaving}>
              <SettingsIcon className="h-5 w-5 text-muted-foreground" />
              <span>General Settings</span>
            </Button>
          </div>
        </div>
        <DialogFooter className="pb-4 px-6">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="rounded-lg text-base px-6 py-5 border-border hover:bg-accent hover:text-accent-foreground text-foreground" disabled={isSaving}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSave} className="rounded-lg text-base px-6 py-5 bg-primary text-primary-foreground hover:bg-primary/90 min-w-[140px]" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
