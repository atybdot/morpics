import { redirect } from "next/navigation";
// import Dashboard from "./dashboard";

export default async function Page() {
  return redirect("/images");
  // return <Dashboard />;
  // return <p>dashboard</p>;
}
