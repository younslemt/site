import React from 'react';
import { Award, Star, Trophy } from 'lucide-react';

export default function ClientAchievements() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mes Récompenses</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center opacity-50">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Sprint Master</h3>
          <p className="text-sm text-gray-500 mt-2">Compléter 5 sprints consécutifs à 100%</p>
          <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '20%' }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">1/5</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Early Adopter</h3>
          <p className="text-sm text-gray-500 mt-2">Rejoindre la plateforme en 2026</p>
          <span className="inline-block mt-4 px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
            Obtenu
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center opacity-50">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Document Hero</h3>
          <p className="text-sm text-gray-500 mt-2">Télécharger tous les documents du trimestre</p>
          <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '50%' }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">2/4</p>
        </div>
      </div>
    </div>
  );
}
