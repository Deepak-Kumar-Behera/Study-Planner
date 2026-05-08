# Future Features — AI Study Planner

## High Impact (Core AI/ML angle)

### 1. Adaptive Quiz Difficulty
- Analyze past quiz scores per topic and auto-adjust question difficulty
- Store a difficulty level per topic (easy / medium / hard) in MongoDB
- Use Gemini prompt to generate questions at the appropriate difficulty
- Demonstrates ML-based personalization

### 2. Spaced Repetition Scheduler
- Use the SM-2 algorithm to schedule revision reminders based on the forgetting curve
- Store next review date and interval per revision topic in the DB
- Show "Due Today" revisions prominently on the dashboard
- Strong academic concept — directly relevant to study planning

### 3. Knowledge Gap Analysis
- After each quiz attempt, compare score per topic against a threshold
- Highlight weak topics and suggest re-study (link to notes for that topic)
- Displays an AI feedback loop — impresses supervisors

### 4. PDF / Document Upload → Auto Notes
- Allow users to upload a PDF or paste raw text
- Extract text (using `pdf-parse` on backend) and send to Gemini for note generation
- Very practical feature — makes the app usable for real syllabus material

---

## Medium Impact (Analytics & Gamification)

### 5. Progress Charts
- Use **Recharts** or **Chart.js** to visualize:
  - Quiz scores over time (line chart)
  - Topics studied per week (bar chart)
  - Notes vs Quiz vs Revision breakdown (pie chart)
- Makes the dashboard visually rich for demos

### 6. Topic Mastery Heatmap
- Calendar-style heatmap of daily study activity (like GitHub contributions)
- Track activity per day in a `StudyLog` collection
- Visually striking — great for demo screenshots

### 7. Study Streak Tracking
- Track consecutive days a user studies or attempts a quiz
- Show streak count and a badge on the dashboard
- Gamification element — keeps users engaged

---

## Technical Depth (For Viva / Demo)

### 8. Full-Text Search
- Add MongoDB text indexes on notes and plans
- Search bar in the navbar to search across all notes/plans
- Demonstrates backend indexing and query optimization

### 9. Export to PDF
- Let users export notes or study plans as a PDF
- Use `jsPDF` or `html2pdf.js` on the frontend
- Very useful and demo-friendly — shows real-world utility

### 10. Email Notifications
- Send revision reminders via email using **Nodemailer**
- Trigger emails for spaced repetition due dates or study streaks
- Demonstrates full-stack integration and background job scheduling

---

## Implementation Priority

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 1 | PDF Upload → Auto Notes | Medium | Very High |
| 2 | Progress Charts | Low | High |
| 3 | Adaptive Quiz Difficulty | Medium | Very High |
| 4 | Spaced Repetition Scheduler | High | Very High |
| 5 | Knowledge Gap Analysis | Medium | High |
| 6 | Export to PDF | Low | High |
| 7 | Study Streak Tracking | Low | Medium |
| 8 | Topic Mastery Heatmap | Medium | Medium |
| 9 | Full-Text Search | Low | Medium |
| 10 | Email Notifications | High | Medium |
