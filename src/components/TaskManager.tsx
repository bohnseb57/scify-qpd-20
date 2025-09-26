import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, User, Calendar, AlertTriangle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  assignedUser: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

interface TaskManagerProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  teamMembers: TeamMember[];
  readOnly?: boolean;
}

export function TaskManager({ tasks, onTasksChange, teamMembers, readOnly = false }: TaskManagerProps) {
  const addTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: '',
      description: '',
      assignedUser: '',
      dueDate: '',
      priority: 'medium',
      status: 'pending'
    };
    onTasksChange([...tasks, newTask]);
  };

  const removeTask = (taskId: string) => {
    onTasksChange(tasks.filter(task => task.id !== taskId));
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    onTasksChange(tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'medium': return 'text-warning bg-warning/10 border-warning/20';
      case 'low': return 'text-success bg-success/10 border-success/20';
      default: return 'text-muted-foreground bg-muted/10 border-muted/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success bg-success/10 border-success/20';
      case 'in_progress': return 'text-sl-blue-700 bg-sl-blue-50 border-sl-blue-200';
      case 'pending': return 'text-warning bg-warning/10 border-warning/20';
      default: return 'text-muted-foreground bg-muted/10 border-muted/20';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Task Management</h3>
        {!readOnly && (
          <Button onClick={addTask} variant="outline" size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        )}
      </div>

      {tasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tasks assigned yet</p>
            {!readOnly && (
              <Button onClick={addTask} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add First Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <Card key={task.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Task {index + 1}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    {readOnly && (
                      <Badge variant="outline" className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    )}
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTask(task.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`task-title-${task.id}`}>Task Title</Label>
                    <Input
                      id={`task-title-${task.id}`}
                      value={task.title}
                      onChange={(e) => updateTask(task.id, { title: e.target.value })}
                      placeholder="Enter task title"
                      readOnly={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`task-assigned-${task.id}`}>Assigned To</Label>
                    {readOnly ? (
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{teamMembers.find(m => m.id === task.assignedUser)?.name || 'Unassigned'}</span>
                      </div>
                    ) : (
                      <Select 
                        value={task.assignedUser} 
                        onValueChange={(value) => updateTask(task.id, { assignedUser: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              <div>
                                <div className="font-medium">{member.name}</div>
                                <div className="text-sm text-muted-foreground">{member.role}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor={`task-description-${task.id}`}>Description</Label>
                  <Textarea
                    id={`task-description-${task.id}`}
                    value={task.description}
                    onChange={(e) => updateTask(task.id, { description: e.target.value })}
                    placeholder="Describe the task details"
                    readOnly={readOnly}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`task-priority-${task.id}`}>Priority</Label>
                    {readOnly ? (
                      <div className="flex items-center gap-2 mt-1">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{task.priority}</span>
                      </div>
                    ) : (
                      <Select 
                        value={task.priority} 
                        onValueChange={(value: 'high' | 'medium' | 'low') => updateTask(task.id, { priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="low">Low Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div>
                    <Label htmlFor={`task-due-${task.id}`}>Due Date</Label>
                    {readOnly ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                      </div>
                    ) : (
                      <Input
                        id={`task-due-${task.id}`}
                        type="date"
                        value={task.dueDate}
                        onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}