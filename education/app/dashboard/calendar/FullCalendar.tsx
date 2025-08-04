"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { supabase } from "../../../lib/supabase";

export default function FullCalendarComponent() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchTodos = async () => {
      const { data, error } = await supabase
        .from("todos")
        .select("title, due_date");

      if (error) {
        console.error("Error fetching todos:", error);
        return;
      }

      if (data) {
        const formattedEvents = data.map((todo) => ({
          title: todo.title,
          date: todo.due_date,
        }));
        // @ts-ignore
        setEvents(formattedEvents);
      }
    };

    fetchTodos();
  }, []);

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
}