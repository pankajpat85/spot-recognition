import { useRef, useCallback } from 'react'
import html2canvas from 'html2canvas'

export function useImageGenerator() {
  const wallOfFameRef = useRef<HTMLDivElement>(null)

  const generate = useCallback(async (): Promise<Blob> => {
    if (!wallOfFameRef.current) throw new Error('WallOfFame ref not ready')

    const canvas = await html2canvas(wallOfFameRef.current, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      scale: 2,
    })

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to generate image'))
      }, 'image/png')
    })
  }, [])

  return { wallOfFameRef, generate }
}
