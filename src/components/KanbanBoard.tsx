
import { useKanban, Task, KanbanStatus } from '@/hooks/useKanban';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { TaskCard } from './TaskCard';

export function KanbanBoard() {
  const { 
    statuses, 
    tasks, 
    loading,
    updateTaskStatus,
    createTask,
    updateTask,
    deleteTask
  } = useKanban();

  const getTasksByStatus = (statusId: string) => {
    return tasks.filter(task => task.status_id === statusId);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🏦 DesignBank
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statuses.map((status) => (
          <div key={status.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{status.name}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  createTask({
                    title: 'New Task',
                    description: '',
                    status_id: status.id,
                    assignee: null,
                    due_date: null,
                    date_completed: null
                  });
                }}
              >
                Add Task
              </Button>
            </div>
            <div className="space-y-3">
              {getTasksByStatus(status.id).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
