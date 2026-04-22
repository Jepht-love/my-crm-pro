'use client'

import { useState } from 'react'
import { Plus, Upload, Check } from 'lucide-react'
import ImportClientsModal from './ImportClientsModal'

export default function ClientsPageActions() {
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function handleSuccess(count: number) {
    setToast(`${count} client${count > 1 ? 's' : ''} importé${count > 1 ? 's' : ''} avec succès`)
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setModalOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
        >
          <Upload className="w-3.5 h-3.5" /> IMPORTER CSV
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-all"
          style={{ background: 'linear-gradient(135deg, #7C5CFC, #6C47FF)' }}
        >
          <Plus className="w-4 h-4" /> AJOUTER UN CLIENT
        </button>
      </div>

      <ImportClientsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-emerald-900/90 border border-emerald-700/60 text-emerald-300 text-sm font-medium rounded-2xl shadow-2xl backdrop-blur-sm animate-in slide-in-from-bottom-4">
          <Check className="w-4 h-4 flex-shrink-0" />
          {toast}
        </div>
      )}
    </>
  )
}
