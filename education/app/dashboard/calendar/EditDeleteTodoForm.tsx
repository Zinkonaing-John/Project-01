"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";

interface EditDeleteTodoFormProps {
  todoId: string;
  onClose: () => void;
  onTodoUpdated: () => void;
  onTodoDeleted: () => void;
}

interface Class {
  id: string;
  name: string;
}

interface Todo {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: string;
  class_id: string | null;
}

export default function EditDeleteTodoForm({
  todoId,
  onClose,
  onTodoUpdated,
  onTodoDeleted,
}: EditDeleteTodoFormProps) {
  const [todo, setTodo] = useState<Todo | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [status, setStatus] = useState("normal");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    dueDate?: string;
    selectedClass?: string;
  }>({});

  useEffect(() => {
    const fetchTodoAndClasses = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch todo details
        const { data: todoData, error: todoError } = await supabase
          .from("todos")
          .select("id, title, description, due_date, status, class_id")
          .eq("id", todoId)
          .single();

        if (todoError) {
          throw todoError;
        }
        setTodo(todoData);
        setTitle(todoData.title);
        setDescription(todoData.description || "");
        setDueDate(todoData.due_date.split("T")[0]);
        setDueTime(todoData.due_date.split("T")[1]?.substring(0, 5) || "");
        setStatus(todoData.status);
        setSelectedClass(todoData.class_id);

        // Fetch classes
        const { data: classesData, error: classesError } = await supabase
          .from("classes")
          .select("id, name");

        if (classesError) {
          throw classesError;
        }
        setClasses(classesData);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchTodoAndClasses();
  }, [todoId]);

  const validateForm = () => {
    const errors: typeof validationErrors = {};
    if (!title.trim()) {
      errors.title = "Title is required.";
    }
    if (!dueDate) {
      errors.dueDate = "Due Date is required.";
    }
    if (!selectedClass) {
      errors.selectedClass = "Class is required.";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const combinedDateTime = dueDate && dueTime ? `${dueDate}T${dueTime}:00` : null;

      const { error: updateError } = await supabase
        .from("todos")
        .update({
          title,
          description,
          due_date: combinedDateTime,
          status,
          class_id: selectedClass,
        })
        .eq("id", todoId);

      if (updateError) {
        throw updateError;
      }

      onTodoUpdated();
      onClose();
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err.message || "An unexpected error occurred during update.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this To Do?")) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("todos")
        .delete()
        .eq("id", todoId);

      if (deleteError) {
        throw deleteError;
      }

      onTodoDeleted();
      onClose();
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.message || "An unexpected error occurred during delete.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
          Loading To Do details...
        </div>
      </div>
    );
  }

  if (error && !todo) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center text-red-500">
          {error}
          <Button onClick={onClose} className="mt-4">Close</Button>
        </div>
      </div>
    );
  }

  if (!todo) {
    return null; // Should not happen if error is handled
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit/Delete To Do</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setValidationErrors((prev) => ({ ...prev, title: undefined }));
              }}
              required
              className={validationErrors.title ? "border-red-500" : ""}
            />
            {validationErrors.title && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.title}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="class">Class</Label>
            <Select
              value={selectedClass || ""}
              onValueChange={(value) => {
                setSelectedClass(value);
                setValidationErrors((prev) => ({ ...prev, selectedClass: undefined }));
              }}
            >
              <SelectTrigger id="class">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder">Select a class</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.selectedClass && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.selectedClass}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                setValidationErrors((prev) => ({ ...prev, dueDate: undefined }));
              }}
              required
              className={validationErrors.dueDate ? "border-red-500" : ""}
            />
            {validationErrors.dueDate && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.dueDate}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="dueTime">Due Time</Label>
            <Input
              id="dueTime"
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal" className="text-blue-600">Normal</SelectItem>
                <SelectItem value="important" className="text-red-600">Important</SelectItem>
                <SelectItem value="urgent" className="text-orange-600">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-2 mt-6">
            <Button type="button" onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Updating..." : "Update To Do"}
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              variant="destructive"
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete To Do"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}