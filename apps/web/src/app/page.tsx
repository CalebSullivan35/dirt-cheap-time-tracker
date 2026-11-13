import { auth } from "@clerk/nextjs/server";
import { Landing } from "@/components/landing/landing";
import { Tracker } from "@/components/tracker";

// Signed-in people get the timer; everyone else gets the pitch.
export default async function HomePage() {
  const { userId } = await auth();
  return userId ? <Tracker /> : <Landing />;
}
