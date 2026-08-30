"use client"

import { upload } from "@vercel/blob/client"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"

async function imageDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve) => {
    const image = new Image()
    const url = URL.createObjectURL(file)
    image.onload = () => { resolve({ width: image.naturalWidth, height: image.naturalHeight }); URL.revokeObjectURL(url) }
    image.onerror = () => { resolve({ width: 0, height: 0 }); URL.revokeObjectURL(url) }
    image.src = url
  })
}

export default function MediaUploader() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState(0)
  const [state, setState] = useState<"idle" | "uploading" | "error">("idle")
  const [error, setError] = useState("")

  const choose = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setState("uploading")
    setError("")
    try {
      const dimensions = await imageDimensions(file)
      const blob = await upload(`subroverse/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/media/upload",
        multipart: file.size > 5 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      })
      const response = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ storageKey: blob.pathname, url: blob.url, filename: file.name, mimeType: file.type, bytes: file.size, ...dimensions, altText: "" }),
      })
      if (!response.ok) throw new Error("The image uploaded but its metadata could not be saved.")
      setState("idle")
      setProgress(0)
      if (inputRef.current) inputRef.current.value = ""
      router.refresh()
    } catch (uploadError) {
      setState("error")
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.")
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-[#b896d1]/20 bg-[#151120] p-6 text-center">
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" onChange={(event) => choose(event.target.files)} className="sr-only" id="media-upload" />
      <p className="font-display text-xl font-light italic text-[#cfc4dc]">Drop a photograph into the garden.</p>
      <p className="mt-2 text-xs text-[#6f627e]">JPEG, PNG, WebP, AVIF or GIF · up to 20 MB</p>
      <button onClick={() => inputRef.current?.click()} disabled={state === "uploading"} className="mt-5 min-h-10 rounded-full bg-[#b896d1] px-5 text-xs text-[#120e1f] disabled:opacity-50">{state === "uploading" ? `Uploading ${progress}%` : "Choose image"}</button>
      {state === "uploading" && <div className="mx-auto mt-4 h-1 max-w-xs overflow-hidden rounded-full bg-white/5"><div className="h-full bg-[#b896d1] transition-[width]" style={{ width: `${progress}%` }} /></div>}
      {error && <p role="alert" className="mt-4 text-xs text-[#dc91a4]">{error}</p>}
    </div>
  )
}
