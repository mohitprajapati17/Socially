import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import prisma from "@/lib/prisma";

export default async function Home() {
  const data =prisma.user.findMany();
  console.log(data);
  return (
    <div>
      <h1>Home page content</h1>
    </div>
  );
}

