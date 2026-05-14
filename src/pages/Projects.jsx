import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, TrendingUp, LayoutGrid, LayoutList } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectForm from '@/components/projects/ProjectForm';
import ProjectKanban from '@/components/projects/ProjectKanban';
import { Link } from 'react-router-dom';
import { useComplexityLevel, COMPLEXITY_LEVELS } from '@/hooks/useComplexityLevel';

export default function Projects() {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const { level, updateLevel } = useComplexityLevel();
  const queryClient = useQueryClient();

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowForm(false);
      setEditingProject(null);
    },
  });

  const filtered = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-heading font-bold">Projects</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>
      </div>

      {/* Complexity & View Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded-lg border border-border">
        <div className="flex gap-2">
          <span className="text-sm font-medium text-muted-foreground">Complexity:</span>
          <div className="flex gap-1">
            {Object.values(COMPLEXITY_LEVELS).map(lvl => (
              <Button
                key={lvl}
                variant={level === lvl ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateLevel(lvl)}
                className="capitalize"
              >
                {lvl}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex gap-1 border border-border rounded-md p-1">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
            className="w-9 h-9"
            title="List view"
          >
            <LayoutList className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('kanban')}
            className="w-9 h-9"
            title="Kanban view"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <ProjectForm
          project={editingProject}
          onSubmit={(data) => {
            if (editingProject) {
              updateMutation.mutate({ id: editingProject.id, ...data });
            } else {
              createMutation.mutate(data);
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
        />
      )}

      {/* Search & Filter */}
      <div className="flex gap-3 flex-col md:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map(project => (
                <Link key={project.id} to={`/projects/${project.id}`}>
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-heading font-bold flex-1">{project.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium">Progress</span>
                        <span className="text-xs text-muted-foreground">{project.progress_percent || 0}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${project.progress_percent || 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Badge className={statusColors[project.status || 'planning']}>
                        {project.status}
                      </Badge>
                      {project.priority && (
                        <Badge className={priorityColors[project.priority]}>
                          {project.priority}
                        </Badge>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No projects found. Create one to get started!</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <>
          <ProjectKanban
            projects={filtered}
            onUpdateProject={(id, data) => updateMutation.mutate({ id, ...data })}
          />
          {filtered.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No projects found. Create one to get started!</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}