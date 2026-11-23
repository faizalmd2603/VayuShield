import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LifestyleProfileForm } from '../components/profile/LifestyleProfileForm';
import { SafeMarkdown } from '../components/common/SafeMarkdown';
import { DEFAULT_LIFESTYLE_PROFILE } from '../utils/storage';

describe('LifestyleProfileForm Component', () => {
  it('renders all sections and inputs with current profile values', () => {
    const handleUpdate = vi.fn();
    const handleReset = vi.fn();

    render(
      <LifestyleProfileForm
        profile={DEFAULT_LIFESTYLE_PROFILE}
        onUpdateProfile={handleUpdate}
        onReset={handleReset}
      />
    );

    expect(screen.getByText(/HOUSEHOLD VULNERABILITIES & SENSITIVITIES/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Community Role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ventilation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Air Purifier/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cooking Setup/i)).toBeInTheDocument();
  });

  it('toggles health sensitivities on button click', () => {
    const handleUpdate = vi.fn();
    const handleReset = vi.fn();

    render(
      <LifestyleProfileForm
        profile={DEFAULT_LIFESTYLE_PROFILE}
        onUpdateProfile={handleUpdate}
        onReset={handleReset}
      />
    );

    const pregnantBtn = screen.getByRole('button', { name: /\+ Pregnant Member/i });
    fireEvent.click(pregnantBtn);

    expect(handleUpdate).toHaveBeenCalledWith({
      healthSensitivities: [...DEFAULT_LIFESTYLE_PROFILE.healthSensitivities, 'pregnant'],
    });
  });

  it('triggers reset to defaults when reset button is clicked', () => {
    const handleUpdate = vi.fn();
    const handleReset = vi.fn();

    render(
      <LifestyleProfileForm
        profile={DEFAULT_LIFESTYLE_PROFILE}
        onUpdateProfile={handleUpdate}
        onReset={handleReset}
      />
    );

    const resetBtn = screen.getByRole('button', { name: /Reset Defaults/i });
    fireEvent.click(resetBtn);

    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});

describe('SafeMarkdown Component', () => {
  it('renders plain text and bold tags correctly without dangerouslySetInnerHTML', () => {
    const content = `### Action Directive
- **Close windows** during nocturnal inversion
- Run HEPA air purifier on **High**`;

    render(<SafeMarkdown content={content} />);

    expect(screen.getByText('Action Directive')).toBeInTheDocument();
    expect(screen.getByText('Close windows')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });
});
