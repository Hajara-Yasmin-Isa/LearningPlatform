import Image from 'next/image'

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5">
      <div className="animate-bounce">
        <Image
          src="/logo.png"
          alt="Loading"
          width={52}
          height={52}
          className="rounded-full grayscale opacity-25"
        />
      </div>
      <div className="flex gap-1.5 items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:120ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:240ms]" />
      </div>
    </div>
  )
}
