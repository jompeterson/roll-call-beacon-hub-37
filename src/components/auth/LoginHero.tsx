
export const LoginHero = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 to-primary/40 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/lovable-uploads/ef24d9c6-3b63-47c1-9653-e18341e62604.png')] bg-cover bg-center"></div>
      <div className="absolute inset-0 bg-primary/30"></div>
      <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
        <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
        <p className="text-xl opacity-90">
          Sign in to your account to continue your journey with us.
        </p>
      </div>
    </div>
  );
};
