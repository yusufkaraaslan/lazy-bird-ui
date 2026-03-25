import { useDashboardStore } from '../store/dashboardStore';
import { useThemeStore } from '../store/themeStore';

describe('dashboardStore', () => {
  beforeEach(() => {
    // Reset store state between tests
    useDashboardStore.setState({
      activeTab: 'dashboard',
      currentView: 'overall',
      selectedProjectId: null,
      visibleBlocks: [],
    });
  });

  it('sets active tab', () => {
    useDashboardStore.getState().setActiveTab('analytics');
    expect(useDashboardStore.getState().activeTab).toBe('analytics');
  });

  it('sets current view', () => {
    useDashboardStore.getState().setCurrentView('project');
    expect(useDashboardStore.getState().currentView).toBe('project');
  });

  it('sets selected project ID', () => {
    useDashboardStore.getState().setSelectedProjectId('proj-123');
    expect(useDashboardStore.getState().selectedProjectId).toBe('proj-123');
  });

  it('adds a block', () => {
    useDashboardStore.getState().addBlock('system-status');
    const blocks = useDashboardStore.getState().visibleBlocks;
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('system-status');
    expect(blocks[0].visible).toBe(true);
    expect(blocks[0].order).toBe(0);
  });

  it('removes a block', () => {
    useDashboardStore.getState().addBlock('system-status');
    const blockId = useDashboardStore.getState().visibleBlocks[0].id;
    useDashboardStore.getState().removeBlock(blockId);
    expect(useDashboardStore.getState().visibleBlocks).toHaveLength(0);
  });

  it('toggles block visibility', () => {
    useDashboardStore.getState().addBlock('system-status');
    const blockId = useDashboardStore.getState().visibleBlocks[0].id;
    useDashboardStore.getState().toggleBlockVisibility(blockId);
    expect(useDashboardStore.getState().visibleBlocks[0].visible).toBe(false);
    useDashboardStore.getState().toggleBlockVisibility(blockId);
    expect(useDashboardStore.getState().visibleBlocks[0].visible).toBe(true);
  });

  it('reorders blocks', () => {
    useDashboardStore.getState().addBlock('system-status');
    useDashboardStore.getState().addBlock('active-projects');
    const blocks = useDashboardStore.getState().visibleBlocks;
    const [first, second] = [blocks[0].id, blocks[1].id];

    useDashboardStore.getState().reorderBlocks([second, first]);
    const reordered = useDashboardStore.getState().visibleBlocks;
    expect(reordered[0].id).toBe(second);
    expect(reordered[0].order).toBe(0);
    expect(reordered[1].id).toBe(first);
    expect(reordered[1].order).toBe(1);
  });

  it('resets layout', () => {
    useDashboardStore.getState().addBlock('system-status');
    useDashboardStore.getState().addBlock('active-projects');
    useDashboardStore.getState().resetLayout();
    expect(useDashboardStore.getState().visibleBlocks).toHaveLength(0);
  });
});

describe('themeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ mode: 'system', animationsEnabled: true });
  });

  it('sets theme mode', () => {
    useThemeStore.getState().setMode('dark');
    expect(useThemeStore.getState().mode).toBe('dark');
  });

  it('toggles through modes: light → dark → system → light', () => {
    useThemeStore.getState().setMode('light');
    useThemeStore.getState().toggleMode();
    expect(useThemeStore.getState().mode).toBe('dark');
    useThemeStore.getState().toggleMode();
    expect(useThemeStore.getState().mode).toBe('system');
    useThemeStore.getState().toggleMode();
    expect(useThemeStore.getState().mode).toBe('light');
  });

  it('toggles animations', () => {
    expect(useThemeStore.getState().animationsEnabled).toBe(true);
    useThemeStore.getState().toggleAnimations();
    expect(useThemeStore.getState().animationsEnabled).toBe(false);
  });
});
