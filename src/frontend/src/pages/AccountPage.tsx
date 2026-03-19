import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useCreateStudentAccount, useLoginStudent } from "../hooks/useQueries";

interface AccountPageProps {
  onEnter: (name: string, password: string) => void;
  onTeacher: () => void;
}

export function AccountPage({ onEnter, onTeacher }: AccountPageProps) {
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState("");

  const loginMutation = useLoginStudent();
  const signupMutation = useCreateStudentAccount();

  const handleLogin = async () => {
    if (!loginName.trim() || !loginPassword.trim()) return;
    setLoginError("");
    try {
      const ok = await loginMutation.mutateAsync({
        name: loginName.trim(),
        password: loginPassword,
      });
      if (ok) {
        sessionStorage.setItem("studentName", loginName.trim());
        sessionStorage.setItem("studentPassword", loginPassword);
        onEnter(loginName.trim(), loginPassword);
      } else {
        setLoginError("Wrong name or password. Try again! 🙈");
      }
    } catch {
      setLoginError("Something went wrong. Please try again.");
    }
  };

  const handleSignup = async () => {
    if (!signupName.trim() || !signupPassword.trim()) return;
    setSignupError("");
    try {
      await signupMutation.mutateAsync({
        name: signupName.trim(),
        password: signupPassword,
      });
      // Auto-login after signup
      sessionStorage.setItem("studentName", signupName.trim());
      sessionStorage.setItem("studentPassword", signupPassword);
      onEnter(signupName.trim(), signupPassword);
    } catch (e: any) {
      const msg = e?.message ?? "";
      if (
        msg.toLowerCase().includes("taken") ||
        msg.toLowerCase().includes("exists")
      ) {
        setSignupError("That name is already taken! Try a different one. 🎭");
      } else {
        setSignupError("Could not create account. Try again!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="text-7xl mb-3">🎧</div>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl">
          Listen <span className="text-primary">&amp; Spell</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-base font-body">
          Learn to spell with fun listening games!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-sm bg-card rounded-3xl border-2 border-border shadow-game p-6"
      >
        <Tabs defaultValue="login">
          <TabsList className="w-full mb-6 rounded-2xl">
            <TabsTrigger
              data-ocid="account.login_tab"
              value="login"
              className="flex-1 rounded-xl font-semibold"
            >
              🔑 Log In
            </TabsTrigger>
            <TabsTrigger
              data-ocid="account.signup_tab"
              value="signup"
              className="flex-1 rounded-xl font-semibold"
            >
              ✨ Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-name" className="font-semibold text-sm">
                Your Name
              </Label>
              <Input
                id="login-name"
                data-ocid="account.login_name_input"
                placeholder="e.g. Alex"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="h-12 text-base rounded-xl"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password" className="font-semibold text-sm">
                Password
              </Label>
              <Input
                id="login-password"
                data-ocid="account.login_password_input"
                type="password"
                placeholder="Your secret password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="h-12 text-base rounded-xl"
              />
            </div>
            {loginError && (
              <motion.p
                data-ocid="account.login_error_state"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-sm font-semibold bg-destructive/10 rounded-xl px-3 py-2"
              >
                {loginError}
              </motion.p>
            )}
            <Button
              data-ocid="account.login_submit_button"
              onClick={handleLogin}
              disabled={
                !loginName.trim() ||
                !loginPassword.trim() ||
                loginMutation.isPending
              }
              className="w-full h-12 text-base font-bold rounded-xl gap-2"
            >
              {loginMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Let's Play! 🎮"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name" className="font-semibold text-sm">
                Choose Your Name
              </Label>
              <Input
                id="signup-name"
                data-ocid="account.signup_name_input"
                placeholder="e.g. Alex"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                className="h-12 text-base rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="signup-password"
                className="font-semibold text-sm"
              >
                Create a Password
              </Label>
              <Input
                id="signup-password"
                data-ocid="account.signup_password_input"
                type="password"
                placeholder="Something easy to remember"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                className="h-12 text-base rounded-xl"
              />
            </div>
            {signupError && (
              <motion.p
                data-ocid="account.signup_error_state"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-sm font-semibold bg-destructive/10 rounded-xl px-3 py-2"
              >
                {signupError}
              </motion.p>
            )}
            <Button
              data-ocid="account.signup_submit_button"
              onClick={handleSignup}
              disabled={
                !signupName.trim() ||
                !signupPassword.trim() ||
                signupMutation.isPending
              }
              className="w-full h-12 text-base font-bold rounded-xl gap-2"
            >
              {signupMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create Account! 🌟"
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </motion.div>

      <motion.button
        data-ocid="account.teacher_link"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onTeacher}
        className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors font-semibold"
      >
        Are you a teacher? Click here 👩‍🏫
      </motion.button>

      <footer className="mt-12 text-xs text-muted-foreground text-center">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
