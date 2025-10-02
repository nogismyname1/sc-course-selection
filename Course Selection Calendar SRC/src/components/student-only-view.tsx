import { useState, useEffect } from 'react';
import { CourseSelectionGrid, type Course } from './course-selection-grid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { GraduationCap } from 'lucide-react';

interface Program {
  id: string;
  name: string;
}

interface StudentOnlyViewProps {
  courses: Course[];
  sectionRequirements: any;
  selectedProgram: string;
  programs: Program[];
  onProgramChange: (programId: string) => void;
}

export function StudentOnlyView({ courses, sectionRequirements, selectedProgram, programs, onProgramChange }: StudentOnlyViewProps) {
  const [activeSection, setActiveSection] = useState('section1');
  
  // Debug logging with more details
  console.log('StudentOnlyView render - courses:', courses?.length || 0, 'courses');
  console.log('StudentOnlyView render - sectionRequirements:', sectionRequirements);
  console.log('StudentOnlyView render - courses details:', courses?.slice(0, 2));
  
  // Check if we have any data
  const hasData = courses && courses.length > 0 && sectionRequirements && typeof sectionRequirements === 'object';
  console.log('StudentOnlyView render - hasData:', hasData);
  
  if (!hasData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-medium">Loading Course Selection...</h1>
          <p className="text-muted-foreground">
            Please wait while we load the course data.
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Courses: {courses?.length || 0}</p>
            <p>Requirements: {sectionRequirements ? 'Loaded' : 'Missing'}</p>
            <p>Course types: {courses?.map(c => c.code).join(', ') || 'None'}</p>
            <p>Requirements keys: {sectionRequirements ? Object.keys(sectionRequirements).join(', ') : 'None'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter courses by section
  const getCoursesForSection = (sectionId: string) => {
    return courses.filter(course => course.section === sectionId);
  };

  const sections = [
    {
      id: 'section1',
      title: 'Section 1: Intro',
      description: 'Complete all 5 required intro courses by selecting one time slot for each',
      courses: getCoursesForSection('section1'),
      requirements: sectionRequirements?.section1 || []
    },
    {
      id: 'section2',
      title: 'Section 2: Intermediate',
      description: 'Complete all 5 required intermediate courses by selecting one time slot for each',
      courses: getCoursesForSection('section2'),
      requirements: sectionRequirements?.section2 || []
    },
    {
      id: 'section3',
      title: 'Section 3: Proficient',
      description: 'Complete all 5 required proficient courses by selecting one time slot for each',
      courses: getCoursesForSection('section3'),
      requirements: sectionRequirements?.section3 || []
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-medium mb-2">Course Selection System</h1>
          
          {/* Program Selector */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
            <Label htmlFor="program-select" className="text-sm font-medium">
              Select Program:
            </Label>
            <Select value={selectedProgram} onValueChange={onProgramChange}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Choose your program" />
              </SelectTrigger>
              <SelectContent>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Each section requires 5 specific courses to be completed. Select one time slot for each required course.
            Each course runs once per week for 4 consecutive weeks. The academic year starts in January.
          </p>
        </header>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            {sections.map((section) => (
              <TabsTrigger 
                key={section.id} 
                value={section.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {sections.map((section) => (
            <TabsContent key={section.id} value={section.id} className="space-y-6">
              {/* Required Courses Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {section.title} - Required Courses
                    <Badge variant="outline">{section.requirements?.length || 0} courses required</Badge>
                  </CardTitle>
                  <CardDescription>
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {section.requirements?.map((req: any, index: number) => (
                      <Card key={index} className="border-2 border-primary/20">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{req.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                        </CardContent>
                      </Card>
                    )) || (
                      <div className="col-span-full text-center text-muted-foreground">
                        No required courses defined for this section
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Course Selection Grid */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Time Slots</CardTitle>
                  <CardDescription>
                    Select one time slot for each of the {section.requirements?.length || 0} required courses above
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {section.courses.length > 0 ? (
                    <CourseSelectionGrid courses={section.courses} />
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No courses available for this section. Please contact the administrator to add courses.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}