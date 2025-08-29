# G&L Systems - Sistemas Empresariais

## Overview

G&L Systems is a business systems company founded in 2025 that develops enterprise solutions to optimize time for small businesses and entrepreneurs. The platform provides functional demos of various business management systems including e-commerce, inventory control, financial management, appointment scheduling, restaurant management, workshop management, real estate management, and fitness center management. Each system includes automated reporting, data export capabilities, and dashboard visualizations to help businesses make data-driven decisions and save time on manual processes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Flask-based web application with Jinja2 templating
- **Styling**: Bootstrap 5.3.0 for responsive design with custom CSS
- **JavaScript**: Vanilla JavaScript with Chart.js for data visualization
- **Icons**: Font Awesome 6.4.0 for consistent iconography
- **Layout**: Template inheritance system with base.html providing common navigation and structure

### Backend Architecture
- **Framework**: Python Flask application with modular route organization
- **Session Management**: Flask sessions with configurable secret key
- **Data Storage**: In-memory sample data for demonstrations (no persistent database currently)
- **Demo System**: Self-contained functional demos for each business system type
- **Route Organization**: Centralized routes.py file handling all application endpoints

### Demo System Design
- **Modular Demo Pages**: Each business system has its own dedicated demo template
- **Sample Data Integration**: Realistic business data embedded for demonstration purposes
- **Interactive Features**: Functional forms, data manipulation, and report generation
- **Export Capabilities**: CSV and report generation functionality built into demos
- **Dashboard Analytics**: Real-time calculations and visualizations using Chart.js

### Application Structure
- **Static Assets**: Organized CSS and JavaScript files in static/ directory
- **Template System**: HTML templates in templates/ directory with demo subdirectory
- **Configuration**: Environment-based configuration with fallback defaults
- **Logging**: Debug-level logging enabled for development

## External Dependencies

### Frontend Libraries
- **Bootstrap 5.3.0**: CSS framework for responsive design and components
- **Font Awesome 6.4.0**: Icon library for user interface elements
- **Chart.js**: JavaScript charting library for dashboard visualizations

### Python Packages
- **Flask**: Core web framework for application structure and routing
- **Standard Library**: Uses built-in modules (csv, io, json, datetime, logging, os)

### Development Environment
- **Replit Hosting**: Configured for Replit deployment with appropriate host/port settings
- **Debug Mode**: Enabled for development with detailed error reporting
- **Environment Variables**: Support for SESSION_SECRET configuration

### Potential Integrations
The application is designed to be extended with database integration, payment processing, email services, and third-party API connections as needed for production deployment.