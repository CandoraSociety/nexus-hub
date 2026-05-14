import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ProgramForm from '@/components/programs/ProgramForm';
import AddProgramModal from '@/components/programs/AddProgramModal';
import { Link } from 'react-router-dom';

export default function Programs() {
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [programMode, setProgramMode] = useState('existing');
  const [editingProgram, setEditingProgram] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => base44.entities.Program.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Program.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => base44.entities.Program.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      setShowForm(false);
      setEditingProgram(null);
    },
  });

  const handleModeChoice = (mode) => {
    setProgramMode(mode);
    setShowModal(false);
    setShowForm(true);
  };

  const filtered = programs.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categoryColors = {
    adult_learning: 'bg-blue-100 text-blue-800',
    community_services: 'bg-green-100 text-green-800',
    youth_programs: 'bg-purple-100 text-purple-800',
    health_wellness: 'bg-red-100 text-red-800',
    other: 'bg-gray-100 text-gray-800',
  };

  const statusColors = {
    planning: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    paused: 'bg-orange-100 text-orange-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading font-bold">Programs</h1>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add / Design Program
        </Button>
      </div>

      {/* Modal */}
      {showModal && (
        <AddProgramModal
          onChoice={handleModeChoice}
          onCancel={() => setShowModal(false)}
        />
      )}

      {/* Form */}
      {showForm && (
        <ProgramForm
          program={editingProgram}
          mode={programMode}
          onSubmit={(data) => {
            if (editingProgram) {
              updateMutation.mutate({ id: editingProgram.id, ...data });
            } else {
              createMutation.mutate(data);
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingProgram(null);
          }}
        />
      )}

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(program => (
          <Link key={program.id} to={`/programs/${program.id}`}>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-heading font-bold flex-1">{program.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{program.description}</p>
              <div className="flex gap-2 flex-wrap mb-4">
                {program.category && (
                  <Badge className={categoryColors[program.category]}>
                    {program.category.replace(/_/g, ' ')}
                  </Badge>
                )}
                <Badge className={statusColors[program.status || 'planning']}>
                  {program.status}
                </Badge>
              </div>
              {program.participants && (
                <p className="text-xs text-muted-foreground">{program.participants.length} participants</p>
              )}
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No programs found. Create one to get started!</p>
        </Card>
      )}
    </div>
  );
}