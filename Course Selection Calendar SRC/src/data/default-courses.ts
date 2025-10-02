import { Course } from '../components/course-selection-grid';

// Default courses loaded from admin uploads - these become the production defaults
export const defaultCourses: { [programId: string]: Course[] } = {
  'music-production-ableton': [
    {
      "id": "123456",
      "code": "PP",
      "name": "Piano for Producers: Intro",
      "section": "section1",
      "trimester": 0,
      "month": 0,
      "startTime": "6:45 PM",
      "endTime": "8:45 PM",
      "dayOfWeek": "Tuesday",
      "secondDayOfWeek": "Thursday",
      "instructor": "TBD",
      "weeksDuration": 6,
      "required": true,
      "meetingDates": [
        "Jan 13", "Jan 15", "Jan 20", "Jan 22", "Jan 27", "Jan 29"
      ]
    },
    {
      "id": "123457",
      "code": "PP",
      "name": "Piano for Producers: Intro",
      "section": "section1",
      "trimester": 1,
      "month": 4,
      "startTime": "6:45 PM",
      "endTime": "8:45 PM",
      "dayOfWeek": "Wednesday",
      "instructor": "TBD",
      "weeksDuration": 6,
      "required": true,
      "meetingDates": ["May 6", "May 13", "May 20", "May 27", "Jun 3", "Jun 10"]
    },
    // Add more courses as needed - keeping first 2 as examples
  ],
  'music-production-logic': [],
  'dj-serato': [],
  'dj-cdjs': [],
  'studio-engineering': []
};