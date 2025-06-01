
"use client";

import { useState, useEffect, useRef } from 'react';
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
const DEFAULT_AVATAR_SRC = "https://placehold.co/120x120.png";
const LOCAL_STORAGE_USER_NAME_KEY = 'bedrockAIUserName';
const LOCAL_STORAGE_AVATAR_KEY = 'bedrockAIUserAvatar';

export function AccountSettingsDialog({ isOpen, onOpenChange }: AccountSettingsDialogProps) {
  const [name, setName] = useState(DEFAULT_USER_NAME);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const [currentAvatarSrc, setCurrentAvatarSrc] = useState(DEFAULT_AVATAR_SRC);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const storedName = localStorage.getItem(LOCAL_STORAGE_USER_NAME_KEY);
      setName(storedName || DEFAULT_USER_NAME);

      const storedAvatar = localStorage.getItem(LOCAL_STORAGE_AVATAR_KEY);
      setCurrentAvatarSrc(storedAvatar || DEFAULT_AVATAR_SRC);
      setAvatarPreview(null); // Reset preview when dialog opens
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_USER_NAME_KEY, name);
      if (avatarPreview) {
        localStorage.setItem(LOCAL_STORAGE_AVATAR_KEY, avatarPreview);
        setCurrentAvatarSrc(avatarPreview); // Ensure currentAvatarSrc is updated for next open
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    setIsSaving(false);
    toast({
      title: "Settings Saved",
      description: "Your account settings have been updated.",
    });
    onOpenChange(false);
  };

  const handleAvatarChangeClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    setAvatarPreview(null); // Reset preview on cancel
    onOpenChange(false);
  };

  const displayedAvatar = avatarPreview || currentAvatarSrc;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleCancel(); // Ensure preview is reset if dialog is closed via X or overlay click
      else onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[480px] rounded-xl shadow-2xl bg-background border-0">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-foreground">Account Settings</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Manage your profile and preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-28 w-28 border-2 border-primary/50">
              <AvatarImage src={displayedAvatar} alt="User avatar" data-ai-hint="profile person" />
              <AvatarFallback>{name.substring(0,1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button variant="outline" className="rounded-lg text-sm border-border hover:bg-accent hover:text-accent-foreground" onClick={handleAvatarChangeClick} disabled={isSaving}>
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
        <DialogFooter className="pb-4 pt-2">
           <Button type="button" variant="outline" className="rounded-lg text-base px-6 py-5 border-border hover:bg-accent hover:text-accent-foreground text-foreground" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
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
