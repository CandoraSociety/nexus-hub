import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Briefcase, Zap, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => base44.entities.Program.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list(),
  });

  const activeProjects = projects.filter(p => p.status !== 'archived').length;
  const upcomingEvents = events.filter(e => new Date(e.start_date) > new Date()).length;

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{label}</p>
          <p className="text-3xl font-heading font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-heading font-bold mb-2">Welcome Back</h1>
        <p className="text-muted-foreground">Manage your programs, projects, and events in one place</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={Briefcase}
          label="Active Programs"
          value={programs.length}
          color="bg-primary/10"
        />
        <StatCard
          icon={Zap}
          label="Active Projects"
          value={activeProjects}
          color="bg-secondary/10"
        />
        <StatCard
          icon={Calendar}
          label="Upcoming Events"
          value={upcomingEvents}
          color="bg-accent/10"
        />
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/programs">
          <Button className="w-full h-24 text-lg hover:shadow-lg transition-all" variant="outline">
            <div className="flex flex-col items-center gap-2">
              <Briefcase className="w-6 h-6" />
              <span>Programs</span>
            </div>
          </Button>
        </Link>
        <Link to="/projects">
          <Button className="w-full h-24 text-lg hover:shadow-lg transition-all" variant="outline">
            <div className="flex flex-col items-center gap-2">
              <Zap className="w-6 h-6" />
              <span>Projects</span>
            </div>
          </Button>
        </Link>
        <Link to="/events">
          <Button className="w-full h-24 text-lg hover:shadow-lg transition-all" variant="outline">
            <div className="flex flex-col items-center gap-2">
              <Calendar className="w-6 h-6" />
              <span>Events</span>
            </div>
          </Button>
        </Link>
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card className="p-6">
          <h3 className="text-lg font-heading font-bold mb-4">Recent Projects</h3>
          <div className="space-y-3">
            {projects.slice(0, 3).map(project => (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <div className="p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <p className="font-medium text-sm">{project.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${project.progress_percent || 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{project.progress_percent || 0}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card className="p-6">
          <h3 className="text-lg font-heading font-bold mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {events
              .filter(e => new Date(e.start_date) > new Date())
              .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
              .slice(0, 3)
              .map(event => (
                <Link key={event.id} to={`/events/${event.id}`}>
                  <div className="p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                    <p className="font-medium text-sm">{event.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.start_date).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}