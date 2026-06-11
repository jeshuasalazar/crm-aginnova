'use client'

import { useState } from 'react'
import { importDataAction, UploadRecord } from '@/app/actions/data'
import { FileSpreadsheet, Upload, Check, AlertCircle, History, Download } from 'lucide-react'

interface DatosClientProps {
  initialHistory: UploadRecord[]
}

export default function DatosClient({ initialHistory }: DatosClientProps) {
  const [history, setHistory] = useState<UploadRecord[]>(initialHistory)
  const [importType, setImportType] = useState<'ventas' | 'inventario' | 'campañas'>('ventas')
  const [file, setFile] = useState<File | null>(null)
  const [previewRows, setPreviewRows] = useState<any[]>([])
  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // CSV templates as strings to download
  const templates = {
    ventas: 'fecha,canal,monto,unidades,fuente\n2026-06-01,web,5500,10,Google\n2026-06-02,whatsapp,2500,4,instagram',
    inventario: 'sku,nombre,categoria,costo_unitario,precio_unitario,punto_reorden\nSK-NALUA-04,Pantalón Lino Cargo,Vestuario B2C,300.00,890.00,15\nSK-NALUA-05,Blusa Algodón Bordada,Vestuario B2C,150.00,450.00,20',
    campañas: 'fecha,canal,costo,alcance,ctr,conversiones\n2026-06-01,Meta Ads,400.00,8000,0.045,45\n2026-06-02,Google Ads,650.00,12000,0.028,38'
  }

  const downloadTemplate = () => {
    const content = templates[importType]
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `plantilla_${importType}_aginnova.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    processFile(selectedFile)
  }

  const processFile = (selectedFile: File) => {
    setFile(selectedFile)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (!text) return
      
      const lines = text.split('\n').filter(line => line.trim())
      if (lines.length < 2) {
        setMsg({ type: 'error', text: 'El archivo está vacío o no tiene cabeceras.' })
        return
      }

      const headers = lines[0].split(',').map(h => h.trim())
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        const obj: any = {}
        headers.forEach((header, index) => {
          obj[header] = values[index]
        })
        return obj
      })

      setParsedRows(rows)
      setPreviewRows(rows.slice(0, 5))
      setMsg(null)
    }
    reader.readAsText(selectedFile)
  }

  const handleImport = async () => {
    if (!file || parsedRows.length === 0) return
    setIsLoading(true)
    setMsg(null)

    try {
      const res = await importDataAction(file.name, importType, parsedRows)
      if (res.success) {
        setMsg({ 
          type: 'success', 
          text: `Carga finalizada con éxito. Importado: ${res.rowsImported} filas. Errores: ${res.errorsCount}.` 
        })
        
        // Agregar al historial de forma local
        setHistory(prev => [{
          id: Math.random().toString(),
          filename: file.name,
          type: importType,
          status: res.errorsCount === parsedRows.length ? 'error' : 'completed',
          rows_imported: res.rowsImported || 0,
          errors_json: res.errors || [],
          created_at: new Date().toISOString()
        }, ...prev])

        setFile(null)
        setPreviewRows([])
        setParsedRows([])
      } else {
        setMsg({ type: 'error', text: res.error || 'Ocurrió un error en la carga.' })
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message || 'Error de conexión.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid-60-40 gap-6">
      {/* PANEL DE CARGA */}
      <div className="card">
        <div className="card-header flex justify-between items-center mb-4 border-b pb-3 border-gray-100">
          <h2 className="card-title text-lg font-bold text-gray-800 flex items-center gap-2">
            <Upload size={18} className="text-[#4A7BB5]" />
            Cargar Nuevos Datos
          </h2>
          <button 
            onClick={downloadTemplate} 
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
            title="Descargar plantilla CSV modelo"
          >
            <Download size={14} />
            <span>Plantilla CSV</span>
          </button>
        </div>

        <div className="card-body flex flex-col gap-4">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            {(['ventas', 'inventario', 'campañas'] as const).map((type) => (
              <button
                key={type}
                className={`flex-1 py-2 text-center text-xs font-semibold rounded-md transition ${
                  importType === type ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => {
                  setImportType(type)
                  setFile(null)
                  setPreviewRows([])
                  setParsedRows([])
                }}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Drag & Drop Zone */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center flex flex-col items-center gap-2 hover:border-blue-400 transition bg-gray-50/50 cursor-pointer"
            onClick={() => document.getElementById('csv-file-input')?.click()}
          >
            <FileSpreadsheet size={36} className="text-gray-400 mb-1" />
            <span className="font-bold text-sm text-gray-700">
              {file ? file.name : 'Seleccionar archivo CSV'}
            </span>
            <span className="text-xs text-gray-400">
              {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Haz clic para explorar tus carpetas'}
            </span>
            <input 
              type="file" 
              id="csv-file-input" 
              accept=".csv" 
              className="hidden" 
              onChange={handleFileChange} 
            />
          </div>

          {msg && (
            <div className={`p-3 rounded-lg text-sm flex gap-2 items-center ${
              msg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {msg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* PREVIEW TABLA */}
          {previewRows.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-xs font-bold text-gray-500">Vista Previa de Importación (Primeras 5 filas)</span>
              <div className="overflow-x-auto border rounded-lg max-h-48">
                <table className="w-full text-xs text-left text-gray-600">
                  <thead className="bg-gray-100 uppercase text-[10px] text-gray-500 border-b">
                    <tr>
                      {Object.keys(previewRows[0]).map((h) => (
                        <th key={h} className="p-2 border-r">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        {Object.values(row).map((v: any, j) => (
                          <td key={j} className="p-2 border-r truncate max-w-[120px]">{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <button 
                onClick={handleImport}
                disabled={isLoading}
                className="btn btn-primary w-full text-center mt-3 justify-center py-2.5 font-bold"
              >
                {isLoading ? 'Procesando Carga...' : `Confirmar Importación (${parsedRows.length} filas)`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* HISTORIAL DE CARGAS */}
      <div className="card">
        <div className="card-header mb-4 border-b pb-3 border-gray-100 flex items-center gap-2">
          <History size={18} className="text-gray-500" />
          <h2 className="card-title text-lg font-bold text-gray-800">Historial de Ingesta</h2>
        </div>

        <div className="card-body overflow-y-auto max-h-[450px] flex flex-col gap-3">
          {history.length > 0 ? (
            history.map((record) => (
              <div key={record.id} className="p-3 rounded-lg border bg-white flex flex-col gap-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-800 truncate max-w-[180px]" title={record.filename}>
                    {record.filename}
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                    record.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {record.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-gray-400">
                  <span>Módulo: {record.type.toUpperCase()}</span>
                  <span>Importado: {record.rows_imported} filas</span>
                </div>
                {record.errors_json && record.errors_json.length > 0 && (
                  <div className="bg-red-50 p-2 rounded text-[10px] text-red-700 flex flex-col gap-1 border border-red-100 max-h-24 overflow-y-auto">
                    <strong>Errores de validación:</strong>
                    {record.errors_json.slice(0, 3).map((err, idx) => (
                      <div key={idx}>• Fila {err.row}: {err.error}</div>
                    ))}
                    {record.errors_json.length > 3 && <div>Y {record.errors_json.length - 3} errores más...</div>}
                  </div>
                )}
                <div className="text-[10px] text-gray-400 text-right">
                  {new Date(record.created_at).toLocaleString('es-MX')}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400 text-center py-12">No hay registros de cargas anteriores.</div>
          )}
        </div>
      </div>
    </div>
  )
}
