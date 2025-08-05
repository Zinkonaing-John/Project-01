"use client";

import { useState, useRef, useEffect } from "react";
import FullCalendar from "./FullCalendar";
import AddTodoForm from "./AddTodoForm";
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

  return (
    <div className="container mx-auto p-4">
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
      <FullCalendar ref={calendarRef} classId={selectedClassId} />
      {isFormOpen && (
        <AddTodoForm
          onClose={() => setIsFormOpen(false)}
          onTodoAdded={handleTodoAdded}
        />
      )}
    </div>
  );
}