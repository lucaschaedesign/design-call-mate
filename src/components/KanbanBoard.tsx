
import { useKanban, Task } from '@/hooks/useKanban';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { TaskCard } from './TaskCard';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'sonner';

export function KanbanBoard() {
  const { 
    statuses, 
    tasks, 
    loading,
    updateTaskStatus,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks
  } = useKanban();

  const getTasksByStatus = (statusId: string) => {
    return tasks.filter(task => task.status_id === statusId);
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatusId = result.destination.droppableId;
    
    try {
      await updateTaskStatus(taskId, newStatusId);
      await refreshTasks(); // Refresh the tasks after successful update
      toast.success('Task moved successfully');
    } catch (error) {
      console.error('Error moving task:', error);
      toast.error('Failed to move task');
      await refreshTasks(); // Refresh to ensure UI is in sync with backend
    }
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

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statuses.map((status) => (
            <Droppable key={status.id} droppableId={status.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-4"
                >
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
                    {getTasksByStatus(status.id).map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TaskCard
                              task={task}
                              onUpdate={updateTask}
                              onDelete={deleteTask}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
