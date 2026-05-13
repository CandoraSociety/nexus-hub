import { useState, useEffect } from 'react';

export const COMPLEXITY_LEVELS = {
  SIMPLE: 'simple',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
};

export function useComplexityLevel() {
  const [level, setLevel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('projectComplexity') || COMPLEXITY_LEVELS.SIMPLE;
    }
    return COMPLEXITY_LEVELS.SIMPLE;
  });

  const updateLevel = (newLevel) => {
    setLevel(newLevel);
    localStorage.setItem('projectComplexity', newLevel);
  };

  return { level, updateLevel };
}

// Helper to determine which fields to show
export function getVisibleFields(level) {
  const fields = {
    name: true,
    description: true,
    status: true,
    start_date: true,
    end_date: true,
    budget: true,
  };

  if (level === COMPLEXITY_LEVELS.INTERMEDIATE || level === COMPLEXITY_LEVELS.ADVANCED) {
    fields.project_type = true;
    fields.priority = true;
    fields.progress_percent = true;
    fields.team_members = true;
  }

  if (level === COMPLEXITY_LEVELS.ADVANCED) {
    fields.lessons_learned = true;
    fields.linked_program_id = true;
  }

  return fields;
}