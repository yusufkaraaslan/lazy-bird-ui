import { BLOCK_REGISTRY, getAvailableBlocks, getBlockDefinition } from '../config/blockRegistry';

describe('blockRegistry', () => {
  it('has all expected blocks registered', () => {
    const expectedBlocks = [
      'system-status', 'active-projects', 'queue-overview', 'agent-status',
      'recent-activity', 'cost-tracker', 'project-header', 'project-issues',
      'project-statistics', 'project-timeline', 'project-test-history', 'project-cost',
    ];
    for (const id of expectedBlocks) {
      expect(BLOCK_REGISTRY[id]).toBeDefined();
      expect(BLOCK_REGISTRY[id].id).toBe(id);
      expect(BLOCK_REGISTRY[id].name).toBeTruthy();
      expect(BLOCK_REGISTRY[id].component).toBeDefined();
    }
  });

  it('getAvailableBlocks filters by tab', () => {
    const dashboardBlocks = getAvailableBlocks('dashboard');
    expect(dashboardBlocks.length).toBeGreaterThan(0);
    dashboardBlocks.forEach(block => {
      expect(block.availableIn).toContain('dashboard');
    });
  });

  it('getAvailableBlocks filters by view', () => {
    const overallBlocks = getAvailableBlocks('dashboard', 'overall');
    const projectBlocks = getAvailableBlocks('dashboard', 'project');

    overallBlocks.forEach(block => {
      expect(block.requiresView).toBeOneOf([undefined, 'overall']);
    });
    projectBlocks.forEach(block => {
      expect(block.requiresView).toBeOneOf([undefined, 'project']);
    });
  });

  it('getBlockDefinition returns correct block', () => {
    const block = getBlockDefinition('system-status');
    expect(block).toBeDefined();
    expect(block!.name).toBe('System Status');
  });

  it('getBlockDefinition returns undefined for unknown block', () => {
    expect(getBlockDefinition('nonexistent')).toBeUndefined();
  });
});
