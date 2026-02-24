import React, { useState, useEffect } from 'react';
import { Diagnostic, Organization } from '../../types';
import { getOrganizations } from '../../services/firestore';
import { X } from 'lucide-react';

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (diag: Diagnostic) => void;
  diagnostic?: Diagnostic;
}

export default function DiagnosticModal({ isOpen, onClose, onSave, diagnostic }: DiagnosticModalProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [formData, setFormData] = useState<Partial<Diagnostic>>({
    title: '',
    organizationId: '',
    date: new Date().toISOString().split('T')[0],
    globalScore: 0,
    comment: '',
    scores: {
      esg: 0,
      credit: 0,
      cybersecurity: 0,
      aml: 0,
      digitalisation: 0
    }
  });

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const orgs = await getOrganizations();
        setOrganizations(orgs);
        
        // Set default org if creating new and orgs loaded
        if (!diagnostic && orgs.length > 0 && !formData.organizationId) {
             setFormData(prev => ({ ...prev, organizationId: orgs[0].id }));
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };
    
    if (isOpen) {
        fetchOrgs();
    }
  }, [isOpen]);

  useEffect(() => {
    if (diagnostic) {
      setFormData(diagnostic);
    } else {
      setFormData(prev => ({
        title: '',
        organizationId: prev.organizationId || (organizations.length > 0 ? organizations[0].id : ''),
        date: new Date().toISOString().split('T')[0],
        globalScore: 0,
        comment: '',
        scores: {
          esg: 0,
          credit: 0,
          cybersecurity: 0,
          aml: 0,
          digitalisation: 0
        }
      }));
    }
  }, [diagnostic, isOpen, organizations]);

  if (!isOpen) return null;

  const handleScoreChange = (key: keyof Diagnostic['scores'], value: number) => {
    const newScores = { ...formData.scores!, [key]: value };
    const values = Object.values(newScores) as number[];
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    
    setFormData({
      ...formData,
      scores: newScores,
      globalScore: avg
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: diagnostic?.id || crypto.randomUUID(),
      ...formData
    } as Diagnostic);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative my-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold mb-4">
          {diagnostic ? 'Modifier le diagnostic' : 'Nouveau diagnostic'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Titre</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Organisation</label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={formData.organizationId}
                onChange={e => setFormData({...formData, organizationId: e.target.value})}
              >
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Score Global (Calculé)</label>
              <input
                type="number"
                readOnly
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 shadow-sm text-gray-500"
                value={formData.globalScore}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Commentaire</label>
            <textarea
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={formData.comment}
              onChange={e => setFormData({...formData, comment: e.target.value})}
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Scores par catégorie (0-100)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(formData.scores || {}).map((key) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">{key}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={formData.scores?.[key as keyof Diagnostic['scores']]}
                    onChange={e => handleScoreChange(key as keyof Diagnostic['scores'], parseInt(e.target.value) || 0)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
