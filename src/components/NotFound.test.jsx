import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotFound } from './NotFound';

describe('NotFound', () => {
  it('should render 404 message', () => {
    render(<NotFound onNavigate={vi.fn()} />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('should have navigation buttons', () => {
    render(<NotFound onNavigate={vi.fn()} />);

    expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view tasks/i })).toBeInTheDocument();
  });

  it('should call onNavigate with dashboard when clicking Go to Dashboard', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<NotFound onNavigate={onNavigate} />);

    await user.click(screen.getByRole('button', { name: /go to dashboard/i }));

    expect(onNavigate).toHaveBeenCalledWith('dashboard');
  });

  it('should call onNavigate with tasks when clicking View Tasks', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<NotFound onNavigate={onNavigate} />);

    await user.click(screen.getByRole('button', { name: /view tasks/i }));

    expect(onNavigate).toHaveBeenCalledWith('tasks');
  });

  it('should have quick links section', () => {
    render(<NotFound onNavigate={vi.fn()} />);

    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Attendance' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Focus Timer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Notes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expenses' })).toBeInTheDocument();
  });

  it('should navigate to correct view when clicking quick links', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<NotFound onNavigate={onNavigate} />);

    await user.click(screen.getByRole('button', { name: 'Notes' }));
    expect(onNavigate).toHaveBeenCalledWith('notes');

    await user.click(screen.getByRole('button', { name: 'Expenses' }));
    expect(onNavigate).toHaveBeenCalledWith('expenses');
  });
});
