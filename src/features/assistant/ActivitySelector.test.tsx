import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ActivitySelector } from './ActivitySelector';

describe('ActivitySelector Component', () => {
  it('renders all 6 required activity buttons', () => {
    const handleSelect = vi.fn();
    render(<ActivitySelector selected="walking" onSelect={handleSelect} />);

    expect(screen.getByText('Walking')).toBeInTheDocument();
    expect(screen.getByText('Running / Jogging')).toBeInTheDocument();
    expect(screen.getByText('Cycling')).toBeInTheDocument();
    expect(screen.getByText('Outdoor Sports')).toBeInTheDocument();
    expect(screen.getByText('School Commute')).toBeInTheDocument();
    expect(screen.getByText('Daily Commute')).toBeInTheDocument();
  });

  it('triggers onSelect when an activity is clicked', () => {
    const handleSelect = vi.fn();
    render(<ActivitySelector selected="walking" onSelect={handleSelect} />);

    const runningBtn = screen.getByText('Running / Jogging');
    fireEvent.click(runningBtn);

    expect(handleSelect).toHaveBeenCalledWith('running');
  });
});
