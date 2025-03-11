import { ThemeSwitcher } from "@/components/theme-switcher";
import Image from "next/image";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <div className="w-full max-w-md mb-8 flex flex-col items-center">
        <Image
          src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Tutor App Logo"
          width={80}
          height={80}
          className="rounded-full border-4 border-primary/10 shadow-xl mb-4"
        />
        <h1 className="text-2xl font-bold text-center text-foreground">
          Tutor App
        </h1>
        <p className="text-sm text-muted-foreground text-center mt-1">
          Your perfect learning companion
        </p>
      </div>
      {children}
    </div>
  );
}
