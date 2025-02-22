
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface KanbanStatus {
  id: string;
  name: string;
  position: number;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status_id: string | null;
  assignee: string | null;
  due_date: string | null;
  date_completed: string | null;
}

export function useKanban() {
  const [statuses, setStatuses] = useState<KanbanStatus[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*');

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data);
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    const { data, error } = await supabase
      .from('kanban_statuses')
      .select('*')
      .order('position');

    if (error) {
      console.error('Error fetching statuses:', error);
    } else {
      setStatuses(data);
    }
  };

  useEffect(() => {
    fetchStatuses();
    fetchTasks();

    // Set up real-time subscriptions
    const statusChannel = supabase
      .channel('kanban-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kanban_statuses' }, 
        () => fetchStatuses())
      .subscribe();

    const taskChannel = supabase
      .channel('task-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, 
        () => fetchTasks())
      .subscribe();

    return () => {
      supabase.removeChannel(statusChannel);
      supabase.removeChannel(taskChannel);
    };
  }, []);

  const updateTaskStatus = async (taskId: string, newStatusId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status_id: newStatusId })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task status:', error);
    }
  };

  const createTask = async (task: Omit<Task, 'id'>) => {
    const { error } = await supabase
      .from('tasks')
      .insert([task]);

    if (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
    }
  };

  return {
    statuses,
    tasks,
    loading,
    updateTaskStatus,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks: fetchTasks
  };
}
