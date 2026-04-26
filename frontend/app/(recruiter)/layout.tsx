import { AppShell } from "@/components/layout/app-shell";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell role="recruiter">{children}</AppShell>;
}
