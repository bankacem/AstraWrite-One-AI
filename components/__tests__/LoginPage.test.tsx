
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../LoginPage';
import { describe, it, expect, vi } from 'vitest';

// Mocking fetch
global.fetch = vi.fn();

describe('LoginPage', () => {
  it('renders the login form', () => {
    render(<LoginPage onLoginSuccess={() => {}} onBackToLanding={() => {}} />);
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('calls onLoginSuccess on successful login', async () => {
    const onLoginSuccess = vi.fn();
    (fetch as any).mockResolvedValueOnce({ ok: true });

    render(<LoginPage onLoginSuccess={onLoginSuccess} onBackToLanding={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'demo@astrawrite.ai' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Login to Console'));

    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('shows an error message on failed login', async () => {
    const onLoginSuccess = vi.fn();
    (fetch as any).mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({ message: 'Invalid credentials' }) });

    render(<LoginPage onLoginSuccess={onLoginSuccess} onBackToLanding={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'wrong@email.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByText('Login to Console'));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
