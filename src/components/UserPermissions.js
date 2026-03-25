import React from 'react';

function UserPermissions({ users, currentUser, onTogglePermission }) {
  const canManage =
    currentUser.role === 'admin' || currentUser.role === 'manager';

  if (!canManage) {
    return (
      <div style={styles.container}>
        <h2 style={styles.heading}>User Permissions</h2>
        <p style={styles.restricted}>
          Only admins and managers can manage task assignment permissions.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>User Permissions</h2>
      <p style={styles.hint}>
        Toggle <strong>Can self-assign tasks</strong> to allow or restrict users
        from assigning tasks to themselves.
      </p>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>User</th>
            <th style={styles.th}>Role</th>
            <th style={styles.th}>Can self-assign tasks</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={styles.tr}>
              <td style={styles.td}>{user.name}</td>
              <td style={styles.td}>
                <span
                  style={{
                    ...styles.roleBadge,
                    ...(user.role === 'admin'
                      ? styles.roleAdmin
                      : user.role === 'manager'
                      ? styles.roleManager
                      : styles.roleMember),
                  }}
                >
                  {user.role}
                </span>
              </td>
              <td style={styles.td}>
                <span
                  style={
                    user.canSelfAssignTasks
                      ? styles.permGranted
                      : styles.permDenied
                  }
                >
                  {user.canSelfAssignTasks ? '✅ Allowed' : '🚫 Not allowed'}
                </span>
              </td>
              <td style={styles.td}>
                <button
                  style={{
                    ...styles.btn,
                    ...(user.canSelfAssignTasks
                      ? styles.btnRevoke
                      : styles.btnGrant),
                  }}
                  onClick={() => onTogglePermission(user.id)}
                  aria-label={`${
                    user.canSelfAssignTasks ? 'Revoke' : 'Grant'
                  } self-assign permission for ${user.name}`}
                >
                  {user.canSelfAssignTasks ? 'Revoke' : 'Grant'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    background: '#fff',
    border: '1px solid #dee2e6',
    borderRadius: 8,
    padding: '18px 22px',
    marginBottom: 32,
  },
  heading: {
    fontSize: 20,
    fontWeight: 700,
    margin: '0 0 8px 0',
    color: '#212529',
  },
  hint: {
    fontSize: 14,
    color: '#495057',
    margin: '0 0 16px 0',
  },
  restricted: {
    fontSize: 14,
    color: '#dc3545',
    margin: 0,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
  },
  th: {
    textAlign: 'left',
    padding: '8px 12px',
    background: '#f8f9fa',
    borderBottom: '2px solid #dee2e6',
    fontWeight: 700,
    color: '#495057',
  },
  tr: {
    borderBottom: '1px solid #f1f3f5',
  },
  td: {
    padding: '10px 12px',
    color: '#212529',
  },
  roleBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 12,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  roleAdmin: { background: '#dc3545' },
  roleManager: { background: '#fd7e14' },
  roleMember: { background: '#0d6efd' },
  permGranted: { color: '#198754', fontWeight: 600 },
  permDenied: { color: '#adb5bd' },
  btn: {
    border: 'none',
    borderRadius: 5,
    padding: '5px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnGrant: { background: '#198754', color: '#fff' },
  btnRevoke: { background: '#dc3545', color: '#fff' },
};

export default UserPermissions;
