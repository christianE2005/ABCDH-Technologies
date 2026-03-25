import React from 'react';

const STATUS_COLORS = {
  unassigned: '#6c757d',
  'in-progress': '#fd7e14',
  done: '#198754',
};

function TaskList({ tasks, users, currentUser, onSelfAssign, onUnassign }) {
  const getUserName = (userId) => {
    if (!userId) return null;
    const user = users.find((u) => u.id === userId);
    return user ? user.name : 'Unknown';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Project Tasks</h2>
      {tasks.length === 0 && (
        <p style={styles.empty}>No tasks found.</p>
      )}
      <div style={styles.list}>
        {tasks.map((task) => {
          const isAssignedToMe = task.assignedTo === currentUser.id;
          const isUnassigned = task.assignedTo === null;
          const canSelfAssign =
            currentUser.canSelfAssignTasks && isUnassigned;

          return (
            <div key={task.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.title}>{task.title}</span>
                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: STATUS_COLORS[task.status] || '#6c757d',
                  }}
                >
                  {task.status}
                </span>
              </div>
              <p style={styles.description}>{task.description}</p>
              <div style={styles.cardFooter}>
                <span style={styles.assignedLabel}>
                  {task.assignedTo
                    ? `Assigned to: ${getUserName(task.assignedTo)}`
                    : 'Unassigned'}
                </span>
                {canSelfAssign && (
                  <button
                    style={{ ...styles.btn, ...styles.btnSelfAssign }}
                    onClick={() => onSelfAssign(task.id)}
                    aria-label={`Self-assign task: ${task.title}`}
                  >
                    Assign to me
                  </button>
                )}
                {isAssignedToMe && (
                  <button
                    style={{ ...styles.btn, ...styles.btnUnassign }}
                    onClick={() => onUnassign(task.id)}
                    aria-label={`Unassign task: ${task.title}`}
                  >
                    Unassign me
                  </button>
                )}
                {!currentUser.canSelfAssignTasks && isUnassigned && (
                  <span style={styles.noPermission}>
                    No permission to self-assign
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    marginBottom: 32,
  },
  heading: {
    fontSize: 20,
    fontWeight: 700,
    margin: '0 0 16px 0',
    color: '#212529',
  },
  empty: {
    color: '#868e96',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    background: '#fff',
    border: '1px solid #dee2e6',
    borderRadius: 8,
    padding: '14px 18px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontWeight: 600,
    fontSize: 16,
    color: '#212529',
  },
  statusBadge: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  description: {
    margin: '0 0 10px 0',
    fontSize: 14,
    color: '#495057',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  assignedLabel: {
    fontSize: 13,
    color: '#868e96',
    flex: 1,
  },
  btn: {
    border: 'none',
    borderRadius: 5,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  btnSelfAssign: {
    background: '#0d6efd',
    color: '#fff',
  },
  btnUnassign: {
    background: '#dc3545',
    color: '#fff',
  },
  noPermission: {
    fontSize: 12,
    color: '#adb5bd',
    fontStyle: 'italic',
  },
};

export default TaskList;
