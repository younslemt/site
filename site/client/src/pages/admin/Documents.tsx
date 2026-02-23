import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink, Link as LinkIcon, Search, Trash2 } from 'lucide-react';
import DocumentModal from '../../components/modals/DocumentModal';
import { Document, Organization } from '../../types';
import * as FirestoreService from '../../services/firestore';
import ConfirmationModal from '../../components/modals/ConfirmationModal';

export default function AdminDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docsData, orgsData] = await Promise.all([
        FirestoreService.getDocuments(),
        FirestoreService.getOrganizations()
      ]);
      setDocuments(docsData);
      setOrganizations(orgsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOrgName = (orgId: string) => {
    return organizations.find(o => o.id === orgId)?.name || 'Inconnu';
  };

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getOrgName(doc.organizationId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (doc: Document) => {
    try {
      // Remove ID for creation as Firestore generates it
      const { id, ...docData } = doc;
      const newDoc = await FirestoreService.addDocument(docData);
      setDocuments([...documents, newDoc]);
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Erreur lors de l'enregistrement du document");
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteConfirmation({ isOpen: true, id });
  };

  const handleDelete = async () => {
    try {
      const id = deleteConfirmation.id;
      await FirestoreService.deleteDocument(id);
      setDocuments(documents.filter(d => d.id !== id));
      setDeleteConfirmation({ isOpen: false, id: '' });
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Erreur lors de la suppression du document");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <LinkIcon className="w-5 h-5 mr-2" />
          Partager un lien
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
          placeholder="Rechercher par titre ou organisation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-orange-50 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {getOrgName(doc.organizationId)}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-1">{doc.title}</h3>
            <p className="text-sm text-gray-500 mb-6 flex-1">{doc.description}</p>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <a 
                href={doc.fileUrl} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ouvrir le lien
              </a>
              <button 
                onClick={() => confirmDelete(doc.id)}
                className="inline-flex justify-center items-center p-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <DocumentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ ...deleteConfirmation, isOpen: false })}
        onConfirm={handleDelete}
        title="Supprimer le document"
        message="Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible."
      />
    </div>
  );
}
