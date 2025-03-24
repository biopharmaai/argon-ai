// import { redirect } from "next/navigation";

// export default async function CatchAllPage() {
//   redirect("/");
// }

import { notFound } from "next/navigation";

export default function CatchAllPage() {
  console.log("🔥 Catch-all route hit!");
  notFound();
}
