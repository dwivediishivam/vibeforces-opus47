import Image from "next/image";

export function ScreenshotViewer({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <div className="surface-card overflow-hidden rounded-2xl p-4">
      <div className="overflow-hidden rounded-xl border border-[#1e293b] bg-[#030712]">
        <Image
          src={src}
          alt={alt}
          width={1280}
          height={900}
          className="h-auto w-full object-cover"
          unoptimized
        />
      </div>
    </div>
  );
}
