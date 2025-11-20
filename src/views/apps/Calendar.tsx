'use client';

import { useEffect, useRef, useState } from 'react';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Dialog from '@mui/material/Dialog';
import SpeedDial from '@mui/material/SpeedDial';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

// third-party
import { EventInput } from '@fullcalendar/common';
import { DateSelectArg, EventClickArg, EventDropArg, EventSourceInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { EventResizeDoneArg } from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';

// project-imports
import { useGetEvents, updateEvent } from 'api/calender';
import { PopupTransition } from 'components/@extended/Transitions';
import AddEventForm from 'sections/apps/calendar/AddEventForm';
import CalendarStyled from 'sections/apps/calendar/CalendarStyled';
import Toolbar from 'sections/apps/calendar/Toolbar';

// assets
import { Add } from '@wandersonalwes/iconsax-react';

// ==============================|| CALENDAR - MAIN ||============================== //

export default function Calendar() {
  const downSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<EventInput | null>();
  const [calendarView, setCalendarView] = useState<string>();
  const [date, setDate] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<null | { start: Date; end: Date }>(null);
  const calendarRef = useRef<FullCalendar>(null);
  const { events } = useGetEvents();

  useEffect(() => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      const newView = downSM ? 'listWeek' : 'dayGridMonth';
      calendarApi.changeView(newView);
      setCalendarView(newView);
    }
  }, [downSM]);

  // calendar toolbar events
  const handleDateToday = () => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.today();
      setDate(calendarApi.getDate());
    }
  };

  const handleViewChange = (newView: string) => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.changeView(newView);
      setCalendarView(newView);
    }
  };

  const handleDatePrev = () => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.prev();
      setDate(calendarApi.getDate());
    }
  };

  const handleDateNext = () => {
    const calendarEl = calendarRef.current;

    if (calendarEl) {
      const calendarApi = calendarEl.getApi();

      calendarApi.next();
      setDate(calendarApi.getDate());
    }
  };

  // calendar events
  const handleRangeSelect = (arg: DateSelectArg) => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.unselect();
    }

    setSelectedRange({ start: arg.start, end: arg.end });
    setModalOpen(true);
  };

  const handleEventSelect = (arg: EventClickArg) => {
    if (arg?.event?.id) {
      const event = events.find((event) => event.id === arg.event.id);
      setSelectedEvent(event);
    }

    setModalOpen(true);
  };

  const handleEventUpdate = async ({ event }: EventResizeDoneArg | EventDropArg) => {
    await updateEvent(event.id, {
      allDay: event.allDay,
      start: event.start,
      end: event.end
    });
  };

  const modalCallback = (openModal: boolean) => {
    // open/close modal based on dialog state
    if (!openModal) {
      setSelectedEvent(null);
    }
    setModalOpen(openModal);
  };

  const handleModal = () => {
    if (isModalOpen) {
      setSelectedEvent(null);
    }
    setModalOpen(!isModalOpen);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <CalendarStyled>
        <Toolbar
          date={date}
          view={calendarView!}
          onClickNext={handleDateNext}
          onClickPrev={handleDatePrev}
          onClickToday={handleDateToday}
          onChangeView={handleViewChange}
        />

        <FullCalendar
          weekends
          editable
          droppable
          selectable
          events={events as EventSourceInput}
          ref={calendarRef}
          rerenderDelay={10}
          initialDate={date}
          initialView={calendarView}
          dayMaxEventRows={3}
          eventDisplay="block"
          headerToolbar={false}
          allDayMaintainDuration
          eventResizableFromStart
          select={handleRangeSelect}
          eventDrop={handleEventUpdate}
          eventClick={handleEventSelect}
          eventResize={handleEventUpdate}
          height={downSM ? 'auto' : 720}
          plugins={[listPlugin, dayGridPlugin, timelinePlugin, timeGridPlugin, interactionPlugin]}
        />
      </CalendarStyled>

      {/* Dialog renders its body even if not open */}
      <Dialog
        maxWidth="sm"
        slots={{ transition: PopupTransition }}
        fullWidth
        onClose={handleModal}
        open={isModalOpen}
        slotProps={{ paper: { sx: { p: 0, bgcolor: 'secondary.lighter' } } }}
      >
        <AddEventForm modalCallback={modalCallback} event={selectedEvent} range={selectedRange} onCancel={handleModal} />
      </Dialog>
      <Tooltip title="Add New Event">
        <SpeedDial
          ariaLabel="add-event-fab"
          sx={{ display: 'inline-flex', position: 'sticky', bottom: 24, left: '100%', transform: 'translate(-50%, -50% )' }}
          icon={<Add />}
          onClick={handleModal}
        />
      </Tooltip>
    </Box>
  );
}
