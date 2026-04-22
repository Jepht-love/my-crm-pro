'use client'

import { useState, useRef, useCallback } from 'react'
import { X, Upload, FileText, Download, Check, AlertCircle, ChevronDown } from 'lucide-react'

interface ImportProduitsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (count: number) => void
}

type Step = 'upload' | 'preview' | 'result'

interface ParsedRow {
  [key: string]: string
}

interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
}

const COLUMN_OPTIONS = ['name', 'sku', 'price', 'stock_quantity', 'description', 'category', '(ignorer)']

const SAMPLE_CSV =
  'Nom,SKU/Référence,Prix TTC,Stock,Description,Catégorie\n' +
  'Pack Premium,PRD-001,299.00,48,Accès complet à toutes les fonctionnalités,Abonnements\n' +
  'Abonnement Standard,PRD-002,119.00,120,Fonctionnalités essentielles pour les TPE,Abonnements\n' +
  'Formation Avancée,PRD-003,499.00,8,Formation complète sur 2 jours en présentiel,Formations\n'

function parsePreviewCSV(text: string): { headers: string[]; rows: ParsedRow[] } {
  const cleaned = text.startsWith('\uFEFF') ? text.slice(1) : text
  const lines = cleaned.split(/\r?\n/).filter(l => l.trim() !== '')
  if (lines.length < 2) return { headers: [], rows: [] }

  const firstLine = lines[0]
  const sep = firstLine.split(';').length > firstLine.split(',').length ? ';' : ','

  const headers = firstLine.split(sep).map(h => h.replace(/"/g, '').trim())
  const rows: ParsedRow[] = []

  for (let i = 1; i < Math.min(lines.length, 6); i++) {
    const values = lines[i].split(sep).map(v => v.replace(/"/g, '').trim())
    const row: ParsedRow = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? ''
    })
    rows.push(row)
  }

  return { headers, rows }
}

function downloadSampleCSV() {
  const blob = new Blob(['\uFEFF' + SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'modele_import_produits.csv'
  a.click()
  URL.revokeObjectURL(a.href)
}

function normalizeHeader(h: string): string {
  const n = h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  if (['name', 'nom'].includes(n)) return 'name'
  if (['sku', 'reference', 'ref', 'code'].includes(n)) return 'sku'
  // handle "sku/reference" style
  if (n.includes('sku') || n.includes('reference') || n.includes('ref')) return 'sku'
  if (['price', 'prix', 'prix ttc', 'prix ht'].includes(n) || n.startsWith('prix')) return 'price'
  if (['stock', 'stock_quantity', 'quantite', 'qty', 'quantity'].includes(n)) return 'stock_quantity'
  if (['description', 'desc'].includes(n)) return 'description'
  if (['category', 'categorie', 'famille'].includes(n)) return 'category'
  return '(ignorer)'
}

export default function ImportProduitsModal({ isOpen, onClose, onSuccess }: ImportProduitsModalProps) {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([])
  const [previewRows, setPreviewRows] = useState<ParsedRow[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetState = useCallback(() => {
    setStep('upload')
    setFile(null)
    setPreviewHeaders([])
    setPreviewRows([])
    setColumnMapping({})
    setLoading(false)
    setResult(null)
    setDragOver(false)
  }, [])

  const handleClose = useCallback(() => {
    resetState()
    onClose()
  }, [resetState, onClose])

  const processFile = useCallback(async (f: File) => {
    setFile(f)
    const text = await f.text()
    const { headers, rows } = parsePreviewCSV(text)
    setPreviewHeaders(headers)
    setPreviewRows(rows)

    const initialMapping: Record<string, string> = {}
    headers.forEach(h => {
      initialMapping[h] = normalizeHeader(h)
    })
    setColumnMapping(initialMapping)
    setStep('preview')
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]
      if (f) processFile(f)
    },
    [processFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragOver(false)
      const f = e.dataTransfer.files[0]
      if (f && f.name.endsWith('.csv')) processFile(f)
    },
    [processFile]
  )

  const handleImport = useCallback(async () => {
    if (!file) return
    setLoading(true)

    try {
      let uploadFile = file

      const needsRemap = previewHeaders.some(h => columnMapping[h] && columnMapping[h] !== h && columnMapping[h] !== '(ignorer)')

      if (needsRemap) {
        const text = await file.text()
        const cleaned = text.startsWith('\uFEFF') ? text.slice(1) : text
        const lines = cleaned.split(/\r?\n/).filter(l => l.trim() !== '')
        const sep = lines[0].split(';').length > lines[0].split(',').length ? ';' : ','

        const newHeader = previewHeaders
          .map(h => columnMapping[h] ?? '(ignorer)')
          .filter(h => h !== '(ignorer)')
          .join(',')

        const mappedIndices = previewHeaders
          .map((h, i) => ({ idx: i, mapped: columnMapping[h] ?? '(ignorer)' }))
          .filter(x => x.mapped !== '(ignorer)')

        const newLines = [newHeader]
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(sep).map(v => v.replace(/"/g, '').trim())
          const newVals = mappedIndices.map(({ idx }) => vals[idx] ?? '')
          newLines.push(newVals.join(','))
        }

        const blob = new Blob([newLines.join('\n')], { type: 'text/csv' })
        uploadFile = new File([blob], file.name, { type: 'text/csv' })
      }

      const formData = new FormData()
      formData.append('file', uploadFile)

      const res = await fetch('/api/imports/produits', {
        method: 'POST',
        body: formData,
      })

      const data: ImportResult & { error?: string } = await res.json()

      if (!res.ok) {
        setResult({ imported: 0, skipped: 0, errors: [data.error ?? 'Erreur inconnue'] })
      } else {
        setResult({ imported: data.imported, skipped: data.skipped, errors: data.errors })
        if (data.imported > 0) onSuccess(data.imported)
      }
      setStep('result')
    } catch {
      setResult({ imported: 0, skipped: 0, errors: ['Erreur de connexion au serveur'] })
      setStep('result')
    } finally {
      setLoading(false)
    }
  }, [file, previewHeaders, columnMapping, onSuccess])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">Importer des produits</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === 'upload' && 'Etape 1 — Sélectionner un fichier CSV'}
              {step === 'preview' && 'Etape 2 — Vérifier le mapping des colonnes'}
              {step === 'result' && 'Etape 3 — Résultat de l\'import'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Step 1 — Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              <button
                onClick={downloadSampleCSV}
                className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Télécharger un modèle CSV
              </button>

              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors
                  ${dragOver
                    ? 'border-violet-500 bg-violet-500/10'
                    : 'border-slate-700 hover:border-violet-600/60 hover:bg-slate-800/40'
                  }
                `}
              >
                <Upload className="w-8 h-8 text-slate-500" />
                <div className="text-center">
                  <p className="text-sm text-slate-300 font-medium">
                    Glisser-déposer un fichier CSV ici
                  </p>
                  <p className="text-xs text-slate-500 mt-1">ou cliquer pour parcourir</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Colonnes attendues
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Nom', required: true },
                    { label: 'SKU/Référence', required: false },
                    { label: 'Prix TTC', required: false },
                    { label: 'Stock', required: false },
                    { label: 'Description', required: false },
                    { label: 'Catégorie', required: false },
                  ].map(col => (
                    <span
                      key={col.label}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        col.required
                          ? 'bg-violet-900/50 text-violet-300 border border-violet-700/50'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {col.label}{col.required && ' *'}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-600 mt-2">* champ obligatoire — max 1 000 lignes</p>
              </div>
            </div>
          )}

          {/* Step 2 — Preview */}
          {step === 'preview' && file && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl">
                <FileText className="w-5 h-5 text-violet-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} Ko</p>
                </div>
                <button
                  onClick={resetState}
                  className="ml-auto text-xs text-slate-500 hover:text-white transition-colors"
                >
                  Changer
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Correspondance des colonnes
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {previewHeaders.map(h => (
                    <div key={h} className="flex items-center gap-2 bg-slate-800/40 rounded-lg px-3 py-2">
                      <span className="text-xs text-slate-400 truncate flex-1 min-w-0">{h}</span>
                      <span className="text-slate-600 text-xs">→</span>
                      <div className="relative">
                        <select
                          value={columnMapping[h] ?? '(ignorer)'}
                          onChange={e => setColumnMapping(prev => ({ ...prev, [h]: e.target.value }))}
                          className="appearance-none text-xs bg-slate-700 border border-slate-600 text-white rounded-lg pl-2 pr-6 py-1 focus:outline-none focus:border-violet-500 cursor-pointer"
                        >
                          {COLUMN_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {previewRows.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Aperçu (5 premières lignes)
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-800/50">
                          {previewHeaders.map(h => (
                            <th key={h} className="px-3 py-2 text-left text-slate-500 font-medium whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {previewRows.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-800/20">
                            {previewHeaders.map(h => (
                              <td key={h} className="px-3 py-2 text-slate-400 whitespace-nowrap max-w-[150px] truncate">
                                {row[h] || '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Result */}
          {step === 'result' && result && (
            <div className="space-y-4">
              {result.imported > 0 && (
                <div className="flex items-center gap-3 p-4 bg-emerald-900/30 border border-emerald-700/40 rounded-xl">
                  <Check className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">
                      {result.imported} produit{result.imported > 1 ? 's' : ''} importé{result.imported > 1 ? 's' : ''} avec succès
                    </p>
                    {result.skipped > 0 && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {result.skipped} ligne{result.skipped > 1 ? 's' : ''} ignorée{result.skipped > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {result.imported === 0 && (
                <div className="flex items-center gap-3 p-4 bg-red-900/30 border border-red-700/40 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                  <p className="text-white font-semibold">Aucun produit importé</p>
                </div>
              )}

              {result.errors.length > 0 && (
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                    Erreurs ({result.errors.length})
                  </p>
                  <ul className="space-y-1">
                    {result.errors.slice(0, 5).map((err, i) => (
                      <li key={i} className="text-xs text-slate-400 flex gap-2">
                        <span className="text-red-400 flex-shrink-0">•</span>
                        {err}
                      </li>
                    ))}
                    {result.errors.length > 5 && (
                      <li className="text-xs text-slate-500">
                        ... et {result.errors.length - 5} autre{result.errors.length - 5 > 1 ? 's' : ''} erreur{result.errors.length - 5 > 1 ? 's' : ''}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between gap-3">
          {step === 'upload' && (
            <>
              <span className="text-xs text-slate-600">Format CSV, max 1 000 lignes</span>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Annuler
              </button>
            </>
          )}

          {step === 'preview' && (
            <>
              <button
                onClick={resetState}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Retour
              </button>
              <button
                onClick={handleImport}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Import en cours…
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Importer les produits
                  </>
                )}
              </button>
            </>
          )}

          {step === 'result' && (
            <>
              <button
                onClick={resetState}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Nouvel import
              </button>
              <button
                onClick={handleClose}
                className="px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all"
                style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}
              >
                Fermer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
