import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/ui/ModeToggle";
export default function Home() {
  return (
    <div>
      <SignedOut>
              <SignInButton  mode="modal">
                <Button className="m-4" variant="default">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="mt-4" variant="secondary">Sign Up</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <ModeToggle />
    </div>
    
  );
}

