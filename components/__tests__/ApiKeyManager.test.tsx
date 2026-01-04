import { render, screen } from '@testing-library/react';
import ApiKeyManager from '../ApiKeyManager';
import { describe, it, expect } from 'vitest';
import { AiProvider } from '../../types';

describe('ApiKeyManager', () => {
  it('renders the component with the correct title', () => {
    render(
      <ApiKeyManager
        apiKeys={[]}
        onAddKey={(label: string, key: string, provider: AiProvider) => {}}
        onDeleteKey={() => {}}
        onSelectKey={() => {}}
      />
    );
    expect(
      screen.getByText('API Key Management')
    ).toBeInTheDocument();
  });
});