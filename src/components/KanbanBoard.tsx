
import { useKanban, Task, KanbanStatus } from '@/hooks/useKanban';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { TaskCard } from './TaskCard';
import { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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

  const [transcription, setTranscription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const getTasksByStatus = (statusId: string) => {
    return tasks.filter(task => task.status_id === statusId);
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatusId = result.destination.droppableId;
    
    await updateTaskStatus(taskId, newStatusId);
  };

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transcription,
          deadline 
        }),
      });

      const data = await response.json();
      
      // Create tasks from the generated data
      for (const taskData of data.tasks) {
        await createTask({
          title: taskData.title,
          description: taskData.description,
          status_id: statuses[0].id, // Put in first column (To Do)
          due_date: deadline || null,
          assignee: null,
          date_completed: null
        });
      }

      // Clear the form
      setTranscription('');
      setDeadline('');
    } catch (error) {
      console.error('Error generating tasks:', error);
    } finally {
      setIsGenerating(false);
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Task Generation Panel */}
        <div className="lg:col-span-2">
          <Card className="p-6 space-y-4">
            <h2 className="font-semibold">Generate Tasks</h2>
            <Textarea
              placeholder="Paste your transcription here..."
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              className="min-h-[200px]"
            />
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="Optional deadline"
            />
            <Button 
              onClick={handleGenerateTasks}
              disabled={!transcription || isGenerating}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate Tasks'}
            </Button>
          </Card>
        </div>

        {/* Kanban Board */}
        <div className="lg:col-span-3">
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
      </div>
    </div>
  );
}
