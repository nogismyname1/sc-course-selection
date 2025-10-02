import jsPDF from 'jspdf';
import { Course } from './course-selection-grid';

interface ScheduleData {
  sectionId: string;
  sectionTitle: string;
  selectedCourses: Course[];
  studentInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  isPartialSchedule?: boolean;
  completedSections?: number;
  totalSections?: number;
}

export class SchedulePDFGenerator {
  private doc: jsPDF;
  private readonly pageWidth: number;
  private readonly pageHeight: number;
  private readonly margin: number;
  private yPosition: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.yPosition = this.margin;
  }

  generateSchedulePDF(scheduleData: ScheduleData[]): string {
    // Get student info from the first section (they should all have the same student info)
    const studentInfo = scheduleData.length > 0 ? scheduleData[0].studentInfo : undefined;
    const isPartialSchedule = scheduleData.length > 0 ? scheduleData[0].isPartialSchedule : false;
    const completedSections = scheduleData.length > 0 ? scheduleData[0].completedSections : 0;
    const totalSections = scheduleData.length > 0 ? scheduleData[0].totalSections : 0;
    
    this.addHeader();
    if (isPartialSchedule) {
      this.addPartialScheduleNotice(completedSections, totalSections);
    }
    this.addStudentInfo(studentInfo);
    this.addGeneratedDate();
    
    scheduleData.forEach((section, index) => {
      if (section.selectedCourses.length > 0) {
        if (index > 0) {
          this.addSpacing(15);
        }
        this.addSection(section);
      }
    });

    this.addFooter(isPartialSchedule);
    
    // Return the PDF as a data URL for download
    return this.doc.output('dataurlstring');
  }

  private addHeader() {
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Course Schedule', this.pageWidth / 2, this.yPosition, { align: 'center' });
    this.yPosition += 15;
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Academic Year 2024', this.pageWidth / 2, this.yPosition, { align: 'center' });
    this.yPosition += 20;
  }

  private addPartialScheduleNotice(completedSections?: number, totalSections?: number) {
    this.doc.setFillColor(255, 240, 200); // Light orange background
    this.doc.rect(this.margin, this.yPosition - 5, this.pageWidth - 2 * this.margin, 20, 'F');
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(150, 75, 0); // Orange text
    this.doc.text('PARTIAL SCHEDULE NOTICE', this.pageWidth / 2, this.yPosition + 5, { align: 'center' });
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    if (completedSections !== undefined && totalSections !== undefined) {
      this.doc.text(`${completedSections} of ${totalSections} sections completed. You can add more courses and resubmit.`, this.pageWidth / 2, this.yPosition + 12, { align: 'center' });
    } else {
      this.doc.text('This is a partial course schedule. You can add more courses and resubmit.', this.pageWidth / 2, this.yPosition + 12, { align: 'center' });
    }
    
    this.doc.setTextColor(0, 0, 0); // Reset to black
    this.yPosition += 25;
  }

  private addStudentInfo(studentInfo?: { name?: string; email?: string; phone?: string }) {
    if (!studentInfo) return;
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Student Information', this.margin, this.yPosition);
    this.yPosition += 12;
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    
    if (studentInfo.name) {
      this.doc.text(`Name: ${studentInfo.name}`, this.margin, this.yPosition);
      this.yPosition += 8;
    }
    
    if (studentInfo.email) {
      this.doc.text(`Email: ${studentInfo.email}`, this.margin, this.yPosition);
      this.yPosition += 8;
    }
    
    if (studentInfo.phone) {
      this.doc.text(`Phone: ${studentInfo.phone}`, this.margin, this.yPosition);
      this.yPosition += 8;
    }
    
    this.yPosition += 10; // Extra spacing after student info
  }

  private addGeneratedDate() {
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text(`Generated on: ${dateString}`, this.pageWidth - this.margin, this.yPosition, { align: 'right' });
    this.yPosition += 15;
  }

  private addSection(section: ScheduleData) {
    // Section header
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(section.sectionTitle, this.margin, this.yPosition);
    this.yPosition += 10;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`${section.selectedCourses.length} courses selected`, this.margin, this.yPosition);
    this.yPosition += 15;

    // Course table header
    this.addTableHeader();
    
    // Course rows
    section.selectedCourses.forEach((course) => {
      this.addCourseRow(course);
    });
    
    this.yPosition += 10;
  }

  private addTableHeader() {
    const headers = ['Course Name', 'Instructor', 'Schedule', 'Duration', 'Dates'];
    const columnWidths = [45, 35, 35, 25, 40];
    let xPosition = this.margin;

    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, this.yPosition - 5, this.pageWidth - 2 * this.margin, 12, 'F');
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    
    headers.forEach((header, index) => {
      this.doc.text(header, xPosition + 2, this.yPosition + 3);
      xPosition += columnWidths[index];
    });
    
    this.yPosition += 12;
  }

  private addCourseRow(course: Course) {
    const columnWidths = [45, 35, 35, 25, 40];
    let xPosition = this.margin;
    
    // Check if we need a new page
    if (this.yPosition > this.pageHeight - 40) {
      this.doc.addPage();
      this.yPosition = this.margin;
      this.addTableHeader();
    }

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    
    // Course Name
    const courseNameLines = this.doc.splitTextToSize(course.name, columnWidths[0] - 4);
    this.doc.text(courseNameLines, xPosition + 2, this.yPosition + 4);
    xPosition += columnWidths[0];
    
    // Instructor
    this.doc.text(course.instructor, xPosition + 2, this.yPosition + 4);
    xPosition += columnWidths[1];
    
    // Schedule
    const schedule = course.secondDayOfWeek 
      ? `${course.dayOfWeek} & ${course.secondDayOfWeek} ${course.startTime}-${course.endTime}`
      : `${course.dayOfWeek} ${course.startTime}-${course.endTime}`;
    const scheduleLines = this.doc.splitTextToSize(schedule, columnWidths[2] - 4);
    this.doc.text(scheduleLines, xPosition + 2, this.yPosition + 4);
    xPosition += columnWidths[2];
    
    // Duration
    this.doc.text(`${course.weeksDuration} weeks`, xPosition + 2, this.yPosition + 4);
    xPosition += columnWidths[3];
    
    // Meeting Dates
    const dates = course.meetingDates.join(', ');
    const dateLines = this.doc.splitTextToSize(dates, columnWidths[4] - 4);
    this.doc.text(dateLines, xPosition + 2, this.yPosition + 4);
    
    // Calculate row height based on longest text
    const maxLines = Math.max(
      courseNameLines.length,
      scheduleLines.length,
      dateLines.length,
      1
    );
    const rowHeight = Math.max(12, maxLines * 4 + 4);
    
    // Add row border
    this.doc.setDrawColor(200, 200, 200);
    this.doc.rect(this.margin, this.yPosition, this.pageWidth - 2 * this.margin, rowHeight);
    
    this.yPosition += rowHeight;
  }

  private addSpacing(space: number) {
    this.yPosition += space;
  }

  private addFooter(isPartialSchedule: boolean = false) {
    // Add summary section
    this.yPosition = Math.max(this.yPosition + 20, this.pageHeight - 60);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Schedule Summary', this.margin, this.yPosition);
    this.yPosition += 10;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    if (isPartialSchedule) {
      this.doc.text('This partial schedule confirms your current course selections.', this.margin, this.yPosition);
      this.yPosition += 8;
      this.doc.text('You can continue selecting courses and generate an updated schedule at any time.', this.margin, this.yPosition);
      this.yPosition += 8;
      this.doc.text('Please save this document for your records and contact the registrar with any questions.', this.margin, this.yPosition);
    } else {
      this.doc.text('This schedule confirms your course selections for the academic year.', this.margin, this.yPosition);
      this.yPosition += 8;
      this.doc.text('Please save this document for your records and contact the registrar with any questions.', this.margin, this.yPosition);
    }
    
    // Page number
    this.doc.setFontSize(8);
    this.doc.text(`Page 1 of 1`, this.pageWidth - this.margin, this.pageHeight - 10, { align: 'right' });
  }

  downloadPDF(filename: string = 'course-schedule.pdf') {
    this.doc.save(filename);
  }
}

export function generateAndDownloadSchedule(scheduleData: ScheduleData[], filename?: string) {
  const generator = new SchedulePDFGenerator();
  const pdfDataUrl = generator.generateSchedulePDF(scheduleData);
  
  // Create download link
  const link = document.createElement('a');
  link.href = pdfDataUrl;
  link.download = filename || `course-schedule-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return pdfDataUrl;
}