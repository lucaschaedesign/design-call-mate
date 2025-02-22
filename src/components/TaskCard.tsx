
import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
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

  if (isEditing) {
    return (
      <Card className="p-4 space-y-4">
        <Input
          value={editedTask.title}
          onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
          placeholder="Task title"
          className="text-base font-medium"
        />
        <Textarea
          value={editedTask.description || ''}
          onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
          placeholder="Description"
          className="text-sm text-gray-600 resize-none"
        />
        <Input
          type="text"
          value={editedTask.assignee || ''}
          onChange={(e) => setEditedTask({ ...editedTask, assignee: e.target.value })}
          placeholder="Assignee"
        />
        <Input
          type="date"
          value={editedTask.due_date || ''}
          onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
        />
        <div className="flex gap-2">
          <Button onClick={handleSave}>Save</Button>
          <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-4 space-y-2">
        <h3 className="text-base font-medium text-gray-900">{task.title}</h3>
        {task.description && (
          <div className="space-y-1">
            {task.description.split('\n').map((line, i) => (
              <p key={i} className="text-sm text-gray-600">{line}</p>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-wrap gap-2 text-sm text-gray-500">
            {task.assignee && <div>👤 {task.assignee}</div>}
            {task.due_date && (
              <div>📅 {format(new Date(task.due_date), 'MMM dd')}</div>
            )}
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsEditing(true)}
              className="h-8 px-2 text-gray-500 hover:text-gray-700"
            >
              Edit
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDelete(task.id)}
              className="h-8 px-2 text-gray-500 hover:text-red-600"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
