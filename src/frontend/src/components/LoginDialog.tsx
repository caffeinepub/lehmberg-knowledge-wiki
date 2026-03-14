import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Loader2, ShieldCheck } from "lucide-react";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { login, isLoggingIn } = useInternetIdentity();

  const handleLogin = async () => {
    await login();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-ocid="login.dialog">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="font-serif text-xl">
              Login Required
            </DialogTitle>
          </div>
          <DialogDescription className="font-body text-sm leading-relaxed pt-1">
            You need to log in with Internet Identity to create or edit entries.
            Browsing is always open to everyone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:flex-row flex-col">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="font-body"
            data-ocid="login.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="font-body gap-2"
            data-ocid="login.primary_button"
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            {isLoggingIn ? "Connecting..." : "Login with Internet Identity"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
