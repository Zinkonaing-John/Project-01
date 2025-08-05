"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { supabase } from "../../../lib/supabase";

interface FullCalendarComponentProps {
  classId: string | null;
}

const FullCalendarComponent = forwardRef(
  ({ classId }: FullCalendarComponentProps, ref) => {
  const [events, setEvents] = useState([]);

  const fetchTodos = async () => {
      let query = supabase.from("todos").select("title, due_date, status");

      if (classId) {
        query = query.eq("class_id", classId);
      }

      const { data, error } = await query;

    if (error) {
      console.error("Error fetching todos:", error);
      return;
    }

    if (data) {
      const formattedEvents = data.map((todo) => ({
        title: todo.title,
        date: todo.due_date,
        backgroundColor: getStatusColor(todo.status),
        borderColor: getStatusColor(todo.status),
      }));
      // @ts-ignore
      setEvents(formattedEvents);
    }
  };

  useImperativeHandle(ref, () => ({
    refetchEvents: fetchTodos,
  }));

  useEffect(() => {
    fetchTodos();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "important":
        return "#EF4444"; // Red
      case "urgent":
        return "#F97316"; // Orange
      case "normal":
      default:
        return "#3B82F6"; // Blue
    }
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,listWeek",
      }}
      events={events}
    />
  );
});

export default FullCalendarComponent;