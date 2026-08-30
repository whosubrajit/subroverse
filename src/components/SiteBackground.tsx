"use client"

import GradientWaves from "./GradientWaves"

export default function SiteBackground() {
  return (
    <div className="site-waves" aria-hidden="true">
      <GradientWaves
        horizonColor="#5227FF"
        waveColor="#FF9FFC"
        crestColor="#FFFFFF"
        speed={0.35}
        amplitude={0.65}
        waveScale={1.45}
        waveRatio={0.6}
        swell={14.5}
        turbulence={21.5}
        tilt={1.23}
        zoom={0.95}
        height={5.5}
        fogDepth={13}
        detail="high"
        brightness={0.85}
        opacity={1.0}
        mouseInteraction={true}
        parallaxStrength={0.47}
        grain={true}
        grainIntensity={0.05}
      />
    </div>
  )
}
