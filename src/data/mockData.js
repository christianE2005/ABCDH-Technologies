export const INITIAL_USERS = [
  { id: 1, name: 'Alice (Admin)', role: 'admin', canSelfAssignTasks: true },
  { id: 2, name: 'Bob (Manager)', role: 'manager', canSelfAssignTasks: true },
  { id: 3, name: 'Carol (Member)', role: 'member', canSelfAssignTasks: false },
  { id: 4, name: 'Dave (Member)', role: 'member', canSelfAssignTasks: false },
];

export const INITIAL_TASKS = [
  {
    id: 1,
    title: 'Design mockups',
    description: 'Create wireframes and visual mockups for the new dashboard.',
    assignedTo: null,
    status: 'unassigned',
  },
  {
    id: 2,
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment.',
    assignedTo: null,
    status: 'unassigned',
  },
  {
    id: 3,
    title: 'Write unit tests',
    description: 'Add unit tests for all existing components.',
    assignedTo: 2,
    status: 'in-progress',
  },
  {
    id: 4,
    title: 'Update README documentation',
    description: 'Keep README up to date with setup and usage instructions.',
    assignedTo: null,
    status: 'unassigned',
  },
];
