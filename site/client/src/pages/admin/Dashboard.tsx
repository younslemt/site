import React, { useEffect, useState } from 'react';
import { getUsers, getOrganizations, getSprints, getDocuments } from '../../services/firestore';
import { User, Organization, Sprint, Document } from '../../types';
import { Users, Building2, Timer, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, orgsData, sprintsData, docsData] = await Promise.all([
          getUsers(),
          getOrganizations(),
          getSprints(),
          getDocuments()
        ]);
        setUsers(usersData);
        setOrganizations(orgsData);
        setSprints(sprintsData);
        setDocuments(docsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { label: 'Utilisateurs', value: users.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Organisations', value: organizations.length, icon: Building2, color: 'bg-indigo-500' },
    { label: 'Sprints en cours', value: sprints.filter(s => s.status === 'En Cours').length, icon: Timer, color: 'bg-green-500' },
    { label: 'Documents partagés', value: documents.length, icon: FileText, color: 'bg-orange-500' },
  ];

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sprints */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Aperçu des Sprints</h2>
            <Link to="/admin/sprints" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organisation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sprints.slice(0, 5).map((sprint) => {
                  const org = organizations.find(o => o.id === sprint.organizationId);
                  return (
                    <tr key={sprint.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{sprint.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{org?.name || 'N/A'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${sprint.status === 'En Cours' ? 'bg-green-100 text-green-800' : 
                            sprint.status === 'Terminé' ? 'bg-gray-100 text-gray-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {sprint.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{sprint.endDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Actions Rapides</h2>
          <div className="space-y-3">
            <Link to="/admin/organizations" className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
              <div className="bg-indigo-100 p-2 rounded-md">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="font-medium text-gray-700">Créer une organisation</span>
            </Link>
            <Link to="/admin/sprints" className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
              <div className="bg-green-100 p-2 rounded-md">
                <Timer className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-medium text-gray-700">Lancer un nouveau sprint</span>
            </Link>
            <Link to="/admin/documents" className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
              <div className="bg-orange-100 p-2 rounded-md">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <span className="font-medium text-gray-700">Uploader un document</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
