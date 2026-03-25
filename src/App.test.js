import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders the app header', () => {
  render(<App />);
  expect(screen.getByText(/ABCDH Technologies/i)).toBeInTheDocument();
});

test('renders user selector with all users', () => {
  render(<App />);
  expect(screen.getAllByText(/Alice \(Admin\)/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Bob \(Manager\)/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Carol \(Member\)/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Dave \(Member\)/i).length).toBeGreaterThan(0);
});

test('renders task list with project tasks', () => {
  render(<App />);
  expect(screen.getByText(/Project Tasks/i)).toBeInTheDocument();
  expect(screen.getByText(/Design mockups/i)).toBeInTheDocument();
});

test('admin can see the permissions panel', () => {
  render(<App />);
  expect(screen.getByText(/User Permissions/i)).toBeInTheDocument();
  expect(screen.getAllByText(/Can self-assign tasks/i).length).toBeGreaterThan(0);
});

test('admin can toggle self-assign permission for a user', () => {
  render(<App />);

  // Alice (Admin) is selected by default; Carol and Dave start without permission → "Grant"
  const grantButtons = screen.getAllByText('Grant');
  expect(grantButtons.length).toBeGreaterThan(0);

  fireEvent.click(grantButtons[0]);

  // After granting, at least one "Revoke" button should now exist
  const revokeButtons = screen.getAllByText('Revoke');
  expect(revokeButtons.length).toBeGreaterThan(0);
});

test('member without permission sees no self-assign button', () => {
  render(<App />);

  // Switch to Carol (member, canSelfAssignTasks = false)
  const carolButtons = screen.getAllByText(/Carol \(Member\)/i);
  // The UserSelector button is the first occurrence
  fireEvent.click(carolButtons[0]);

  // "Assign to me" buttons should not be visible
  expect(screen.queryAllByText(/Assign to me/i).length).toBe(0);
  // Instead, "No permission" notice should appear
  expect(screen.getAllByText(/No permission to self-assign/i).length).toBeGreaterThan(0);
});

test('member with permission can self-assign a task', () => {
  render(<App />);

  // Switch to Bob (manager, canSelfAssignTasks = true)
  const bobButtons = screen.getAllByText(/Bob \(Manager\)/i);
  fireEvent.click(bobButtons[0]);

  // Bob should see "Assign to me" buttons for unassigned tasks
  const assignBtns = screen.getAllByText(/Assign to me/i);
  expect(assignBtns.length).toBeGreaterThan(0);

  // Click the first one
  fireEvent.click(assignBtns[0]);

  // After self-assigning, Bob's name should appear as the assignee
  expect(screen.getAllByText(/Assigned to: Bob \(Manager\)/i).length).toBeGreaterThan(0);
});

