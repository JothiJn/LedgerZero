// Server component — static shell only, no hooks. Pages pass in their own
// right-side actions (selectors, buttons) as children where needed.
export default function Header({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
      <h1 className="text-[26px] font-extrabold tracking-tight text-gray-800">{title}</h1>
      <div className="flex items-center gap-3.5">{children}</div>
    </header>
  );
}
