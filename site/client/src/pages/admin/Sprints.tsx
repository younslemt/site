import React, { useState, useEffect } from 'react';
import { Plus, Calendar, CheckSquare, MoreHorizontal, ChevronDown, ChevronUp, Edit, Trash2, X } from 'lucide-react';
import { Sprint, Task, Organization } from '../../types';
import SprintModal from '../../components/modals/SprintModal';
import TaskModal from '../../components/modals/TaskModal';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import * as FirestoreService from '../../services/firestore';

export default function AdminSprints() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSprint, setExpandedSprint] = useState<string | null>(null);
  
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | undefined>(undefined);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeSprintId, setActiveSprintId] = useState<string | null>(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'sprint' | 'task';
    id: string;
  }>({ isOpen: false, type: 'sprint', id: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sprintsData, tasksData, orgsData] = await Promise.all([
        FirestoreService.getSprints(),
        FirestoreService.getTasks(),
        FirestoreService.getOrganizations()
      ]);
      setSprints(sprintsData);
      setTasks(tasksData);
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

  const getSprintTasks = (sprintId: string) => {
    return tasks.filter(t => t.sprintId === sprintId);
  };

  const toggleExpand = (sprintId: string) => {
    setExpandedSprint(expandedSprint === sprintId ? null : sprintId);
  };

  // Sprint CRUD
  const handleSaveSprint = async (sprint: Sprint) => {
    try {
      if (editingSprint) {
        await FirestoreService.updateSprint(sprint.id, sprint);
        setSprints(sprints.map(s => s.id === sprint.id ? sprint : s));
      } else {
        // Remove ID for creation as Firestore generates it
        const { id, ...sprintData } = sprint;
        const newSprint = await FirestoreService.addSprint(sprintData);
        setSprints([...sprints, newSprint]);
      }
    } catch (error) {
      console.error("Error saving sprint:", error);
      alert("Erreur lors de l'enregistrement du sprint");
    }
  };

  const confirmDeleteSprint = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteConfirmation({ isOpen: true, type: 'sprint', id });
  };

  const handleDeleteSprint = async () => {
    try {
      const id = deleteConfirmation.id;
      await FirestoreService.deleteSprint(id);
      
      // Also delete associated tasks
      const sprintTasks = tasks.filter(t => t.sprintId === id);
      await Promise.all(sprintTasks.map(t => FirestoreService.deleteTask(t.id)));

      setSprints(sprints.filter(s => s.id !== id));
      setTasks(tasks.filter(t => t.sprintId !== id));
    } catch (error) {
      console.error("Error deleting sprint:", error);
      alert("Erreur lors de la suppression du sprint");
    }
  };

  const openNewSprintModal = () => {
    setEditingSprint(undefined);
    setIsSprintModalOpen(true);
  };

  const openEditSprintModal = (e: React.MouseEvent, sprint: Sprint) => {
    e.stopPropagation();
    setEditingSprint(sprint);
    setIsSprintModalOpen(true);
  };

  // Task CRUD
  const handleSaveTask = async (task: Task) => {
    try {
      // Remove ID for creation as Firestore generates it
      const { id, ...taskData } = task;
      const newTask = await FirestoreService.addTask(taskData);
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Erreur lors de l'ajout de la tâche");
    }
  };

  const confirmDeleteTask = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setDeleteConfirmation({ isOpen: true, type: 'task', id: taskId });
  };

  const handleDeleteTask = async () => {
    try {
      const taskId = deleteConfirmation.id;
      await FirestoreService.deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Erreur lors de la suppression de la tâche");
    }
  };

  const openNewTaskModal = (sprintId: string) => {
    setActiveSprintId(sprintId);
    setIsTaskModalOpen(true);
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, isCompleted: !task.isCompleted };
    
    // Optimistic update
    setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));

    try {
      await FirestoreService.updateTask(taskId, { isCompleted: updatedTask.isCompleted });
    } catch (error) {
      console.error("Error updating task:", error);
      // Revert on error
      setTasks(tasks.map(t => t.id === taskId ? task : t));
      alert("Erreur lors de la mise à jour de la tâche");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Sprints</h1>
        <button 
          onClick={openNewSprintModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau Sprint
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sprint</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tâches</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sprints.map((sprint) => {
                const sprintTasks = getSprintTasks(sprint.id);
                const completedTasks = sprintTasks.filter(t => t.isCompleted).length;
                const progress = sprintTasks.length > 0 ? Math.round((completedTasks / sprintTasks.length) * 100) : 0;
                const isExpanded = expandedSprint === sprint.id;

                return (
                  <React.Fragment key={sprint.id}>
                    <tr className={`hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`} onClick={() => toggleExpand(sprint.id)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{sprint.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{getOrgName(sprint.organizationId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {sprint.startDate} - {sprint.endDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${sprint.status === 'En Cours' ? 'bg-green-100 text-green-800' : 
                            sprint.status === 'Terminé' ? 'bg-gray-100 text-gray-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {sprint.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                          <span className="text-xs text-gray-500">{completedTasks}/{sprintTasks.length}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            type="button"
                            onClick={(e) => openEditSprintModal(e, sprint)} 
                            className="text-gray-400 hover:text-indigo-600 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => confirmDeleteSprint(e, sprint.id)} 
                            className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </div>
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-bold text-gray-900">Tâches du Sprint</h4>
                              <button 
                                onClick={() => openNewTaskModal(sprint.id)}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                              >
                                <Plus className="w-3 h-3 mr-1" /> Ajouter une tâche
                              </button>
                            </div>
                            
                            {sprintTasks.length > 0 ? (
                              <ul className="space-y-2">
                                {sprintTasks.map(task => (
                                  <li key={task.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md border border-transparent hover:border-gray-100">
                                    <div className="flex items-center">
                                      <div 
                                        onClick={() => toggleTask(task.id)}
                                        className={`w-5 h-5 rounded border flex items-center justify-center mr-3 cursor-pointer ${task.isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
                                      >
                                        {task.isCompleted && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                                      </div>
                                      <span 
                                        onClick={() => toggleTask(task.id)}
                                        className={`text-sm cursor-pointer ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}
                                      >
                                        {task.title}
                                      </span>
                                    </div>
                                    <button 
                                      type="button"
                                      onClick={(e) => confirmDeleteTask(e, task.id)}
                                      className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500 italic">Aucune tâche assignée à ce sprint.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <SprintModal 
        isOpen={isSprintModalOpen}
        onClose={() => setIsSprintModalOpen(false)}
        onSave={handleSaveSprint}
        sprint={editingSprint}
      />

      {activeSprintId && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleSaveTask}
          sprintId={activeSprintId}
        />
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ ...deleteConfirmation, isOpen: false })}
        onConfirm={deleteConfirmation.type === 'sprint' ? handleDeleteSprint : handleDeleteTask}
        title={deleteConfirmation.type === 'sprint' ? 'Supprimer le sprint' : 'Supprimer la tâche'}
        message={deleteConfirmation.type === 'sprint' 
          ? 'Êtes-vous sûr de vouloir supprimer ce sprint ? Cette action est irréversible et supprimera toutes les tâches associées.' 
          : 'Êtes-vous sûr de vouloir supprimer cette tâche ?'}
      />
    </div>
  );
}
