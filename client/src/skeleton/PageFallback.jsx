import DashSkeleton from "../skeleton/dashSkeleton.jsx";
import HeaderSkeleton from "../skeleton/headerSkeleton.jsx";


export default function PageFallback({ type = "dashboard" }) {
  return (
      console.log("Skeleton Called: Main.jsx"),
    <>
      

      <HeaderSkeleton />
      <main className="bg-[#1e1e2f] min-h-screen">
        {type === "dashboard" && <DashSkeleton />}
        {/* Add more conditionals as you build more skeletons */}
      </main>
    </>
  );
}