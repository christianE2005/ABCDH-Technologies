import React from 'react';

const ROLE_BADGE_COLORS = {
  admin: '#dc3545',
  manager: '#fd7e14',
  member: '#0d6efd',
};

function UserSelector({ users, currentUser, onSelectUser }) {
  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Switch User (Demo)</h3>
      <p style={styles.hint}>Select a user to see what they can do.</p>
      <div style={styles.list}>
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelectUser(user)}
            style={{
              ...styles.button,
              ...(currentUser.id === user.id ? styles.buttonActive : {}),
            }}
            aria-pressed={currentUser.id === user.id}
          >
            <span style={styles.name}>{user.name}</span>
            <span
              style={{
                ...styles.badge,
                backgroundColor: ROLE_BADGE_COLORS[user.role] || '#6c757d',
              }}
            >
              {user.role}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: 8,
    padding: '16px 20px',
    marginBottom: 24,
  },
  heading: {
    margin: '0 0 4px 0',
    fontSize: 15,
    color: '#495057',
  },
  hint: {
    margin: '0 0 12px 0',
    fontSize: 13,
    color: '#868e96',
  },
  list: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    border: '2px solid #dee2e6',
    borderRadius: 6,
    background: '#fff',
    cursor: 'pointer',
    fontSize: 14,
    color: '#212529',
    transition: 'border-color 0.15s',
  },
  buttonActive: {
    borderColor: '#0d6efd',
    background: '#e7f1ff',
  },
  name: {
    fontWeight: 500,
  },
  badge: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
};

export default UserSelector;
