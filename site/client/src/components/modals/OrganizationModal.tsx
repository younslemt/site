import React, { useState, useEffect } from 'react';
import { Organization } from '../../types';
import { X } from 'lucide-react';

interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (org: Organization) => void;
  organization?: Organization;
}

export default function OrganizationModal({ isOpen, onClose, onSave, organization }: OrganizationModalProps) {
  const [formData, setFormData] = useState<Partial<Organization>>({
    name: '',
    type: 'Client',
    employeeCount: 0,
    vatNumber: ''
  });

  useEffect(() => {
    if (organization) {
      setFormData(organization);
    } else {
      setFormData({
        name: '',
        type: 'Client',
        employeeCount: 0,
        vatNumber: ''
      });
    }
  }, [organization, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: organization?.id || crypto.randomUUID(),
      ...formData
    } as Organization);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold mb-4">
          {organization ? 'Modifier l\'organisation' : 'Nouvelle organisation'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
            >
              <option value="Client">Client</option>
              <option value="Prospect">Prospect</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre d'employés</label>
            <input
              type="number"
              required
              min="0"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={formData.employeeCount}
              onChange={e => setFormData({...formData, employeeCount: parseInt(e.target.value)})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Numéro de TVA</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={formData.vatNumber}
              onChange={e => setFormData({...formData, vatNumber: e.target.value})}
            />
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
