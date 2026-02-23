import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDiagnostics } from '../../services/firestore';
import { Diagnostic } from '../../types';
import { Calendar, BarChart3 } from 'lucide-react';

export default function ClientDiagnostics() {
  const { currentUser } = useAuth();
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.organizationId) {
        setLoading(false);
        return;
      }

      try {
        const allDiagnostics = await getDiagnostics();
        const userDiagnostics = allDiagnostics.filter(
          diag => diag.organizationId === currentUser.organizationId
        );
        setDiagnostics(userDiagnostics);
      } catch (error) {
        console.error("Error fetching client diagnostics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mes Diagnostics</h1>

      {diagnostics.length > 0 ? (
        <div className="grid grid-cols-1 gap-8">
          {diagnostics.map((diag) => (
            <div key={diag.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{diag.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Réalisé le {diag.date}
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                  <span className="text-sm font-medium text-gray-600">Score Global</span>
                  <span className={`text-2xl font-bold ${
                    diag.globalScore >= 70 ? 'text-green-600' : 
                    diag.globalScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {diag.globalScore}/100
                  </span>
                </div>
              </div>

              <div className="p-6 lg:p-8">
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Analyse Générale</h4>
                  <p className="text-gray-600 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                    {diag.comment}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {Object.entries(diag.scores).map(([key, score]) => {
                    const s = score as number;
                    return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-medium text-gray-700 capitalize">{key}</span>
                        <span className="text-sm font-bold text-gray-900">{s}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-1000 ${
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
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucun diagnostic disponible</h3>
          <p className="text-gray-500">Votre organisation n'a pas encore été évaluée.</p>
        </div>
      )}
    </div>
  );
}
