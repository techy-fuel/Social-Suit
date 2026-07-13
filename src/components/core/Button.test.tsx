import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders its label', () => {
    render(<Button>Schedule</Button>);
    expect(screen.getByRole('button', { name: 'Schedule' })).toBeInTheDocument();
  });

  it('fires onClick when enabled', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Click me
      </Button>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
