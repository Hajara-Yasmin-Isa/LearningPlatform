import AuthForm from "@/components/features/auth/AuthForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <AuthForm title="Sign up" submitLabel="Create account" />
    </main>
  );
}
