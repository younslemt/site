import React, { useState, useEffect } from 'react';
import { getDiagnostics, getOrganizations, addDiagnostic, updateDiagnostic, deleteDiagnostic as deleteDiagnosticService } from '../../services/firestore';
import { BarChart3, Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import DiagnosticModal from '../../components/modals/DiagnosticModal';
import { Diagnostic, Organization } from '../../types';

export default function AdminDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiag, setEditingDiag] = useState<Diagnostic | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [diagData, orgData] = await Promise.all([
          getDiagnostics(),
          getOrganizations()
        ]);
        setDiagnostics(diagData);
        setOrganizations(orgData);
      } catch (error) {
        console.error("Error fetching diagnostics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getOrgName = (orgId: string) => {
    return organizations.find(o => o.id === orgId)?.name || 'Inconnu';
  };

  const handleSave = async (diag: Diagnostic) => {
    try {
      if (editingDiag) {
        // Update existing
        await updateDiagnostic(diag.id, diag);
        setDiagnostics(diagnostics.map(d => d.id === diag.id ? diag : d));
      } else {
        // Create new
        const { id, ...newDiag } = diag; // Remove temp ID if present
        const created = await addDiagnostic(newDiag);
        setDiagnostics([...diagnostics, created]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving diagnostic:", error);
      alert("Erreur lors de la sauvegarde du diagnostic.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce diagnostic ?')) {
      try {
        await deleteDiagnosticService(id);
        setDiagnostics(diagnostics.filter(d => d.id !== id));
      } catch (error) {
        console.error("Error deleting diagnostic:", error);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const openNewModal = () => {
    setEditingDiag(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (diag: Diagnostic) => {
    setEditingDiag(diag);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Diagnostics</h1>
        <button 
          onClick={openNewModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau Diagnostic
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {diagnostics.map((diag) => (
          <div key={diag.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{diag.title}</h3>
                <p className="text-sm text-indigo-600 font-medium">{getOrgName(diag.organizationId)}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center text-sm text-gray-500 mr-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  {diag.date}
                </div>
                <button onClick={() => openEditModal(diag)} className="text-gray-400 hover:text-indigo-600">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(diag.id)} className="text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Score Global</span>
                <span className="text-2xl font-bold text-indigo-600">{diag.globalScore}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${diag.globalScore}%` }}
                ></div>
              </div>
              <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-md italic">
                "{diag.comment}"
              </p>
            </div>

            <div className="space-y-4 flex-1">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Détail par axe</h4>
              
              {Object.entries(diag.scores).map(([key, score]) => {
                const s = score as number;
                return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 capitalize">{key}</span>
                    <span className="text-sm font-medium text-gray-900">{s}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        s >= 70 ? 'bg-green-500' : 
                        s >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} 
                      style={{ width: `${s}%` }}
                    ></div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        ))}
      </div>

      <DiagnosticModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        diagnostic={editingDiag}
      />
    </div>
  );
}
