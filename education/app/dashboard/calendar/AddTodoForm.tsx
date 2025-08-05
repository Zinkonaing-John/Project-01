"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";

interface AddTodoFormProps {
  onClose: () => void;
  onTodoAdded: () => void;
}

interface Class {
  id: string; // Changed to string to match UUID
  name: string;
}

export default function AddTodoForm({ onClose, onTodoAdded }: AddTodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [status, setStatus] = useState("normal");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    dueDate?: string;
    selectedClass?: string;
  }>({});

  useEffect(() => {
    const fetchClasses = async () => {
      const { data, error } = await supabase.from("classes").select("id, name");
      if (error) {
        console.error("Error fetching classes:", error);
        setError("Failed to load classes. Please try again.");
      } else {
        setClasses(data);
        if (data.length > 0) {
          setSelectedClass(data[0].id);
        }
      }
    };
    fetchClasses();
  }, []);

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

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setDueTime("");
    setStatus("normal");
    setSelectedClass(classes.length > 0 ? classes[0].id : null);
    setValidationErrors({});
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const combinedDateTime = dueDate && dueTime ? `${dueDate}T${dueTime}:00` : null;

      const { error: insertError } = await supabase.from("todos").insert({
        title,
        description,
        due_date: combinedDateTime,
        status,
        class_id: selectedClass,
      });

      if (insertError) {
        throw insertError;
      }

      onTodoAdded();
      resetForm();
      onClose();
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New To Do</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              id="class"
              value={selectedClass || ""}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setValidationErrors((prev) => ({ ...prev, selectedClass: undefined }));
              }}
              className={validationErrors.selectedClass ? "border-red-500" : ""}
            >
              <option value="">Select a class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
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
          <div className="flex justify-end space-x-2">
            <Button type="button" onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add To Do"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}