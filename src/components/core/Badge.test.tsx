import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge tone="positive">Connected</Badge>);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('renders a status dot when dot is true', () => {
    const { container } = render(
      <Badge tone="warning" dot>
        Reconnect needed
      </Badge>
    );
    expect(container.querySelectorAll('span').length).toBeGreaterThan(1);
  });
});
