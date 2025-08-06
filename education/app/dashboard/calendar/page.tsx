"use client";

import { useState, useRef, useEffect } from "react";
import FullCalendar from "./FullCalendar";
import AddTodoForm from "./AddTodoForm";
import EditDeleteTodoForm from "./EditDeleteTodoForm"; // Import the new component
import { Button } from "../../components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { supabase } from "../../../lib/supabase";

interface Class {
  id: string;
  name: string;
}

export default function CalendarPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null); // New state for editing
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const calendarRef = useRef<any>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      const { data, error } = await supabase.from("classes").select("id, name");
      if (error) {
        console.error("Error fetching classes:", error);
      } else {
        setClasses(data);
        if (data.length > 0) {
          setSelectedClassId(data[0].id);
        }
      }
    };
    fetchClasses();
  }, []);

  const handleTodoAdded = () => {
    if (calendarRef.current) {
      calendarRef.current.refetchEvents();
    }
  };

  const handleTodoUpdated = () => {
    if (calendarRef.current) {
      calendarRef.current.refetchEvents();
    }
    setEditingTodoId(null); // Close edit form after update
  };

  const handleTodoDeleted = () => {
    if (calendarRef.current) {
      calendarRef.current.refetchEvents();
    }
    setEditingTodoId(null); // Close edit form after delete
  };

  const handleEventClick = (todoId: string) => {
    setEditingTodoId(todoId);
  };

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>
      <div className="flex items-center space-x-4 mb-4">
        <Button onClick={() => setIsFormOpen(true)}>
          Add New To Do
        </Button>
        <div className="flex items-center space-x-2">
          <Label htmlFor="class-filter">Filter by Class:</Label>
          <Select
            value={selectedClassId || ""}
            onValueChange={(value) =>
              setSelectedClassId(value === "all" ? null : value)
            }
          >
            <SelectTrigger id="class-filter">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <FullCalendar ref={calendarRef} classId={selectedClassId} onEventClick={handleEventClick} />
      {isFormOpen && (
        <AddTodoForm
          onClose={() => setIsFormOpen(false)}
          onTodoAdded={handleTodoAdded}
        />
      )}
      {editingTodoId && (
        <EditDeleteTodoForm
          todoId={editingTodoId}
          onClose={() => setEditingTodoId(null)}
          onTodoUpdated={handleTodoUpdated}
          onTodoDeleted={handleTodoDeleted}
        />
      )}
    </div>
  );
}