import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export interface Course {
  id: string;
  name: string;
  code: string;
  section: string; // Which section this course belongs to (section1, section2, section3)
  trimester: number;
  month: number;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  secondDayOfWeek?: string; // For courses that meet twice a week
  instructor: string;
  weeksDuration: number; // Usually 4-6 weeks
  required: boolean; // Whether this course is required for the section
  meetingDates: string[]; // Array of meeting dates in format "Jan 8", "Jan 15", etc.
}

interface CourseSelectionGridProps {
  courses: Course[];
  onSelectionChange?: (selectedCourses: Set<string>, completionStatus: { completed: boolean; selectedCount: number; totalCount: number }) => void;
  allSectionSelections?: { [key: string]: { selectedCourses: Set<string>; completed: boolean; selectedCount: number; totalCount: number } };
  allCourses?: Course[];
  currentSectionId?: string;
  initialSelections?: Set<string>;
}

export function CourseSelectionGrid({ 
  courses, 
  onSelectionChange, 
  allSectionSelections = {}, 
  allCourses = [], 
  currentSectionId = '',
  initialSelections = new Set()
}: CourseSelectionGridProps) {
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(initialSelections);
  const onSelectionChangeRef = useRef(onSelectionChange);

  const trimesters = ['Winter', 'Spring', 'Fall'];
  const months = [
    'January', 'February', 'March', 'April', // Winter (Trimester 0)
    'May', 'June', 'July', 'August', // Spring (Trimester 1)
    'September', 'October', 'November', 'December' // Fall (Trimester 2)
  ];

  // Memoized unique courses calculation - handles empty courses array safely
  const uniqueCourses = useMemo(() => {
    if (!courses || courses.length === 0) return [];
    return courses.reduce((acc, course) => {
      if (!acc.find(c => c.name === course.name)) {
        acc.push(course);
      }
      return acc;
    }, [] as Course[]);
  }, [courses]);

  // Update ref when onSelectionChange changes
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  // Initialize selection state on mount and when initialSelections change
  useEffect(() => {
    setSelectedCourses(initialSelections);
  }, [initialSelections]);

  // Initialize selection state on mount - run only once when courses change
  useEffect(() => {
    if (onSelectionChangeRef.current && uniqueCourses.length > 0) {
      const currentSelectedCount = Array.from(initialSelections)
        .map(id => courses.find(c => c.id === id))
        .filter(c => c)
        .reduce((acc, course) => {
          if (course && !acc.some(existing => existing.name === course.name)) {
            acc.push(course);
          }
          return acc;
        }, [] as Course[]).length;

      onSelectionChangeRef.current(initialSelections, {
        completed: currentSelectedCount === uniqueCourses.length && uniqueCourses.length > 0,
        selectedCount: currentSelectedCount,
        totalCount: uniqueCourses.length
      });
    }
  }, [uniqueCourses.length, initialSelections]); // Depend on both unique courses length and initial selections

  // Group courses by trimester and month
  const coursesByTrimesterAndMonth = useMemo(() => {
    const grouped: { [key: string]: Course[] } = {};
    courses.forEach(course => {
      const key = `${course.trimester}-${course.month}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(course);
    });
    return grouped;
  }, [courses]);

  // Parse time utility function
  const parseTime = (timeStr: string): number => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;
    return hour24 * 60 + minutes;
  };

  // Memoized conflict detection to prevent performance issues - now checks across ALL sections
  const conflictMap = useMemo(() => {
    const map = new Map<string, boolean>();
    
    // Get all selected courses from ALL sections (not just current section)
    const allSelectedCourseIds = Object.values(allSectionSelections)
      .flatMap(section => Array.from(section.selectedCourses));
    
    // Find all selected courses from the complete course list
    const allSelectedCourses = allSelectedCourseIds
      .map(id => allCourses.find(c => c.id === id))
      .filter(c => c) as Course[];
    
    courses.forEach(course => {
      // Check conflicts with courses selected in ANY section (excluding the current course itself)
      const hasConflictWithCourse = allSelectedCourses
        .filter(selectedCourse => selectedCourse.id !== course.id)
        .some(selectedCourse => {
          // Get meeting dates for both courses
          const courseDates = course.meetingDates || [];
          const selectedDates = selectedCourse.meetingDates || [];
          
          // Find overlapping dates (exact string matches like "Jan 8")
          const overlappingDates = courseDates.filter(date => selectedDates.includes(date));
          
          // If no overlapping dates, no conflict possible
          if (overlappingDates.length === 0) {
            return false;
          }
          
          // If there are overlapping dates, check for time conflicts
          const courseStart = parseTime(course.startTime);
          const courseEnd = parseTime(course.endTime);
          const selectedStart = parseTime(selectedCourse.startTime);
          const selectedEnd = parseTime(selectedCourse.endTime);
          
          // Check if times overlap - only return true if there's actual time overlap
          return (courseStart < selectedEnd && courseEnd > selectedStart);
        });

      map.set(course.id, hasConflictWithCourse);
    });
    
    return map;
  }, [courses, allSectionSelections, allCourses]); // Now depends on all section selections and all courses

  const hasConflict = (courseId: string) => {
    return conflictMap.get(courseId) || false;
  };

  // Memoized calculations to prevent performance issues - for current section only
  const selectedCoursesData = useMemo(() => {
    return Array.from(selectedCourses)
      .map(id => courses.find(c => c.id === id))
      .filter(c => c)
      .reduce((acc, course) => {
        if (course && !acc.some(existing => existing.name === course.name)) {
          acc.push(course);
        }
        return acc;
      }, [] as Course[]);
  }, [selectedCourses, courses]);

  // Check if a course name is already selected in ANY section
  const isCourseNameSelected = useCallback((courseName: string) => {
    // Get all selected courses from ALL sections
    const allSelectedCourseIds = Object.values(allSectionSelections)
      .flatMap(section => Array.from(section.selectedCourses));
    
    const allSelectedCoursesData = allSelectedCourseIds
      .map(id => allCourses.find(c => c.id === id))
      .filter(c => c)
      .reduce((acc, course) => {
        if (course && !acc.some(existing => existing.name === course.name)) {
          acc.push(course);
        }
        return acc;
      }, [] as Course[]);

    return allSelectedCoursesData.some(c => c.name === courseName);
  }, [allSectionSelections, allCourses]);

  const canSelectCourse = useCallback((courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return false;
    
    const isAlreadySelected = selectedCourses.has(courseId);
    
    if (isAlreadySelected) return true; // Can always deselect
    if (isCourseNameSelected(course.name)) return false; // Can't select same course twice
    if (hasConflict(courseId)) return false; // No conflicts
    
    return true;
  }, [courses, selectedCourses, isCourseNameSelected, hasConflict]);

  const toggleCourseSelection = (courseId: string) => {
    const newSelections = new Set(selectedCourses);
    
    if (selectedCourses.has(courseId)) {
      newSelections.delete(courseId);
    } else if (canSelectCourse(courseId)) {
      newSelections.add(courseId);
    }
    
    setSelectedCourses(newSelections);
    
    // Notify parent component about selection changes
    if (onSelectionChangeRef.current) {
      // Calculate selected courses from new selections
      const newSelectedCoursesData = Array.from(newSelections)
        .map(id => courses.find(c => c.id === id))
        .filter(c => c)
        .reduce((acc, course) => {
          if (course && !acc.some(existing => existing.name === course.name)) {
            acc.push(course);
          }
          return acc;
        }, [] as Course[]);
      
      const selectedCount = newSelectedCoursesData.length;
      const totalCount = uniqueCourses.length;
      const completed = selectedCount === totalCount && totalCount > 0;
      
      onSelectionChangeRef.current(newSelections, {
        completed,
        selectedCount,
        totalCount
      });
    }
  };

  const getMonthsForTrimester = (trimester: number) => {
    const startMonth = trimester * 4;
    return months.slice(startMonth, startMonth + 4);
  };

  const renderCourse = useCallback((course: Course) => {
    const isSelected = selectedCourses.has(course.id);
    const hasTimeConflict = hasConflict(course.id);
    const canSelect = canSelectCourse(course.id);
    const courseNameSelected = isCourseNameSelected(course.name) && !isSelected;

    return (
      <Card 
        key={course.id}
        className={`course-card transition-all duration-200 rounded-xl relative ${
          isSelected 
            ? 'ring-2 ring-primary bg-gray-100 border-primary' 
            : hasTimeConflict 
              ? 'bg-red-50 border-red-300' 
              : courseNameSelected
                ? 'bg-gray-300 opacity-60'
                : 'bg-gray-100 hover:bg-gray-200 hover:shadow-md border-gray-200'
        } ${!canSelect && !isSelected ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        onClick={(e) => {
          // Prevent click on disabled/conflicted/grayed out tiles
          if (!canSelect && !isSelected) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          if (hasTimeConflict && !isSelected) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          if (courseNameSelected && !isSelected) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          toggleCourseSelection(course.id);
        }}
      >
        <CardHeader className="pb-[0px] pt-[12px] px-3 pr-[12px] pl-[12px] -mb-5">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="font-medium text-[rgba(0,0,0,1)] leading-tight font-bold text-[16px]">
                {course.name}
              </CardTitle>
            </div>
            <div className="flex-shrink-0">
              {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
              {hasTimeConflict && !isSelected && <AlertTriangle className="h-4 w-4 text-red-500" />}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 pb-0 px-3">
          <div className="">
            {/* Days and Time */}
            <div className="space-y-0.5">
              <div className="text-sm text-[rgba(79,79,79,1)] font-bold font-normal">
                {course.secondDayOfWeek 
                  ? `${course.dayOfWeek} & ${course.secondDayOfWeek}` 
                  : course.dayOfWeek
                }
              </div>
              <div className="text-sm text-[rgba(101,101,101,1)]">
                {course.startTime}-{course.endTime}
              </div>
            </div>
            
            {/* Meeting Dates */}
            <div className="space-y-0.5 min-h-[60px]">
              {course.meetingDates.map((date, index) => (
                <div key={index} className="text-sm text-[rgba(155,155,155,1)]">
                  {date}
                </div>
              ))}
            </div>
          </div>
          
          {/* Duration Badge - positioned in bottom right */}
          <div className="absolute bottom-2 right-2">
            <Badge 
              variant="secondary" 
              className="bg-gray-800 text-white px-2 py-1 text-xs rounded-full border-0"
            >
              {course.weeksDuration}w
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }, [selectedCourses, hasConflict, canSelectCourse, isCourseNameSelected, toggleCourseSelection, months]);

  // Early return handling after all hooks are declared
  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No courses available for this section.
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {/* Selection Summary */}
      <Card className="bg-[rgba(0,0,0,0)] rounded-[15px] border-none">
        <CardHeader className="bg-[rgba(0,0,0,0)]">
        <CardTitle>Please Select 1 of Each of the Following Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {uniqueCourses.map((course) => {
              const isSelected = isCourseNameSelected(course.name);
              const selectedOption = selectedCoursesData.find(c => c.name === course.name);
              
              return (
                <Card key={course.name} className={isSelected ? 'border-primary bg-primary/5' : 'border-muted'}>
                  <CardHeader className="pb-[0px] pt-[24px] pr-[24px] pl-[24px]">
                    <CardTitle className="text-sm">{course.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isSelected && selectedOption ? (
                      <div className="space-y-1">
                        <Badge variant="default" className="text-xs">
                          Selected
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {selectedOption.secondDayOfWeek 
                            ? `${selectedOption.dayOfWeek} & ${selectedOption.secondDayOfWeek}` 
                            : selectedOption.dayOfWeek
                          } {selectedOption.startTime}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {months[selectedOption.trimester * 4 + selectedOption.month]}
                        </p>
                      </div>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Not Selected
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <Badge variant={selectedCoursesData.length === uniqueCourses.length ? 'default' : 'secondary'}>
              {selectedCoursesData.length}/{uniqueCourses.length} courses selected
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Course Grid */}
      {trimesters.map((trimesterName, trimesterIndex) => (
        <div key={trimesterIndex} className="space-y-4 bg-[rgba(0,0,0,0)]">
          <div className="flex items-center gap-4 px-[0px] py-[10px] mt-[0px] mr-[50px] mb-[16px] ml-[50px]">
            <h2 className="text-xl font-medium text-center font-normal font-bold">{trimesterName} Trimester</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getMonthsForTrimester(trimesterIndex).map((monthName, monthIndex) => {
              const actualMonth = trimesterIndex * 4 + monthIndex;
              const monthCourses = coursesByTrimesterAndMonth[`${trimesterIndex}-${actualMonth}`] || [];
              
              return (
                <div key={actualMonth} className="space-y-3">
                  <h3 className="font-medium text-center font-bold">
                    {monthName}
                  </h3>
                  <div className="space-y-2">
                    {monthCourses.length > 0 ? (
                      monthCourses.map(renderCourse)
                    ) : (
                      <div className="text-center text-muted-foreground text-sm p-4 border-2 border-dashed border-muted rounded-lg">
                        No courses available
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Clear Selection Button */}
      <div className="flex justify-center pt-4">
        <Button 
          variant="outline" 
          onClick={() => {
            setSelectedCourses(new Set());
            if (onSelectionChangeRef.current) {
              onSelectionChangeRef.current(new Set(), {
                completed: false,
                selectedCount: 0,
                totalCount: uniqueCourses.length
              });
            }
          }}
          disabled={selectedCourses.size === 0}
        >
          Clear All Selections
        </Button>
      </div>
    </div>
  );
}