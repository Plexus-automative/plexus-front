'use client';

// material-ui
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';

// project-imports
import MainCard from 'components/MainCard';

// ==============================|| TIMELINE - OPPOSITE CONTENT ||============================== //

export default function OppositeContentTimeline() {
  const oppositeTimelineCodeString = `<Timeline position="alternate">
  <TimelineItem>
    <TimelineOppositeContent sx={{ color: 'text.secondary' }}>09:30 am</TimelineOppositeContent>
    <TimelineSeparator>
      <TimelineDot variant="outlined" color="primary" />
      <TimelineConnector />
    </TimelineSeparator>
    <TimelineContent>Eat</TimelineContent>
  </TimelineItem>
  <TimelineItem>
    <TimelineOppositeContent sx={{ color: 'text.secondary' }}>10:00 am</TimelineOppositeContent>
    <TimelineSeparator>
      <TimelineDot variant="outlined" color="primary" />
      <TimelineConnector />
    </TimelineSeparator>
    <TimelineContent>Code</TimelineContent>
  </TimelineItem>
  <TimelineItem>
    <TimelineOppositeContent sx={{ color: 'text.secondary' }}>12:00 am</TimelineOppositeContent>
    <TimelineSeparator>
      <TimelineDot variant="outlined" color="primary" />
      <TimelineConnector />
    </TimelineSeparator>
    <TimelineContent>Sleep</TimelineContent>
  </TimelineItem>
  <TimelineItem sx={{ minHeight: 'auto' }}>
    <TimelineOppositeContent sx={{ color: 'text.secondary' }}>9:00 am</TimelineOppositeContent>
    <TimelineSeparator>
      <TimelineDot variant="outlined" color="primary" />
      <TimelineConnector />
    </TimelineSeparator>
    <TimelineContent>Repeat</TimelineContent>
  </TimelineItem>
</Timeline>`;

  return (
    <MainCard title="Opposite Content" codeString={oppositeTimelineCodeString}>
      <Timeline position="alternate">
        <TimelineItem>
          <TimelineOppositeContent sx={{ color: 'text.secondary' }}>09:30 am</TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot variant="outlined" color="primary" />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>Eat</TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineOppositeContent sx={{ color: 'text.secondary' }}>10:00 am</TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot variant="outlined" color="primary" />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>Code</TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineOppositeContent sx={{ color: 'text.secondary' }}>12:00 am</TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot variant="outlined" color="primary" />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>Sleep</TimelineContent>
        </TimelineItem>
        <TimelineItem sx={{ minHeight: 'auto' }}>
          <TimelineOppositeContent sx={{ color: 'text.secondary' }}>9:00 am</TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot variant="outlined" color="primary" />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>Repeat</TimelineContent>
        </TimelineItem>
      </Timeline>
    </MainCard>
  );
}
