import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddTodo } from './AddTodo';

describe('AddTodo', () => {
  it('should render input and button', () => {
    render(<AddTodo onAdd={vi.fn()} />);

    expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('should disable button when input is empty', () => {
    render(<AddTodo onAdd={vi.fn()} />);

    const button = screen.getByRole('button', { name: /add task/i });
    expect(button).toBeDisabled();
  });

  it('should enable button when input has text', async () => {
    const user = userEvent.setup();
    render(<AddTodo onAdd={vi.fn()} />);

    const input = screen.getByPlaceholderText('Add a new task...');
    await user.type(input, 'New task');

    const button = screen.getByRole('button', { name: /add task: new task/i });
    expect(button).not.toBeDisabled();
  });

  it('should call onAdd with trimmed text on submit', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddTodo onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('Add a new task...');
    await user.type(input, '  Buy groceries  ');
    await user.keyboard('{Enter}');

    expect(onAdd).toHaveBeenCalledWith('Buy groceries');
  });

  it('should clear input after submission', async () => {
    const user = userEvent.setup();
    render(<AddTodo onAdd={vi.fn()} />);

    const input = screen.getByPlaceholderText('Add a new task...');
    await user.type(input, 'New task');
    await user.keyboard('{Enter}');

    expect(input).toHaveValue('');
  });

  it('should not submit empty input', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddTodo onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('Add a new task...');
    await user.type(input, '   ');
    await user.keyboard('{Enter}');

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('should show keyboard hint when focused with text', async () => {
    const user = userEvent.setup();
    render(<AddTodo onAdd={vi.fn()} />);

    const input = screen.getByPlaceholderText('Add a new task...');
    await user.type(input, 'Task');

    expect(screen.getByText(/press/i)).toBeInTheDocument();
    expect(screen.getByText('Enter')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<AddTodo onAdd={vi.fn()} />);

    const form = screen.getByRole('search', { name: /add new task/i });
    expect(form).toBeInTheDocument();

    const input = screen.getByLabelText(/add a new task/i);
    expect(input).toBeInTheDocument();
  });
});
