import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { idbPut } from '../utils/imageDB'
import { useApp } from '../context/AppContext'
import { uploadImage, deleteImage } from '../services/imageStorageService'
import { storage } from '../firebase'

// Comprime imagem para JPEG ≤ 900px / 75%
function compressImage(file, maxW = 900, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { naturalWidth: w, naturalHeight: h } = img
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load')) }
    img.src = url
  })
}

const isStorageUrl = (v) => v?.startsWith('https://firebasestorage.googleapis.com')

export default function ImageUploader({
  value,
  position = '50% 50%',
  onChangeImage,
  onChangePosition,
  label = 'Imagem',
  height = 160,
  allowUrl = false,
}) {
  const pickerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { resolveImage, registerImage, unregisterImage } = useApp()

  const resolvedSrc = resolveImage(value)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const b64 = await compressImage(file)

      if (storage) {
        // Firebase Storage: upload e salva URL pública
        setUploading(true)
        const oldVal = value
        const url = await uploadImage(b64)
        if (isStorageUrl(oldVal)) deleteImage(oldVal).catch(() => {})
        else if (oldVal?.startsWith('idb:')) unregisterImage(oldVal)
        onChangeImage(url)
      } else {
        // Fallback local (dev sem Firebase)
        if (value?.startsWith('idb:')) unregisterImage(value)
        const key = 'idb:' + Date.now()
        await idbPut(key, b64)
        registerImage(key, b64)
        onChangeImage(key)
      }
    } catch (err) {
      console.warn('[ImageUploader] upload error:', err?.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = () => {
    if (isStorageUrl(value)) deleteImage(value).catch(() => {})
    else if (value?.startsWith('idb:')) unregisterImage(value)
    onChangeImage('')
  }

  const updateFocal = (e) => {
    if (!pickerRef.current || !onChangePosition) return
    const rect = pickerRef.current.getBoundingClientRect()
    const cx = e.touches?.[0]?.clientX ?? e.clientX
    const cy = e.touches?.[0]?.clientY ?? e.clientY
    const px = Math.round(Math.max(0, Math.min(100, ((cx - rect.left) / rect.width) * 100)))
    const py = Math.round(Math.max(0, Math.min(100, ((cy - rect.top) / rect.height) * 100)))
    onChangePosition(`${px}% ${py}%`)
  }

  const [fpx, fpy] = (position || '50% 50%').match(/\d+/g)?.map(Number) ?? [50, 50]

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-[12px] font-medium text-label-2 uppercase tracking-wide">{label}</span>
      )}

      {value ? (
        <div className="flex flex-col gap-2">
          <div
            ref={pickerRef}
            className="relative rounded-2xl overflow-hidden"
            style={{ height, cursor: onChangePosition ? 'crosshair' : 'default', touchAction: 'none', userSelect: 'none' }}
            onPointerDown={e => {
              if (!onChangePosition) return
              setIsDragging(true)
              updateFocal(e)
              e.currentTarget.setPointerCapture(e.pointerId)
            }}
            onPointerMove={e => { if (isDragging) updateFocal(e) }}
            onPointerUp={() => setIsDragging(false)}
            onPointerCancel={() => setIsDragging(false)}
          >
            <img
              src={resolvedSrc}
              alt="preview"
              className="w-full h-full object-cover pointer-events-none"
              style={{ objectPosition: position || '50% 50%' }}
              onError={e => (e.target.style.opacity = '0.3')}
            />

            {onChangePosition && (
              <>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'rgba(0,0,0,0.18)' }} />
                <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-bold pointer-events-none"
                  style={{ color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                  Arraste para enquadrar
                </p>
                <div
                  className="absolute rounded-full border-2 border-white pointer-events-none"
                  style={{
                    width: 22, height: 22,
                    left: `${fpx}%`, top: `${fpy}%`,
                    transform: 'translate(-50%,-50%)',
                    boxShadow: '0 0 0 1.5px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4)',
                  }}
                />
              </>
            )}

            <button
              type="button"
              onPointerDown={e => { e.preventDefault(); e.stopPropagation() }}
              onClick={e => { e.stopPropagation(); handleDelete() }}
              className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            >
              <X size={14} strokeWidth={2.5} className="text-white" />
            </button>
          </div>

          <label className="self-start cursor-pointer">
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(120,120,128,0.10)', color: 'rgba(60,60,67,0.65)' }}
            >
              <Upload size={11} strokeWidth={2} /> {uploading ? 'Enviando…' : 'Trocar foto'}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
          </label>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <label className="cursor-pointer">
            <div
              className="rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-dashed"
              style={{ height: Math.min(height, 110), borderColor: 'rgba(120,120,128,0.22)' }}
            >
              {uploading
                ? <p className="text-[12px] text-label-2">Enviando…</p>
                : <>
                    <Upload size={20} strokeWidth={1.5} className="text-label-3" />
                    <p className="text-[12px] text-label-2">Toque para selecionar uma foto</p>
                  </>
              }
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
          </label>

          {allowUrl && (
            <>
              <p className="text-[10px] text-label-3 text-center">— ou cole a URL —</p>
              <input
                placeholder="https://..."
                className="w-full rounded-xl px-3 py-2 text-[12px] focus:outline-none"
                style={{ border: '1px solid rgba(60,60,67,0.18)' }}
                onChange={e => onChangeImage(e.target.value)}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
