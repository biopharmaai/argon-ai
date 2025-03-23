import { redirect } from "next/navigation";

// interface CatchAllParams {
//   params: Promise<{ catchAll?: string[] }>;
// }

export default async function CatchAllPage() {
  console.log("CatchAllPage");
  // const { catchAll } = await params;

  // Access cookies to check for the `id_token`

  redirect("/search");
}
