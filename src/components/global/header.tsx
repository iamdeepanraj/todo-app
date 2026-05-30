"use client"

import { authClient, signOut } from "@/lib/auth-client";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

export default function Header() {
  const { data: session } = authClient.useSession()
  return (
    <>
      <header>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">Todo App</h1>
        <nav className="flex gap-8">
        <Link href={"/"} className="text-sm font-medium">Home</Link>
        <Link href={"/about"} className="text-sm font-medium">About</Link>
        <Link href={"/contact"} className="text-sm font-medium">Contact</Link>
        </nav>
        <div className="flex gap-4 items-center">
          <div className="text-sm font-medium">{session?.user?.name}</div>
        <Avatar>
          {session?.user?.image && (
            <AvatarImage src={session.user.image} referrerPolicy="no-referrer" alt={session.user.name} />
          )}
          <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        <Button variant="outline" type="button" onClick={async () => await signOut()}>
          Sign out
        </Button>
        </div>
      </div>
    </header>
    </>
  )
}