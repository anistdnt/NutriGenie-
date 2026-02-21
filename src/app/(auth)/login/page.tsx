import LoginForm from "@/src/components/auth/LoginForm";
import SocialAuth from "@/src/components/auth/SocialAuth";

export default async function LoginPage() {
  return (
    <div className="w-full max-w-md space-y-4">
      <LoginForm />
      <SocialAuth />
    </div>
  );
}
