import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Plus, X, GripVertical, User, Calendar } from 'lucide-react';

const TASK_STATUSES = ['todo', 'in_progress', 'review', 'done'];

const statusConfig = {
  todo: { label: 'To Do', color: 'bg-slate-100 text-slate-700', header: 'bg-slate-50 border-slate-200' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', header: 'bg-blue-50 border-blue-200' },
  review: { label: 'Review', color: 'bg-yellow-100 text-yellow-700', header: 'bg-yellow-50 border-yellow-200' },
  done: { label: 'Done', color: 'bg-green-100 text-green-700', header: 'bg-green-50 border-green-200' },
};

const priorityColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

// PROJECT-LEVEL KANBAN (no tasks, just projects grouped by status)
const PROJECT_STATUSES = ['planning', 'in_progress', 'on_hold', 'completed'];
const projectStatusConfig = {
  planning: { label: 'Planning', header: 'bg-blue-50 border-blue-200' },
  in_progress: { label: 'In Progress', header: 'bg-purple-50 border-purple-200' },
  on_hold: { label: 'On Hold', header: 'bg-orange-50 border-orange-200' },
  completed: { label: 'Completed', header: 'bg-green-50 border-green-200' },
};
const projectPriorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

function ProjectCard({ project, index }) {
  return (
    <Draggable draggableId={project.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`mb-2 transition-shadow ${snapshot.isDragging ? 'rotate-1 shadow-xl' : ''}`}
        >
          <Card className="p-3 hover:shadow-md cursor-pointer group">
            <div className="flex items-start gap-1">
              <div {...provided.dragHandleProps} className="mt-0.5 opacity-0 group-hover:opacity-40 transition-opacity cursor-grab">
                <GripVertical className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/projects/${project.id}`} onClick={e => e.stopPropagation()}>
                  <h4 className="font-medium text-sm leading-tight hover:text-primary truncate">{project.name}</h4>
                </Link>
                {project.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.priority && (
                    <Badge className={`${projectPriorityColors[project.priority]} text-xs`}>{project.priority}</Badge>
                  )}
                </div>
                {project.progress_percent !== undefined && project.progress_percent > 0 && (
                  <div className="mt-2">
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${project.progress_percent}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{project.progress_percent}%</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </Draggable>
  );
}

function TaskCard({ task, index }) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`mb-2 transition-shadow ${snapshot.isDragging ? 'rotate-1 shadow-xl' : ''}`}
        >
          <Card className="p-3 hover:shadow-md group">
            <div className="flex items-start gap-1">
              <div {...provided.dragHandleProps} className="mt-0.5 opacity-0 group-hover:opacity-40 transition-opacity cursor-grab">
                <GripVertical className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm leading-tight">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {task.priority && (
                    <Badge className={`${priorityColors[task.priority]} text-xs`}>{task.priority}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {task.assigned_to && (
                    <span className="flex items-center gap-1 truncate">
                      <User className="w-3 h-3 shrink-0" />
                      <span className="truncate">{task.assigned_to.split('@')[0]}</span>
                    </span>
                  )}
                  {task.due_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 shrink-0" />
                      {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Draggable>
  );
}

// ── TASK KANBAN (inside a single project) ──
export function TaskKanban({ projectId }) {
  const queryClient = useQueryClient();
  const [addingTo, setAddingTo] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => base44.entities.ProjectTask.filter({ project_id: projectId }),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProjectTask.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });

  const createTask = useMutation({
    mutationFn: (data) => base44.entities.ProjectTask.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setNewTaskTitle('');
      setAddingTo(null);
    },
  });

  const grouped = TASK_STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s);
    return acc;
  }, {});

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    updateTask.mutate({ id: draggableId, data: { status: destination.droppableId } });
  };

  const handleAddTask = (status) => {
    if (!newTaskTitle.trim()) return;
    createTask.mutate({ project_id: projectId, title: newTaskTitle.trim(), status });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TASK_STATUSES.map(status => {
          const cfg = statusConfig[status];
          return (
            <div key={status} className={`rounded-xl border ${cfg.header} p-3 flex flex-col`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{cfg.label}</span>
                  <Badge className={`${cfg.color} text-xs`}>{grouped[status].length}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6"
                  onClick={() => { setAddingTo(status); setNewTaskTitle(''); }}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 min-h-[80px] rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                  >
                    {grouped[status].map((task, i) => (
                      <TaskCard key={task.id} task={task} index={i} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {addingTo === status && (
                <div className="mt-2 space-y-1">
                  <Input
                    autoFocus
                    placeholder="Task title..."
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddTask(status);
                      if (e.key === 'Escape') setAddingTo(null);
                    }}
                    className="text-sm h-8"
                  />
                  <div className="flex gap-1">
                    <Button size="sm" className="h-7 text-xs flex-1" onClick={() => handleAddTask(status)}>Add</Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setAddingTo(null)}><X className="w-3 h-3" /></Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}

// ── PROJECT KANBAN (projects page, drag to change project status) ──
export default function ProjectKanban({ projects, onUpdateProject }) {
  const grouped = PROJECT_STATUSES.reduce((acc, s) => {
    acc[s] = projects.filter(p => p.status === s);
    return acc;
  }, {});

  const onDragEnd = (result) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const newStatus = destination.droppableId;
    const project = projects.find(p => p.id === draggableId);
    if (!project || project.status === newStatus) return;
    onUpdateProject && onUpdateProject(draggableId, { status: newStatus });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PROJECT_STATUSES.map(status => {
          const cfg = projectStatusConfig[status];
          return (
            <div key={status} className={`rounded-xl border ${cfg.header} p-3 flex flex-col`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-semibold text-sm">{cfg.label}</span>
                <Badge variant="outline" className="text-xs">{grouped[status].length}</Badge>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 min-h-[80px] rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                  >
                    {grouped[status].map((project, i) => (
                      <ProjectCard key={project.id} project={project} index={i} />
                    ))}
                    {provided.placeholder}
                    {grouped[status].length === 0 && !snapshot.isDraggingOver && (
                      <div className="h-16 border-2 border-dashed border-border/50 rounded-lg flex items-center justify-center">
                        <p className="text-xs text-muted-foreground">Drop here</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}