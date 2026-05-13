import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const projects = await base44.entities.Project.list();
      return projects.find(p => p.id === id);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate('/projects')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Button>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Project not found</p>
        </Card>
      </div>
    );
  }

  const statusColors = {
    planning: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    on_hold: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate('/projects')} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Button>

      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">{project.name}</h1>
            <p className="text-muted-foreground mt-2">{project.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <Badge className={statusColors[project.status]}>
              {project.status}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Priority</p>
            <Badge className={priorityColors[project.priority]}>
              {project.priority}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Start Date</p>
            <p className="text-sm font-medium">{project.start_date || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">End Date</p>
            <p className="text-sm font-medium">{project.end_date || '—'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="font-semibold mb-2">Budget</h3>
            <p className="text-lg font-heading">${project.budget || '0'}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Progress</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${project.progress_percent || 0}%` }}
                />
              </div>
              <span className="text-sm font-medium">{project.progress_percent || 0}%</span>
            </div>
          </div>
        </div>

        {project.lessons_learned && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-semibold mb-2">Lessons Learned</h3>
            <p className="text-sm text-muted-foreground">{project.lessons_learned}</p>
          </div>
        )}

        {project.team_members && project.team_members.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-semibold mb-2">Team Members</h3>
            <div className="flex flex-wrap gap-2">
              {project.team_members.map((member, idx) => (
                <Badge key={idx} variant="outline">{member}</Badge>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}