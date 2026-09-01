"use client"

import { useState } from "react"

type SeriesMetadata = {
  name: string
  description: string
}

export default function SeriesManager({
  allSeriesNames,
  initialMetadata,
}: {
  allSeriesNames: string[]
  initialMetadata: SeriesMetadata[]
}) {
  const [saving, setSaving] = useState<string | null>(null)
  
  // Create a map of name -> description for easy state management
  const [descriptions, setDescriptions] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const name of allSeriesNames) {
      map[name] = "" // Default empty
    }
    for (const m of initialMetadata) {
      if (allSeriesNames.includes(m.name)) {
        map[m.name] = m.description
      }
    }
    return map
  })

  async function handleSave(name: string) {
    setSaving(name)
    try {
      const res = await fetch("/api/admin/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: descriptions[name] }),
      })
      if (!res.ok) throw new Error("Failed to save")
      // Show success briefly
      setSaving(`${name}-success`)
      setTimeout(() => setSaving(null), 2000)
    } catch (e) {
      alert("Failed to save description")
      setSaving(null)
    }
  }

  if (allSeriesNames.length === 0) {
    return (
      <div className="text-sm text-[#a99bb9] p-6 bg-[#151120] rounded-2xl border border-white/10">
        You haven't assigned any stories to a series yet.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {allSeriesNames.map((name) => (
        <div key={name} className="bg-[#151120] border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
            <h3 className="font-display italic text-2xl text-[#f0ebf5]">{name}</h3>
            <button
              onClick={() => handleSave(name)}
              disabled={saving === name}
              className={`px-4 py-2 bg-white/10 hover:bg-white/20 text-[#f0ebf5] text-sm rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50`}
            >
              {saving === name ? "Saving..." : saving === `${name}-success` ? "Saved ✓" : "Save changes"}
            </button>
          </div>
          <textarea
            value={descriptions[name]}
            onChange={(e) => setDescriptions({ ...descriptions, [name]: e.target.value })}
            placeholder="A poetic introduction for this series..."
            className={`w-full bg-black/40 border border-white/10 rounded-xl p-4 text-[#f0ebf5] placeholder:text-white/20 min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-white/20`}
          />
        </div>
      ))}
    </div>
  )
}
