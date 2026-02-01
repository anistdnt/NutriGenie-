import RegisterForm from "@/src/components/auth/RegisterForm";
import SocialAuth from "@/src/components/auth/SocialAuth";

export default async function RegisterPage() {

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <RegisterForm />
        <SocialAuth />
      </div>
    </div>
  );
}