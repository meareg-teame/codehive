import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteLink: string;
  copyInviteLink: () => void;
}

export default function InviteModal({
  isOpen,
  onClose,
  inviteLink,
  copyInviteLink,
}: InviteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-popover border border-white/10 rounded-2xl max-w-sm">
        <DialogHeader className="flex flex-col items-start space-y-2">
          <DialogTitle className="text-lg font-semibold">Invite to Project</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Share this link with teammates to give them access to the project.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 w-full mt-2">
          <Input
            readOnly
            value={inviteLink}
            className="flex-1 bg-accent/30 border-white/5 h-10 rounded-lg"
          />
          <Button
            onClick={copyInviteLink}
            className="flex-shrink-0 h-10 px-3 bg-primary text-primary-foreground rounded-lg"
          >
            Copy
          </Button>
        </div>
        <DialogClose asChild>
          <Button
            variant="ghost"
            className="absolute top-3 right-3 h-8 w-8 p-0 hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
