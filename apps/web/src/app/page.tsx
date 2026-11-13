import { auth } from "@clerk/nextjs/server";
import { Tracker } from "@/components/tracker";

export default async function HomePage() {
  await auth.protect();
  return <Tracker />;
}
