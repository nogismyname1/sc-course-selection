# Course Selection System

An interactive course selection system for educational programs including Music Production, DJ, and Studio Engineering.

## Features

- **Interactive Course Grid**: Visual course selection with scheduling conflict detection
- **Multi-Program Support**: Music Production (Ableton/Logic), DJ (Serato/CDJs), Studio Engineering
- **Three-Tier Structure**: Intro → Intermediate → Proficient progression
- **PDF Generation**: Downloadable course schedules
- **Student Management**: Information collection and automation integration
- **Admin Panel**: Course data management with CSV import/export
- **Responsive Design**: Works on desktop and mobile devices
- **Cross-Section Conflict Detection**: Prevents scheduling overlaps across all sections

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser

### Installation

1. **Clone or download** this project to your local machine

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:3000`

### Build for Production

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Preview the build**:
   ```bash
   npm run preview
   ```

3. **Deploy the `dist` folder** to your web server

## Deployment Options

### Option 1: Static Hosting
- Upload the `dist` folder to any static hosting service
- Works with: Netlify, Vercel, GitHub Pages, S3, etc.

### Option 2: WordPress Integration
- Use a React plugin or create a custom post type
- Upload the built files to your WordPress theme directory
- Enqueue the scripts in your theme's functions.php

### Option 3: Custom Server
- Upload the `dist` folder to your web server
- Configure your server to serve the index.html for all routes

## Configuration

### Admin Access
- Default admin password: `nog`
- Access via the settings icon in the top-right corner

### Course Data Management
- Upload CSV files through the admin panel
- Course data persists in the application state
- Export functionality available for backup

### Webhook Integration
- Configure Zapier webhook URL in App.tsx
- Handles student submission data
- Includes fallback for CORS restrictions

## File Structure

```
├── App.tsx                     # Main application component
├── main.tsx                    # Application entry point
├── components/                 # React components
│   ├── course-selection-grid.tsx
│   ├── course-data-manager.tsx
│   ├── student-only-view.tsx
│   ├── schedule-pdf-generator.tsx
│   └── ui/                     # UI components (shadcn/ui)
├── styles/
│   └── globals.css             # Global styles and Tailwind
├── data/
│   └── courses.json            # Sample course data
├── templates/                  # CSV templates for course import
└── dist/                       # Built application (after npm run build)
```

## Customization

### Styling
- Modify `styles/globals.css` for global styles
- Update CSS variables for color scheme changes
- Tailwind v4 for utility classes

### Programs
- Add new programs in the `PROGRAMS` array in App.tsx
- Create corresponding course data structures
- Update section requirements as needed

### Course Data
- Use the admin panel to upload CSV files
- Follow the template format in the `templates/` directory
- Course IDs must be unique across all programs

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Build Issues
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear npm cache: `npm cache clean --force`
3. Check Node.js version: `node --version` (should be 18+)

### Runtime Issues
1. Check browser console for errors
2. Verify all dependencies are installed
3. Clear browser cache and cookies

### Webhook Issues
- CORS restrictions may block direct webhook calls
- Fallback JSON download is provided for manual processing
- Test webhook connectivity in the admin panel

## Support

For issues and questions:
1. Check the browser console for error messages
2. Verify all course data is properly formatted
3. Test in different browsers
4. Review the Course Management Guide in the project files

## License

This project is proprietary software. All rights reserved.