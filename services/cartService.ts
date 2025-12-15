
import { SavedProject, BeadColor, MaterialItem } from '../types';

export const calculateTotalMaterials = (projects: SavedProject[], excludeWhite: boolean = true): MaterialItem[] => {
  const summary: Record<string, MaterialItem> = {};

  projects.forEach(project => {
    if (!project.grid) return;

    project.grid.forEach(row => {
      row.forEach(bead => {
        if (!bead) return;

        // "White" filter logic - consistent with StatsPanel
        const isWhite = bead.name.toLowerCase().includes('white') || bead.id === 'P02' || bead.id === 'H01';
        if (excludeWhite && isWhite) return;

        // Use ID as key. If brand differs but ID is same, we treat as same for simple agg.
        // Ideally should key by Brand+ID.
        const key = `${bead.brand || 'Generic'}-${bead.id}`;
        
        if (!summary[key]) {
          summary[key] = {
            color: bead,
            count: 0
          };
        }
        summary[key].count++;
      });
    });
  });

  return Object.values(summary).sort((a, b) => b.count - a.count);
};
