import React, { useState, useEffect } from 'react';
import { Sprint, Organization } from '../../types';
import { X } from 'lucide-react';
import * as FirestoreService from '../../services/firestore';

interface SprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sprint: Sprint) => void;
  sprint?: Sprint;
}

export default function SprintModal({ isOpen, onClose, onSave, sprint }: SprintModalProps) {
  const [formData, setFormData] = useState<Partial<Sprint>>({
    name: '',
    organizationId: '',
    status: 'Pas commencé',
    startDate: '',
    endDate: ''
  });
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    const loadOrgs = async () => {
      const orgs = await FirestoreService.getOrganizations();
      setOrganizations(orgs);
      
      // Set default org if creating new sprint and not set
      if (!sprint && !formData.organizationId && orgs.length > 0) {
        setFormData(prev => ({ ...prev, organizationId: orgs[0].id }));
      }
    };
    
    if (isOpen) {
      loadOrgs();
    }
  }, [isOpen]);

  useEffect(() => {
    if (sprint) {
      setFormData(sprint);
    } else {
      setFormData({
        name: '',
        organizationId: organizations[0]?.id || '',
        status: 'Pas commencé',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [sprint, isOpen, organizations]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: sprint?.id || crypto.randomUUID(),
      ...formData
    } as Sprint);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold mb-4">
          {sprint ? 'Modifier le sprint' : 'Nouveau sprint'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom du sprint</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Organisation</label>
            <select
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={formData.organizationId}
              onChange={e => setFormData({...formData, organizationId: e.target.value})}
            >
              <option value="">Sélectionner une organisation</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as any})}
            >
              <option value="Pas commencé">Pas commencé</option>
              <option value="En Cours">En Cours</option>
              <option value="Terminé">Terminé</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de début</label>
              <input
                type="date"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de fin</label>
              <input
                type="date"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
              />
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
