import AuthForm from "@/components/features/auth/AuthForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <AuthForm title="Login" submitLabel="Log in" />
    </main>
  );
}
