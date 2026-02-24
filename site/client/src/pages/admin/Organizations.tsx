import React, { useState, useEffect } from 'react';
import { Building2, Users, Edit, Trash2, Plus } from 'lucide-react';
import OrganizationModal from '../../components/modals/OrganizationModal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import { Organization } from '../../types';
import * as FirestoreService from '../../services/firestore';

export default function AdminOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | undefined>(undefined);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    id: string;
  }>({ isOpen: false, id: '' });

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const data = await FirestoreService.getOrganizations();
      setOrganizations(data);
    } catch (error) {
      console.error("Error loading organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (org: Organization) => {
    try {
      if (editingOrg) {
        await FirestoreService.updateOrganization(org.id, org);
        setOrganizations(organizations.map(o => o.id === org.id ? org : o));
      } else {
        const { id, ...orgData } = org;
        const newOrg = await FirestoreService.addOrganization(orgData);
        setOrganizations([...organizations, newOrg]);
      }
    } catch (error) {
      console.error("Error saving organization:", error);
      alert("Erreur lors de l'enregistrement de l'organisation");
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteConfirmation({ isOpen: true, id });
  };

  const handleDelete = async () => {
    try {
      const id = deleteConfirmation.id;
      await FirestoreService.deleteOrganization(id);
      setOrganizations(organizations.filter(o => o.id !== id));
    } catch (error) {
      console.error("Error deleting organization:", error);
      alert("Erreur lors de la suppression de l'organisation");
    }
  };

  const openNewModal = () => {
    setEditingOrg(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (org: Organization) => {
    setEditingOrg(org);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Organisations</h1>
        <button 
          onClick={openNewModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Créer une organisation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <div key={org.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-indigo-50 p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-indigo-600" />
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                org.type === 'Client' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {org.type}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">{org.name}</h3>
            
            <div className="space-y-2 mb-6 flex-1">
              <div className="flex items-center text-sm text-gray-500">
                <Users className="w-4 h-4 mr-2" />
                {org.employeeCount} employés
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="font-medium mr-2">TVA:</span>
                {org.vatNumber}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => openEditModal(org)}
                className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </button>
              <button 
                onClick={() => confirmDelete(org.id)}
                className="inline-flex justify-center items-center p-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <OrganizationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        organization={editingOrg}
      />

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ ...deleteConfirmation, isOpen: false })}
        onConfirm={handleDelete}
        title="Supprimer l'organisation"
        message="Êtes-vous sûr de vouloir supprimer cette organisation ? Cette action est irréversible."
      />
    </div>
  );
}
