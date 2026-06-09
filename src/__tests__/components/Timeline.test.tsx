import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timeline } from '../../app/components/Timeline';

const useApiTasksMock = vi.fn();

vi.mock('../../app/hooks/useProjectData', () => ({
  useApiTasks: (...args: unknown[]) => useApiTasksMock(...args),
}));

// Timeline ahora consume useAuth (filtro "mis tareas"); se mockea para que no
// requiera AuthProvider en el render aislado del test.
vi.mock('../../app/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, name: 'Test', role: 'user' } }),
}));

describe('Timeline', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.setSystemTime(new Date('2026-05-11T12:00:00'));
    useApiTasksMock.mockReturnValue({
      data: [
        {
          id_task: 1,
          title: 'Tarea de prueba',
          description: 'Descripción',
          start_date: '2026-05-09',
          due_date: '2026-05-11',
          created_at: '2026-05-09',
          completed_at: null,
          status: null,
          assigned_users: [],
        },
      ],
      loading: false,
      statuses: [],
    });
  });

  it('centers the today marker inside the current day column', () => {
    const { container } = render(<Timeline projectId={1} />);

    expect(screen.getByText('Timeline')).toBeInTheDocument();

    // El marcador "hoy" es una línea vertical de 1px (w-px) posicionada por `left` inline.
    const todayMarkers = Array.from(container.querySelectorAll('div.w-px')) as HTMLElement[];

    expect(todayMarkers.length).toBeGreaterThan(0);
    todayMarkers.forEach((marker) => {
      expect(marker.style.left).toBe('50%');
    });
  });
});
