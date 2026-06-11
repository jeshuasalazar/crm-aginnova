'use client'

import { useState } from 'react'
import { Recommendation, updateRecommendationStatus } from '@/app/actions/recommendations'
import { Sparkles, Check, Trash2, Edit3, X, HelpCircle, Save } from 'lucide-react'

interface RecomendacionesClientProps {
  initialRecommendations: Recommendation[]
  role: string
}

export default function RecomendacionesClient({ initialRecommendations, role }: RecomendacionesClientProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(initialRecommendations)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  const isStaff = role === 'director' || role === 'consultor'

  const handleAction = async (id: string, action: 'approved' | 'dismissed' | 'edited', updatedText?: string) => {
    const res = await updateRecommendationStatus(id, action, updatedText)
    if (res.success) {
      if (action === 'dismissed') {
        setRecommendations(prev => prev.filter(r => r.id !== id))
        setMsg('Recomendación descartada con éxito.')
      } else {
        setRecommendations(prev => prev.map(r => 
          r.id === id 
            ? { ...r, status: 'approved', content: updatedText || r.content } 
            : r
        ))
        setMsg('Recomendación aprobada y publicada al cliente.')
      }
      setEditingId(null)
      setTimeout(() => setMsg(null), 3000)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {msg && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-lg text-sm flex gap-2 items-center">
          <Sparkles size={16} className="text-blue-500 animate-spin" />
          <span>{msg}</span>
        </div>
      )}

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec) => {
            const isEditing = editingId === rec.id
            const isPending = rec.status === 'pending'

            return (
              <div 
                key={rec.id} 
                className={`card border rounded-xl bg-white shadow-sm flex flex-col justify-between overflow-hidden transition hover:shadow-md ${
                  rec.status === 'approved' ? 'border-green-200' : 'border-gray-200'
                }`}
              >
                {/* Header */}
                <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-blue-100 text-blue-800 rounded text-xs font-bold uppercase">
                      {rec.area}
                    </span>
                    {rec.confidence && (
                      <span className="text-xs text-gray-500 font-semibold">
                        Confianza: {Math.round(rec.confidence * 100)}%
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(rec.created_at).toLocaleDateString('es-MX')}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col gap-4">
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        className="w-full border rounded p-2 text-sm text-gray-700 min-h-[100px]"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                      <div className="flex gap-2 justify-end">
                        <button 
                          className="btn btn-secondary btn-sm flex items-center gap-1"
                          onClick={() => setEditingId(null)}
                        >
                          <X size={14} /> Cancelar
                        </button>
                        <button 
                          className="btn btn-primary btn-sm flex items-center gap-1 bg-green-600 border-green-600 text-white"
                          onClick={() => handleAction(rec.id, 'edited', editContent)}
                        >
                          <Save size={14} /> Guardar y Aprobar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                      "{rec.content}"
                    </p>
                  )}

                  {rec.impact_estimate && (
                    <div className="bg-green-50/50 border border-green-100 p-3 rounded-lg text-xs text-green-800">
                      <strong>Impacto Estimado:</strong> {rec.impact_estimate}
                    </div>
                  )}

                  {rec.actions && rec.actions.length > 0 && (
                    <div className="flex flex-col gap-1.5 border-t pt-3 border-gray-100">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Acciones sugeridas:</span>
                      {rec.actions.map((act, i) => (
                        <div key={i} className="flex gap-2 items-start text-xs text-gray-600">
                          <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Actions (Only for staff and only if pending) */}
                {isStaff && isPending && !isEditing && (
                  <div className="bg-gray-50/50 px-4 py-3 border-t flex justify-end gap-2">
                    <button 
                      onClick={() => handleAction(rec.id, 'dismissed')}
                      className="btn btn-sm border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50 flex items-center gap-1"
                    >
                      <Trash2 size={13} />
                      <span>Descartar</span>
                    </button>
                    <button 
                      onClick={() => { setEditingId(rec.id); setEditContent(rec.content) }}
                      className="btn btn-sm border-yellow-200 text-yellow-700 bg-yellow-50/50 hover:bg-yellow-50 flex items-center gap-1"
                    >
                      <Edit3 size={13} />
                      <span>Editar</span>
                    </button>
                    <button 
                      onClick={() => handleAction(rec.id, 'approved')}
                      className="btn btn-sm btn-primary flex items-center gap-1"
                    >
                      <Check size={13} />
                      <span>Aprobar</span>
                    </button>
                  </div>
                )}

                {rec.status === 'approved' && isStaff && (
                  <div className="bg-green-50 px-4 py-2 border-t text-[11px] text-green-700 font-semibold flex items-center gap-1">
                    <Check size={12} />
                    <span>Publicado y visible para el cliente</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card p-12 text-center text-gray-500 border border-dashed rounded-xl">
          <HelpCircle size={36} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm">No hay recomendaciones de IA disponibles para el tenant en este momento.</p>
          {!isStaff && <p className="text-xs text-gray-400 mt-1">Las recomendaciones requieren aprobación previa del consultor.</p>}
        </div>
      )}
    </div>
  )
}
