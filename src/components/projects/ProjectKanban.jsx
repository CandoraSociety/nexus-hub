import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const statuses = ['planning', 'in_progress', 'on_hold', 'completed'];

const statusLabels = {
  planning: 'Planning',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Completed',
};

const statusColors = {
  planning: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  on_hold: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
};

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export default function ProjectKanban({ projects }) {
  const groupedByStatus = statuses.reduce((acc, status) => {
    acc[status] = projects.filter(p => p.status === status);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statuses.map(status => (
        <div key={status} className="flex flex-col">
          <h3 className="font-semibold text-sm mb-4 text-muted-foreground uppercase">
            {statusLabels[status]}
          </h3>
          <div className="space-y-3 flex-1">
            {groupedByStatus[status].map(project => (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <h4 className="font-medium text-sm mb-2 line-clamp-2">{project.name}</h4>
                  <div className="space-y-2">
                    {project.priority && (
                      <Badge className={`${priorityColors[project.priority]} text-xs`}>
                        {project.priority}
                      </Badge>
                    )}
                    {project.start_date && (
                      <p className="text-xs text-muted-foreground">
                        Start: {new Date(project.start_date).toLocaleDateString()}
                      </p>
                    )}
                    {project.progress_percent !== undefined && (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">Progress</span>
                          <span className="text-xs font-medium">{project.progress_percent}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${project.progress_percent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
            {groupedByStatus[status].length === 0 && (
              <div className="h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                <p className="text-xs text-muted-foreground">No projects</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}