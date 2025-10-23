import { RoleSelector } from "@/components/RoleSelector";
import { Navbar } from "@/components/Navbar";

export default function SelectRolePage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <RoleSelector />
      </main>
    </>
  );
}
