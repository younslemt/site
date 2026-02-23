import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User, Organization, Sprint, Task, Document, Diagnostic } from '../types';

export const seedDatabase = async () => {
  console.log("Starting database seed...");

  try {
    // 1. Create/Update Organization
    const orgId = 'org-belcompta';
    const organization: Organization = {
      id: orgId,
      name: 'Belcompta',
      type: 'Client',
      employeeCount: 15,
      vatNumber: 'BE0123456789'
    };
    await setDoc(doc(db, 'organizations', orgId), organization);
    console.log("Organization seeded");

    // 2. Create/Update Admin User
    const adminId = 'AAlznCj00vNpekjZpLc4a9f67E03';
    const adminUser: User = {
      id: adminId,
      name: 'Admin Contact',
      email: 'contact@Masteryourmetrics.be',
      role: 'admin'
    };
    await setDoc(doc(db, 'users', adminId), adminUser);
    console.log("Admin user seeded");

    // 3. Create/Update Client User (Karim)
    const clientId = 'bIOroYp0KxgJFhEfK6V2bUr4xNn2';
    const clientUser: User = {
      id: clientId,
      name: 'Karim',
      email: 'belcompta@masteryourmetrics.be',
      role: 'client',
      organizationId: orgId
    };
    await setDoc(doc(db, 'users', clientId), clientUser);
    console.log("Client user (Karim) seeded");

    // 3b. Create/Update Client User (Fiduciaire)
    // Using the UID provided by the user: laIe3SMHQjFOfEf7KPYl6YmdUlMQx2
    const fidId = 'laIe3SMHQjFOfEf7KPYl6YmdUlMQx2';
    const orgFiduciaireId = 'org-fiduciaire';
    
    const fidUser: User = {
      id: fidId,
      name: 'Fiduciaire',
      email: 'fiduciaire@masteryourmetrics.be',
      role: 'client',
      organizationId: orgFiduciaireId
    };
    await setDoc(doc(db, 'users', fidId), fidUser);
    console.log("Client user (Fiduciaire) seeded");

    const organizationFiduciaire: Organization = {
      id: orgFiduciaireId,
      name: 'Fiduciaire',
      type: 'Client',
      employeeCount: 5,
      vatNumber: 'BE0987654321'
    };
    await setDoc(doc(db, 'organizations', orgFiduciaireId), organizationFiduciaire);
    console.log("Organization Fiduciaire seeded");
    
    const sprintFiduciaireId = 'sprint-fiduciaire-q1';
    const sprintFiduciaire: Sprint = {
      id: sprintFiduciaireId,
      name: 'Sprint Lancement',
      organizationId: orgFiduciaireId,
      status: 'En Cours',
      startDate: '2026-02-01',
      endDate: '2026-04-30'
    };
    await setDoc(doc(db, 'sprints', sprintFiduciaireId), sprintFiduciaire);
    console.log("Sprint Fiduciaire seeded");

    // Add tasks for Fiduciaire
    const tasksFiduciaire: Task[] = [
      { id: 'task-fid-1', sprintId: sprintFiduciaireId, title: 'Configuration initiale', isCompleted: true },
      { id: 'task-fid-2', sprintId: sprintFiduciaireId, title: 'Import des dossiers', isCompleted: false },
    ];
    for (const task of tasksFiduciaire) {
      await setDoc(doc(db, 'tasks', task.id), task);
    }

    // 4. Create Sprint for Client Organization (Belcompta)
    const sprintId = 'sprint-q1-2026';
    const sprint: Sprint = {
      id: sprintId,
      name: 'Sprint Q1 2026',
      organizationId: orgId,
      status: 'En Cours',
      startDate: '2026-01-01',
      endDate: '2026-03-31'
    };
    await setDoc(doc(db, 'sprints', sprintId), sprint);
    console.log("Sprint seeded");

    // 5. Create Tasks for Sprint
    const tasks: Task[] = [
      { id: 'task-1', sprintId: sprintId, title: 'Valider les comptes annuels', isCompleted: true },
      { id: 'task-2', sprintId: sprintId, title: 'Mettre à jour le dossier AML', isCompleted: false },
      { id: 'task-3', sprintId: sprintId, title: 'Signer le mandat', isCompleted: true },
      { id: 'task-4', sprintId: sprintId, title: 'Envoyer les pièces justificatives', isCompleted: false },
    ];

    for (const task of tasks) {
      await setDoc(doc(db, 'tasks', task.id), task);
    }
    console.log("Tasks seeded");

    // 6. Create Document
    const docId = 'doc-bilan-2025';
    const document: Document = {
      id: docId,
      title: 'Rapport Financier 2025',
      description: 'Bilan et compte de résultat de l\'année précédente.',
      organizationId: orgId,
      fileUrl: '#'
    };
    await setDoc(doc(db, 'documents', docId), document);
    console.log("Document seeded");

    // 7. Create Diagnostic
    const diagId = 'diag-init-2026';
    const diagnostic: Diagnostic = {
      id: diagId,
      organizationId: orgId,
      title: 'Diagnostic Initial 2026',
      date: '2026-01-15',
      globalScore: 41,
      comment: 'Des efforts sont nécessaires sur la digitalisation et la cybersécurité.',
      scores: {
        esg: 60,
        credit: 75,
        cybersecurity: 30,
        aml: 80,
        digitalisation: 25
      }
    };
    await setDoc(doc(db, 'diagnostics', diagId), diagnostic);
    console.log("Diagnostic seeded");

    alert("Base de données initialisée avec succès ! Vous pouvez maintenant vous connecter.");

  } catch (error) {
    console.error("Error seeding database:", error);
    alert("Erreur lors de l'initialisation de la base de données. Vérifiez la console.");
  }
};
