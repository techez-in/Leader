# **App Name**: Leader

## Core Features:

- Add Lead to Notion: Add a lead's Name, Contact (email/phone), Source (Instagram, LinkedIn, etc.), Priority (Low, Medium, High), Notes (optional), Status, Date Added and a Follow-Up date in Notion using the Notion API.
- Automated Follow-Up Scheduler: Daily check for leads due for follow-up by fetching all leads from Notion and comparing 'Follow-Up On' date with today's date; leads are only fetched if the status is not 'Converted' or 'Dropped'.
- Update Lead Status: An API endpoint that updates lead statuses to 'In Progress', 'Converted', or 'Dropped', using the Notion API to modify the corresponding record in the Notion database.
- Email Notification System: System sends email notifications including lead name, contact, and a direct link to update the status to relevant users when a follow-up date is reached. The notification system will leverage email integration to facilitate communication.
- AI Lead Scoring: AI tool to score leads using a generative AI model. Factors include time since added, priority, and follow up activity. Generative AI provides a weighted scoring model reflecting potential lead value.

## Style Guidelines:

- Primary color: HSL(210, 67%, 46%) which converts to a vibrant blue (#3CA3F7), symbolizing trust and reliability.
- Background color: HSL(210, 20%, 95%) which converts to a light, desaturated blue (#F0F4F8), for a clean and calming backdrop.
- Accent color: HSL(180, 50%, 50%) which converts to a teal (#40BFBF), offering a contrasting yet harmonious feel, highlighting important actions.
- Body and headline font: 'Inter' sans-serif for a modern, neutral, and readable design. 'Inter' will provide excellent readability for both the dashboard interface and email notifications.
- Use minimalist and clear icons to represent lead sources and status, providing a straightforward visual guide throughout the interface.
- Design the dashboard using a column-based layout, categorizing leads by status to offer a clear overview and drag-and-drop functionality for ease of use.
- Incorporate subtle animations to smooth transitions and interactions, providing feedback and enhancing user engagement without being distracting.