# GPT Prompts for PRD Enhancement

## Prompt 1: User Stories তৈরি করো

```
I have a student study app called "Second Brain" with these features:
- Notes with AI
- Focus timer
- Revision planning
- Question bank
- Social features
- Gamification
- Payment system

Please create user stories in this format:
As a [user type], I want [goal] so that [benefit].

Include stories for:
1. Student users
2. Premium users
3. Admin users
4. New users

Make them specific to Bangladesh student context.
```

---

## Prompt 2: API Design করো

```
Design REST API endpoints for my study app:

Features:
- User authentication (Firebase)
- Notes CRUD
- Focus sessions
- AI chat
- Payment processing
- Social features

Please provide:
1. Endpoint URLs
2. HTTP methods
3. Request/response format
4. Authentication requirements
5. Rate limits

Format as a table.
```

---

## Prompt 3: Database Rules লেখো

```
Write Firestore security rules for my app:

Database structure:
- users/{uid}/notes/{noteId}
- users/{uid}/projects/{projectId}
- focus_sessions/{sessionId}
- payment_requests/{requestId}
- support_chats/{chatId}

Rules needed:
1. Users can only read/write their own data
2. Admin can read all data
3. Payment requests are write-once
4. Support chats are user-scoped

Provide complete Firestore rules.
```

---

## Prompt 4: Test Cases তৈরি করো

```
Create test cases for my study app features:

Features to test:
1. User registration/login
2. Note creation/editing
3. Focus timer start/stop
4. AI chat response
5. Payment processing
6. Social features (friend request, chat)

For each feature provide:
- Test case name
- Pre-conditions
- Steps
- Expected result
- Priority (High/Medium/Low)
```

---

## Prompt 5: Performance Optimization

```
My study app has these performance issues:
- Slow initial load
- Large JavaScript bundle
- Multiple Firebase queries
- Image loading delays

Tech stack: HTML/CSS/JS PWA + Firebase

Please suggest:
1. Code splitting strategy
2. Lazy loading approach
3. Caching strategy
4. Database query optimization
5. Image optimization

Provide specific implementation steps.
```

---

## Prompt 6: Security Audit

```
Audit my study app for security vulnerabilities:

Current implementation:
- Firebase Auth (Google, Email)
- Firestore database
- Client-side AI API calls
- Payment via UddoktaPay
- PWA with service worker

Check for:
1. Authentication vulnerabilities
2. Database security issues
3. API key exposure
4. XSS/CSRF risks
5. Data privacy concerns

Provide fixes for each issue found.
```

---

## Prompt 7: Monetization Analysis

```
Analyze monetization strategy for my Bangladesh student app:

Current pricing:
- Free: 14-day trial
- Basic: ৳99/month
- Pro: ৳199/month

Context:
- Target: Students in Bangladesh
- Competition: Free apps available
- Payment methods: bKash, Nagad

Please provide:
1. Pricing optimization suggestions
2. Conversion rate improvement tips
3. Retention strategies
4. Revenue projection (1000 users)
5. Competitive analysis
```

---

## Prompt 8: Feature Prioritization

```
Prioritize features for my student app:

Available features:
1. AI-powered study plans
2. Voice notes
3. Collaborative notes
4. Video lessons
5. Quiz with friends
6. Screen time tracking
7. App blocking (focus mode)
8. Offline mode
9. Multi-language
10. Parental controls

Constraints:
- 2 developers
- 3-month timeline
- Limited budget

Use MoSCoW method:
- Must have
- Should have
- Could have
- Won't have (this time)

Explain your reasoning.
```

---

## Prompt 9: Documentation লেখো

```
Write user documentation for my study app:

Feature: Focus Timer

Include:
1. How to start a focus session
2. How to set daily targets
3. How focus mode blocks apps
4. How to view history
5. Troubleshooting common issues

Write in simple Bengali mixed with English.
Target audience: HSC/SSC students.
```

---

## Prompt 10: Roadmap Planning

```
Create a 6-month development roadmap for my student app:

Current state:
- PWA with 80+ JS modules
- Firebase backend
- Basic AI features
- Payment system
- Android WebView wrapper

Goals:
- 10,000 users
- Play Store launch
- Premium subscriptions
- Advanced AI features

Provide:
1. Monthly milestones
2. Resource requirements
3. Risk assessment
4. Success metrics
5. Budget estimate
```

---

## 📝 কীভাবে ব্যবহার করবেন:

1. উপরের যেকোনো prompt **কপি** করুন
2. **ChatGPT**-তে **পেস্ট** করুন
3. আপনার নির্দিষ্ট details **যোগ** করুন
4. **Send** করুন
5. GPT **সম্পূর্ণ উত্তর** দেবে
6. **Implement** করুন

---

*Happy Planning! 🚀*
