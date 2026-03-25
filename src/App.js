import React, { useState } from 'react';
import './App.css';
import { INITIAL_USERS, INITIAL_TASKS } from './data/mockData';
import UserSelector from './components/UserSelector';
import TaskList from './components/TaskList';
import UserPermissions from './components/UserPermissions';

function App() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [currentUser, setCurrentUser] = useState(INITIAL_USERS[0]);

  const handleSelectUser = (user) => {
    setCurrentUser(user);
  };

  const handleTogglePermission = (userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, canSelfAssignTasks: !u.canSelfAssignTasks }
          : u
      )
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({
        ...prev,
        canSelfAssignTasks: !prev.canSelfAssignTasks,
      }));
    }
  };

  const handleSelfAssign = (taskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, assignedTo: currentUser.id, status: 'in-progress' }
          : t
      )
    );
  };

  const handleUnassign = (taskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, assignedTo: null, status: 'unassigned' } : t
      )
    );
  };

  return (
    <div style={appStyles.root}>
      <header style={appStyles.header}>
        <h1 style={appStyles.title}>ABCDH Technologies – Project Manager</h1>
        <p style={appStyles.subtitle}>
          Logged in as:{' '}
          <strong>{currentUser.name}</strong>
        </p>
      </header>
      <main style={appStyles.main}>
        <UserSelector
          users={users}
          currentUser={currentUser}
          onSelectUser={handleSelectUser}
        />
        <UserPermissions
          users={users}
          currentUser={currentUser}
          onTogglePermission={handleTogglePermission}
        />
        <TaskList
          tasks={tasks}
          users={users}
          currentUser={currentUser}
          onSelfAssign={handleSelfAssign}
          onUnassign={handleUnassign}
        />
      </main>
    </div>
  );
}

const appStyles = {
  root: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: '100vh',
    background: '#f4f6f9',
  },
  header: {
    background: '#1a1a2e',
    color: '#fff',
    padding: '20px 32px',
    marginBottom: 0,
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: 22,
    fontWeight: 700,
  },
  subtitle: {
    margin: 0,
    fontSize: 14,
    color: '#a0aec0',
  },
  main: {
    maxWidth: 860,
    margin: '32px auto',
    padding: '0 24px',
  },
};

export default App;
