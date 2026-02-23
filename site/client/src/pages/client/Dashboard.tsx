import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getSprints, getTasks, updateTask, getOrganizations } from '../../services/firestore';
import { Sprint, Task } from '../../types';
import { Timer, CheckSquare, Calendar, AlertCircle } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

export default function ClientDashboard() {
  const { currentUser } = useAuth();
  const [activeSprint, setActiveSprint] = useState<Sprint | undefined>(undefined);
  const [upcomingSprints, setUpcomingSprints] = useState<Sprint[]>([]);
  const [completedSprints, setCompletedSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationName, setOrganizationName] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.organizationId) {
        setLoading(false);
        return;
      }

      try {
        const [sprintsData, tasksData, orgsData] = await Promise.all([
          getSprints(),
          getTasks(),
          getOrganizations()
        ]);

        const org = orgsData.find(o => o.id === currentUser.organizationId);
        if (org) setOrganizationName(org.name);

        const orgSprints = sprintsData.filter(
          s => s.organizationId === currentUser.organizationId
        );

        const active = orgSprints.find(s => s.status === 'En Cours');
        const upcoming = orgSprints.filter(s => s.status === 'Pas commencé');
        const completed = orgSprints.filter(s => s.status === 'Terminé');

        setActiveSprint(active);
        setUpcomingSprints(upcoming);
        setCompletedSprints(completed);

        if (active) {
          setTasks(tasksData.filter(t => t.sprintId === active.id));
        }
      } catch (error) {
        console.error("Error fetching client dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, isCompleted: !task.isCompleted };
    
    // Optimistic update
    setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));

    try {
      await updateTask(taskId, { isCompleted: updatedTask.isCompleted });
    } catch (error) {
      console.error("Error updating task:", error);
      // Revert on error
      setTasks(tasks.map(t => t.id === taskId ? task : t));
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  if (!activeSprint && upcomingSprints.length === 0 && completedSprints.length === 0) {
    return (
      <div className="text-center py-12">
        {organizationName && <h1 className="text-2xl font-bold text-gray-900 mb-8">{organizationName}</h1>}
        <div className="bg-indigo-50 rounded-full p-4 inline-block mb-4">
          <Timer className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Aucun sprint</h2>
        <p className="text-gray-500 mt-2">Votre organisation n'a aucun sprint pour le moment.</p>
      </div>
    );
  }

  // Calculate Progress for Active Sprint
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate Time Progress for Active Sprint
  let timeProgress = 0;
  let remainingDays = 0;
  
  if (activeSprint) {
    const start = parseISO(activeSprint.startDate);
    const end = parseISO(activeSprint.endDate);
    const now = new Date();
    
    const totalDuration = differenceInDays(end, start);
    const elapsed = differenceInDays(now, start);
    remainingDays = differenceInDays(end, now);

    if (totalDuration > 0) {
      timeProgress = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bienvenue, {currentUser?.name} !</h1>
        {organizationName && (
          <p className="text-lg text-indigo-600 font-semibold mb-2">{organizationName}</p>
        )}
        <p className="text-gray-500">Voici l'état d'avancement de vos sprints.</p>
      </div>

      {activeSprint ? (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Sprint Actif : {activeSprint.name}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Progress Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Timer className="w-5 h-5 text-indigo-600" />
                  Progression du temps
                </h3>
                
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-gray-500">Début: {activeSprint.startDate}</span>
                  <span className="font-medium text-indigo-600">{remainingDays} jours restants</span>
                  <span className="text-gray-500">Fin: {activeSprint.endDate}</span>
                </div>
                
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${timeProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-green-600" />
                  Tâches accomplies
                </h3>
                
                <div className="flex items-end gap-4 mb-4">
                  <span className="text-4xl font-bold text-gray-900">{taskProgress}%</span>
                  <span className="text-sm text-gray-500 mb-1.5">{completedTasks} sur {totalTasks} tâches</span>
                </div>
                
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-green-500 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${taskProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Checklist Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Checklist du Sprint</h3>
              
              <div className="space-y-3">
                {tasks.map((task) => (
                  <label 
                    key={task.id} 
                    className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      task.isCompleted 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={task.isCompleted}
                        onChange={() => toggleTask(task.id)}
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <span className={`font-medium block ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {task.title}
                      </span>
                    </div>
                  </label>
                ))}
                
                {tasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>Aucune tâche pour ce sprint.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-indigo-50 rounded-xl p-6 text-center">
            <h2 className="text-lg font-semibold text-indigo-900">Aucun sprint actif pour le moment</h2>
        </div>
      )}

      {/* Upcoming Sprints */}
      {upcomingSprints.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Sprints à venir</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingSprints.map(sprint => (
              <div key={sprint.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{sprint.name}</h3>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pas commencé
                    </span>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {sprint.startDate} - {sprint.endDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Sprints */}
      {completedSprints.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Sprints terminés</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedSprints.map(sprint => (
              <div key={sprint.id} className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700">{sprint.name}</h3>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">
                        Terminé
                    </span>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {sprint.startDate} - {sprint.endDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
