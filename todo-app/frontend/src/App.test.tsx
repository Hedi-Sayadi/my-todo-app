import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

const getActiveSessionMock = vi.fn();

vi.mock('./services/authService', () => ({
  getActiveSession: () => getActiveSessionMock(),
}));

vi.mock('./pages/Dashboard', () => ({ default: () => <div>Dashboard Page</div> }));
vi.mock('./pages/Tasks', () => ({ default: () => <div>Tasks Page</div> }));
vi.mock('./pages/Categories', () => ({ default: () => <div>Categories Page</div> }));
vi.mock('./pages/Reminders', () => ({ default: () => <div>Reminders Page</div> }));
vi.mock('./pages/Settings', () => ({ default: () => <div>Settings Page</div> }));
vi.mock('./pages/Login', () => ({ default: () => <div>Login Page</div> }));
vi.mock('./pages/Register', () => ({ default: () => <div>Register Page</div> }));

describe('App routing guards', () => {
  beforeEach(() => {
    getActiveSessionMock.mockReset();
  });

  it('redirects unauthenticated user to login for protected routes', () => {
    getActiveSessionMock.mockReturnValue(null);
    window.history.pushState({}, '', '/tasks');

    render(<App />);

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects authenticated user away from login to dashboard', () => {
    getActiveSessionMock.mockReturnValue({
      token: 'jwt',
      user: { id: 1 },
      expiresAt: Date.now() + 60_000,
    });
    window.history.pushState({}, '', '/login');

    render(<App />);

    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });
});
