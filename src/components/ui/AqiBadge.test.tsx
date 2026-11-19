import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AqiBadge } from './AqiBadge';

describe('AqiBadge Component', () => {
  it('renders Good category with accessible label', () => {
    render(<AqiBadge category="Good" aqi={35} />);
    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('aria-label', 'Air Quality Status: Good, AQI 35');
    expect(screen.getByText(/Good • 35/i)).toBeInTheDocument();
  });

  it('renders Severe category with distinct styling and label', () => {
    render(<AqiBadge category="Severe" aqi={440} />);
    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('aria-label', 'Air Quality Status: Severe, AQI 440');
    expect(screen.getByText(/Severe • 440/i)).toBeInTheDocument();
  });

  it('renders without numeric AQI when not provided', () => {
    render(<AqiBadge category="Poor" />);
    expect(screen.getByText('Poor')).toBeInTheDocument();
  });
});
