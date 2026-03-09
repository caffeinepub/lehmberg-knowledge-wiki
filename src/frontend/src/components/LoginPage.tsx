import { Button } from "@/components/ui/button";
import { useAuthState } from "@/hooks/useAuthState";
import { Leaf, Sprout } from "lucide-react";
import { motion } from "motion/react";

export function LoginPage() {
  const { login, isLoggingIn } = useAuthState();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background paper-texture px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full text-center"
      >
        {/* Logo / emblem */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Sprout className="w-6 h-6 text-primary" />
          </div>
        </div>

        <h1 className="font-serif text-4xl text-foreground mb-2 tracking-tight">
          Lehmberg Knowledge Wiki
        </h1>
        <p className="text-muted-foreground font-body text-lg mb-10 italic">
          A living record of the farmstead
        </p>

        <div className="bg-card border border-border rounded-lg p-8 shadow-parchment">
          <div className="flex items-center justify-center mb-5">
            <Leaf className="w-5 h-5 text-muted-foreground mr-2" />
            <p className="text-sm text-muted-foreground font-body">
              Sign in to access and edit the wiki
            </p>
          </div>

          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full text-base py-6 bg-primary text-primary-foreground hover:bg-primary/90 font-body"
            data-ocid="login.primary_button"
          >
            {isLoggingIn ? "Connecting..." : "Sign In"}
          </Button>

          <p className="mt-4 text-xs text-muted-foreground font-body">
            Uses Internet Identity for secure, decentralized authentication.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
