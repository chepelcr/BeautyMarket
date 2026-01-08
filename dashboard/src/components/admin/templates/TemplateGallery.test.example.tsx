/**
 * Example test file for TemplateGallery component
 *
 * This is a reference implementation showing how to test the component.
 * To use this:
 * 1. Set up your testing framework (Vitest + React Testing Library)
 * 2. Rename this file to TemplateGallery.test.tsx
 * 3. Run tests with: npm test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TemplateGallery } from './TemplateGallery';
import type { Template } from './types';

// Mock templates data
const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'beauty-market-demo',
    displayName: 'Beauty Market Demo',
    description: 'A complete beauty and cosmetics store',
    category: 'beauty',
    thumbnailUrl: 'https://example.com/beauty.jpg',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: '2',
    name: 'tech-store',
    displayName: 'Tech Store',
    description: 'Modern technology store template',
    category: 'tech',
    thumbnailUrl: 'https://example.com/tech.jpg',
    isActive: true,
    sortOrder: 2,
  },
  {
    id: '3',
    name: 'fashion-boutique',
    displayName: 'Fashion Boutique',
    description: 'Elegant fashion store design',
    category: 'fashion',
    thumbnailUrl: 'https://example.com/fashion.jpg',
    isActive: true,
    sortOrder: 3,
  },
];

// Helper to render with QueryClient
function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('TemplateGallery', () => {
  const mockOnSelectTemplate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockTemplates,
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner while fetching templates', () => {
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      renderWithQueryClient(
        <TemplateGallery onSelectTemplate={mockOnSelectTemplate} />
      );

      expect(screen.getByText(/loading templates/i)).toBeInTheDocument();
    });
  });

  describe('Successful Data Loading', () => {
    it('renders all templates when loaded', async () => {
      renderWithQueryClient(
        <TemplateGallery onSelectTemplate={mockOnSelectTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText('Beauty Market Demo')).toBeInTheDocument();
        expect(screen.getByText('Tech Store')).toBeInTheDocument();
        expect(screen.getByText('Fashion Boutique')).toBeInTheDocument();
      });
    });

    it('renders playground card', async () => {
      renderWithQueryClient(
        <TemplateGallery onSelectTemplate={mockOnSelectTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText('Playground')).toBeInTheDocument();
        expect(screen.getByText(/start from scratch/i)).toBeInTheDocument();
      });
    });

    it('displays correct number of templates', async () => {
      renderWithQueryClient(
        <TemplateGallery onSelectTemplate={mockOnSelectTemplate} />
      );

      await waitFor(() => {
        const templateCards = screen.getAllByText(/select template/i);
        expect(templateCards).toHaveLength(3);
      });
    });
  });

  describe('Search Functionality', () => {
    it('filters templates by search query', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <TemplateGallery onSelectTemplate={mockOnSelectTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText('Beauty Market Demo')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search templates/i);
      await user.type(searchInput, 'beauty');

      await waitFor(() => {
        expect(screen.getByText('Beauty Market Demo')).toBeInTheDocument();
        expect(screen.queryByText('Tech Store')).not.toBeInTheDocument();
        expect(screen.queryByText('Fashion Boutique')).not.toBeInTheDocument();
      });
    });

    it('shows no results message when search has no matches', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <TemplateGallery onSelectTemplate={mockOnSelectTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText('Beauty Market Demo')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search templates/i);
      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText(/no templates found/i)).toBeInTheDocument();
      });
    });

    it('clears search when clear filters is clicked', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <TemplateGallery onSelectTemplate={mockOnSelectTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText('Beauty Market Demo')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search templates/i);
      await user.type(searchInput, 'beauty');

      const clearButton = await screen.findByText(/clear filters/i);
      await user.click(clearButton);

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
        expect(screen.getByText('Tech Store')).toBeInTheDocument();
      });
    });
  });

  describe('Category Filtering', () => {
    it('filters templates by category', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <TemplateGallery onSelectTemplate={mockOnSelectTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText('Beauty Market Demo')).toBeInTheDocument();
      });

      const beautyBadge = screen.getByText('beauty');
      await user.click(beautyBadge);

      await waitFor(() => {
        expect(screen.getByText('Beauty Market Demo')).toBeInTheDocument();
        expect(screen.queryByText('Tech Store')).not.toBeInTheDocument();
      });
    });

    it('shows all templates when "All" category is selected', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <TemplateGallery onSelectTemplate={mockOnSelectTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText('Beauty Market Demo')).toBeInTheDocument();
      });

      // Click a category first
      const beautyBadge = screen.getByText('beauty');
      await user.click(beautyBadge);

      // Then click "All"
      const allBadge = screen.getByText('All');
      await user.click(allBadge);

      await waitFor(() => {
        expect(screen.getByText('Beauty Market Demo')).toBeInTheDocument();
        expect(screen.getByText('Tech Store')).toBeInTheDocument();
        expect(screen.getByText('Fashion Boutique')).toBeInTheDocument();
      });
    });
  });

  describe('Template Selection', () => {
    it('calls onSelectTemplate with template ID when template is selected', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <TemplateGallery onSelectTemplate={mockOnSelectTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText('Beauty Market Demo')).toBeInTheDocument();
      });

      const selectButtons = screen.getAllByText(/select template/i);
      await user.click(selectButtons[0]);

      expect(mockOnSelectTemplate).toHaveBeenCalledWith('1');
    });

    it('calls onSelectTemplate with null when playground is selected', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <TemplateGallery onSelectTemplate={mockOnSelectTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText('Playground')).toBeInTheDocument();
      });

      const playgroundButton = screen.getByText(/start from scratch/i);
      await user.click(playgroundButton);

      expect(mockOnSelectTemplate).toHaveBeenCalledWith(null);
    });
  });

  describe('Template Preview', () => {
    it('opens preview modal when preview button is clicked', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <TemplateGallery onSelectTemplate={mockOnSelectTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText('Beauty Market Demo')).toBeInTheDocument();
      });

      const previewButtons = screen.getAllByText(/preview/i);
      await user.click(previewButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('shows template details in preview modal', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <TemplateGallery onSelectTemplate={mockOnSelectTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText('Beauty Market Demo')).toBeInTheDocument();
      });

      const previewButtons = screen.getAllByText(/preview/i);
      await user.click(previewButtons[0]);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByText('Beauty Market Demo')).toBeInTheDocument();
        expect(
          within(dialog).getByText(/complete beauty and cosmetics store/i)
        ).toBeInTheDocument();
      });
    });

    it('can select template from preview modal', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <TemplateGallery onSelectTemplate={mockOnSelectTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText('Beauty Market Demo')).toBeInTheDocument();
      });

      // Open preview
      const previewButtons = screen.getAllByText(/preview/i);
      await user.click(previewButtons[0]);

      // Click "Use This Template" in modal
      const useTemplateButton = await screen.findByText(/use this template/i);
      await user.click(useTemplateButton);

      expect(mockOnSelectTemplate).toHaveBeenCalledWith('1');
    });

    it('closes preview modal when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(
        <TemplateGallery onSelectTemplate={mockOnSelectTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText('Beauty Market Demo')).toBeInTheDocument();
      });

      const previewButtons = screen.getAllByText(/preview/i);
      await user.click(previewButtons[0]);

      const cancelButton = await screen.findByText(/cancel/i);
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error message when fetch fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      renderWithQueryClient(
        <TemplateGallery onSelectTemplate={mockOnSelectTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText(/failed to load templates/i)).toBeInTheDocument();
      });
    });

    it('shows error details when available', async () => {
      mockFetch.mockRejectedValue(new Error('Custom error message'));

      renderWithQueryClient(
        <TemplateGallery onSelectTemplate={mockOnSelectTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText(/custom error message/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no templates are available', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      renderWithQueryClient(
        <TemplateGallery onSelectTemplate={mockOnSelectTemplate} />
      );

      await waitFor(() => {
        expect(screen.getByText(/no templates available/i)).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('calls correct API endpoint with query parameters', async () => {
      renderWithQueryClient(
        <TemplateGallery onSelectTemplate={mockOnSelectTemplate} />
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/templates?activeOnly=true'),
          expect.any(Object)
        );
      });
    });
  });
});
