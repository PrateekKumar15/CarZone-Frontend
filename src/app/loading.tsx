export default function Loading() {
  return (
    <div className="flex items-center justify-center absolute h-dvh w-screen z-[100] overflow-hidden bg-background">
      <div className="three-body">
        <div className="three-body__dot"></div>
        <div className="three-body__dot"></div>
        <div className="three-body__dot"></div>
      </div>
    </div>
  );
}
