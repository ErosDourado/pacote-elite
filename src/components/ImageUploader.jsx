import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Componente de upload de imagem com:
 * - Conversão automática para base64 (imagem persiste após refresh)
 * - Focal point por arrasto (object-position)
 * - Botão de exclusão que não reabre o seletor
 * - Opção de colar URL externa (allowUrl)
 *
 * Props:
 *   value           string  URL ou base64 atual
 *   position        string  "X% Y%" do focal point
 *   onChangeImage   fn(v)   chamado ao mudar imagem
 *   onChangePosition fn(v)  chamado ao mover focal point (pode ser null)
 *   label           string
 *   height          number  altura do preview em px (default 160)
 *   allowUrl        bool    mostra campo de URL externa (default false)
 */
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

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const b64 = await toBase64(file)
    onChangeImage(b64)
    e.target.value = ''
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
          {/* Preview com focal point drag */}
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
              src={value}
              alt="preview"
              className="w-full h-full object-cover pointer-events-none"
              style={{ objectPosition: position || '50% 50%' }}
              onError={e => (e.target.style.opacity = '0.3')}
            />

            {/* Overlay escuro leve + hint */}
            {onChangePosition && (
              <>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'rgba(0,0,0,0.18)' }} />
                <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-bold pointer-events-none"
                  style={{ color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                  Arraste para enquadrar
                </p>
                {/* Crosshair circular */}
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

            {/* Botão excluir */}
            <button
              type="button"
              onPointerDown={e => { e.preventDefault(); e.stopPropagation() }}
              onClick={e => { e.stopPropagation(); onChangeImage('') }}
              className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            >
              <X size={14} strokeWidth={2.5} className="text-white" />
            </button>
          </div>

          {/* Botão trocar foto */}
          <label className="self-start cursor-pointer">
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(120,120,128,0.10)', color: 'rgba(60,60,67,0.65)' }}
            >
              <Upload size={11} strokeWidth={2} /> Trocar foto
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <label className="cursor-pointer">
            <div
              className="rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-dashed"
              style={{ height: Math.min(height, 110), borderColor: 'rgba(120,120,128,0.22)' }}
            >
              <Upload size={20} strokeWidth={1.5} className="text-label-3" />
              <p className="text-[12px] text-label-2">Toque para selecionar uma foto</p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
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
