import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskList from '@/components/projects/TaskList';
import ProjectCharterTab from '@/components/projects/ProjectCharterTab';
import ProjectScopeTab from '@/components/projects/ProjectScopeTab';
import ProjectObjectivesTab from '@/components/projects/ProjectObjectivesTab';
import ProjectMilestonesTab from '@/components/projects/ProjectMilestonesTab';
import ProjectDocumentsTab from '@/components/projects/ProjectDocumentsTab';
import { useComplexityLevel } from '@/hooks/useComplexityLevel';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { level } = useComplexityLevel();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const projects = await base44.entities.Project.list();
      return projects.find(p => p.id === id);
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      return await base44.entities.ProjectTask.filter({ project_id: id });
    },
  });

  const { data: objectives = [] } = useQuery({
    queryKey: ['objectives', id],
    queryFn: async () => {
      return await base44.entities.ProjectObjective.filter({ project_id: id });
    },
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones', id],
    queryFn: async () => {
      return await base44.entities.ProjectMilestone.filter({ project_id: id });
    },
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', id],
    queryFn: async () => {
      return await base44.entities.ProjectDocument.filter({ project_id: id });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (taskData) => base44.entities.ProjectTask.create({ ...taskData, project_id: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => base44.entities.ProjectTask.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => base44.entities.ProjectTask.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
    },
  });

  const createObjectiveMutation = useMutation({
    mutationFn: (data) => base44.entities.ProjectObjective.create({ ...data, project_id: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives', id] });
    },
  });

  const updateObjectiveMutation = useMutation({
    mutationFn: (obj) => base44.entities.ProjectObjective.update(obj.id, obj),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives', id] });
    },
  });

  const deleteObjectiveMutation = useMutation({
    mutationFn: (objId) => base44.entities.ProjectObjective.delete(objId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives', id] });
    },
  });

  const createMilestoneMutation = useMutation({
    mutationFn: (data) => base44.entities.ProjectMilestone.create({ ...data, project_id: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', id] });
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: (m) => base44.entities.ProjectMilestone.update(m.id, m),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', id] });
    },
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: (mId) => base44.entities.ProjectMilestone.delete(mId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', id] });
    },
  });

  const createDocumentMutation = useMutation({
    mutationFn: (data) => base44.entities.ProjectDocument.create({ ...data, project_id: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (docId) => base44.entities.ProjectDocument.delete(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] });
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

      {/* Complexity Toggle & Tabs */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-heading font-bold">Project Management</h2>
          <div className="text-xs text-muted-foreground">
            Viewing as: <span className="font-medium capitalize">{level}</span>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="charter">Charter</TabsTrigger>
            <TabsTrigger value="scope">Scope</TabsTrigger>
            <TabsTrigger value="objectives">Objectives</TabsTrigger>
            <TabsTrigger value="milestones">Timeline</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            {level !== 'simple' && <TabsTrigger value="documents">Documents</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Progress</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${project.progress_percent || 0}%` }}
                      />
                    </div>
                    <span className="font-medium">{project.progress_percent || 0}%</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Quick Stats</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tasks</p>
                      <p className="text-2xl font-bold">{tasks.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Objectives</p>
                      <p className="text-2xl font-bold">{objectives.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Milestones</p>
                      <p className="text-2xl font-bold">{milestones.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="charter" className="mt-6">
            <ProjectCharterTab
              project={project}
              onUpdate={(data) => updateProjectMutation.mutate(data)}
            />
          </TabsContent>

          <TabsContent value="scope" className="mt-6">
            <ProjectScopeTab
              project={project}
              onUpdate={(data) => updateProjectMutation.mutate(data)}
            />
          </TabsContent>

          <TabsContent value="objectives" className="mt-6">
            <ProjectObjectivesTab
              objectives={objectives}
              onCreateObjective={(data) => createObjectiveMutation.mutate(data)}
              onUpdateObjective={(obj) => updateObjectiveMutation.mutate(obj)}
              onDeleteObjective={(objId) => deleteObjectiveMutation.mutate(objId)}
            />
          </TabsContent>

          <TabsContent value="milestones" className="mt-6">
            <ProjectMilestonesTab
              milestones={milestones}
              onCreateMilestone={(data) => createMilestoneMutation.mutate(data)}
              onUpdateMilestone={(m) => updateMilestoneMutation.mutate(m)}
              onDeleteMilestone={(mId) => deleteMilestoneMutation.mutate(mId)}
              complexity={level}
            />
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <TaskList
              tasks={tasks}
              onCreateTask={(data) => createTaskMutation.mutate(data)}
              onUpdateTask={(task) => updateTaskMutation.mutate({ taskId: task.id, data: task })}
              onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
            />
          </TabsContent>

          {level !== 'simple' && (
            <TabsContent value="documents" className="mt-6">
              <ProjectDocumentsTab
                documents={documents}
                onCreateDocument={(data) => createDocumentMutation.mutate(data)}
                onDeleteDocument={(docId) => deleteDocumentMutation.mutate(docId)}
                cloudFolderId={project.cloud_folder_id}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}