
import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { Task } from '@/hooks/useKanban';

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);

  const handleSave = async () => {
    await onUpdate(task.id, editedTask);
    setIsEditing(false);
  };

  const getStatusBadge = (statusId: string | null) => {
    switch (statusId) {
      case '1': // Not Started
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            ⏳ Not Started
          </Badge>
        );
      case '2': // In Progress
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            🔄 In Progress
          </Badge>
        );
      case '3': // Done
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            ✅ Done
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isEditing) {
    return (
      <Card className="p-4 space-y-4 shadow-lg border border-gray-100">
        <Input
          value={editedTask.title}
          onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
          placeholder="Task title"
          className="text-lg font-medium border-gray-200"
        />
        <Textarea
          value={editedTask.description || ''}
          onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
          placeholder="Description"
          className="text-gray-600 resize-none border-gray-200 min-h-[100px]"
        />
        <Input
          type="text"
          value={editedTask.assignee || ''}
          onChange={(e) => setEditedTask({ ...editedTask, assignee: e.target.value })}
          placeholder="Assignee"
          className="border-gray-200"
        />
        <Input
          type="date"
          value={editedTask.due_date || ''}
          onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
          className="border-gray-200"
        />
        <div className="flex gap-2">
          <Button onClick={handleSave}>Save</Button>
          <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300">
      <div className="p-5 space-y-4">
        <div className="space-y-1.5">
          {getStatusBadge(task.status_id)}
          <h3 className="text-lg font-semibold text-gray-900 mt-2">{task.title}</h3>
          {task.description && (
            <div className="space-y-1">
              {task.description.split('\n').map((line, i) => (
                <p key={i} className="text-sm leading-relaxed text-gray-600">{line}</p>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-2 mt-4 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            {task.assignee && (
              <span className="inline-flex items-center text-sm text-gray-600">
                👤 {task.assignee}
              </span>
            )}
            {task.due_date && (
              <span className="inline-flex items-center text-sm text-gray-600">
                📅 {format(new Date(task.due_date), 'MMM dd')}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsEditing(true)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              Edit
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDelete(task.id)}
              className="text-gray-600 hover:text-red-600 hover:bg-red-50"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
