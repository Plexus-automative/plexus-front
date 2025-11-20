// assets
const Avatar1 = '/assets/images/users/avatar-1.png';
const Avatar2 = '/assets/images/users/avatar-2.png';
const Avatar3 = '/assets/images/users/avatar-3.png';
const Avatar4 = '/assets/images/users/avatar-4.png';
const Avatar5 = '/assets/images/users/avatar-5.png';
const Avatar6 = '/assets/images/users/avatar-6.png';
const Avatar7 = '/assets/images/users/avatar-7.png';
const Avatar8 = '/assets/images/users/avatar-8.png';
const Avatar9 = '/assets/images/users/avatar-9.png';
const Avatar10 = '/assets/images/users/avatar-10.png';

// types
import type { MailListProp } from 'types/mail';

export const mailList: MailListProp = {
  inbox: {
    primary: [
      {
        id: 1,
        from: 'IT Support',
        subject: 'Policy updates',
        snippet: 'Important policy changes are being implemented. Review the attached document for details on the new guidelines.',
        date: '17 Jul 22 06:45 AM',
        read: false,
        label: ['Promotions', 'Forums'],
        isStarred: false,
        avatar: Avatar4,
        mail: 'it@company.com',
        to: 'John Doe',
        attachments: ['policy_document.pdf', 'summary_report.docx'],
        comments: [
          {
            id: 1,
            from: 'John Doe',
            text: 'I have reviewed the policy and have a question about the new leave policy. Can we schedule a quick call to discuss?',
            avatar: Avatar1,
            forwarded: {
              from: 'HR Manager',
              fromEmail: 'hr.manager@company.com',
              date: 'Wed, Jul 17, 2022 at 06:30 AM',
              to: 'John Doe',
              toEmail: 'john.doe@company.com',
              body: 'I have been informed of the new policy changes and have forwarded the document to the team for review.'
            }
          },
          {
            id: 2,
            from: 'IT Support',
            text: "I'm available to discuss the new leave policy. Please suggest a time that works for you.",
            avatar: Avatar4
          }
        ]
      },
      {
        id: 2,
        from: 'IT Support',
        subject: 'Meeting agenda',
        snippet: 'Please find the agenda for our upcoming meeting. We will be discussing Q3 priorities and team performance.',
        date: '16 Jul 22 11:35 AM',
        read: true,
        isStarred: true,
        avatar: Avatar6,
        important: true,
        mail: 'it@company.com',
        to: 'Jane Smith',
        attachments: ['agenda_Q3.pdf'],
        comments: [
          {
            id: 1,
            from: 'Jane Smith',
            text: 'Looks good. I’ll prepare the Q3 performance data for the meeting.',
            avatar: Avatar2
          },
          {
            id: 2,
            from: 'IT Support',
            text: 'Great, thanks for confirming!',
            avatar: Avatar6,
            forwarded: {
              from: 'Team Lead',
              fromEmail: 'lead@company.com',
              date: 'Tue, Jul 16, 2022 at 11:00 AM',
              to: 'IT Support',
              toEmail: 'it@company.com',
              body: 'I have forwarded the meeting agenda to the team. Please follow up with them on any questions.'
            }
          },
          {
            id: 3,
            from: 'Jane Smith',
            text: 'Should I also bring the Q2 performance report for comparison?',
            avatar: Avatar2
          }
        ]
      },
      {
        id: 3,
        from: 'Anna George',
        subject: 'Your order confirmation',
        snippet: 'Thank you for your recent purchase! Your order #[ORDER_ID] has been confirmed and will be shipped shortly.',
        date: '13 Jul 22 02:56 PM',
        read: true,
        isStarred: false,
        avatar: Avatar5,
        mail: 'anna@company.com',
        to: 'Robert Johnson',
        attachments: [],
        comments: []
      },
      {
        id: 4,
        from: 'Peter Jones',
        subject: 'Collaboration request',
        snippet: 'I’m reaching out to you with a collaboration request on our new project. Let me know if you are interested.',
        date: '17 Jul 22 06:13 AM',
        read: true,
        isStarred: false,
        label: ['Forums'],
        avatar: Avatar3,
        mail: 'peter@company.com',
        to: 'Emily Davis',
        attachments: ['project_proposal.pptx', 'collaboration_details.docx', 'sample_artwork.jpg'],
        comments: [
          {
            id: 1,
            from: 'Emily Davis',
            text: "I'm interested in the collaboration. I'll review the attachments and get back to you with my availability.",
            avatar: Avatar1
          }
        ]
      },
      {
        id: 5,
        from: 'James Peterson',
        subject: 'System maintenance notice',
        snippet: 'Heads-up! We will be performing system maintenance this weekend. The system will be unavailable from 10 PM to 2 AM.',
        date: '13 Jul 22 02:46 PM',
        read: false,
        isStarred: false,
        avatar: Avatar9,
        mail: 'james@company.com',
        to: 'William Brown',
        attachments: [],
        comments: [
          {
            id: 1,
            from: 'William Brown',
            text: 'Thanks for the heads-up. Is there any way to access the system during the maintenance period if needed?',
            avatar: Avatar6
          }
        ]
      },
      {
        id: 6,
        from: 'Mattie Reid',
        subject: 'Meeting agenda',
        snippet: 'Please find the agenda for our upcoming meeting. We will be discussing Q3 priorities and team performance.',
        date: '17 Jul 22 05:41 PM',
        read: false,
        isStarred: false,
        label: ['Promotions'],
        avatar: Avatar2,
        mail: 'mattie@company.com',
        to: 'Olivia Wilson',
        attachments: ['team_performance_report.xls'],
        comments: [
          {
            id: 1,
            from: 'Olivia Wilson',
            text: 'I have some concerns about the data in the report. I’ll follow up with you on Slack.',
            avatar: Avatar3,
            forwarded: {
              from: 'Data Analyst',
              fromEmail: 'analyst@company.com',
              date: 'Wed, Jul 17, 2022 at 05:30 PM',
              to: 'Olivia Wilson',
              toEmail: 'olivia@company.com',
              body: 'I have reviewed the performance data and have some questions about the Q3 projections.'
            }
          },
          {
            id: 2,
            from: 'Mattie Reid',
            text: 'Sounds good. Let me know if you need anything else.',
            avatar: Avatar2
          }
        ]
      },
      {
        id: 7,
        from: 'Anna George',
        subject: 'Team outing details',
        snippet: 'Get ready for our team outing! This email contains all the necessary details, including time, location, and activities.',
        date: '20 Jul 22 06:01 PM',
        read: true,
        isStarred: true,
        avatar: Avatar4,
        mail: 'anna@company.com',
        to: 'James Anderson',
        attachments: ['outing_itinerary.pdf'],
        comments: [
          {
            id: 1,
            from: 'James Anderson',
            text: "Thanks for the details! I'll be there.",
            avatar: Avatar5
          }
        ]
      },
      {
        id: 8,
        from: 'John Walker',
        subject: 'Event reminder',
        snippet: 'Just a friendly reminder about our upcoming event! We look forward to seeing you there.',
        date: '11 Jul 22 03:49 AM',
        read: false,
        isStarred: false,
        label: ['Promotions', 'Forums'],
        avatar: Avatar9,
        mail: 'john@company.com',
        to: 'Sophia Miller',
        attachments: [],
        comments: [
          {
            id: 1,
            from: 'Sophia Miller',
            text: 'Thanks for the reminder. Will the event be recorded?',
            avatar: Avatar3
          }
        ]
      },
      {
        id: 9,
        from: 'Mattie Reid',
        subject: 'Collaboration request',
        snippet: 'I’m reaching out to you with a collaboration request on our new project. Let me know if you are interested.',
        date: '17 Jul 22 03:33 AM',
        read: true,
        isStarred: false,
        avatar: Avatar8,
        mail: 'mattie@company.com',
        to: 'Benjamin Taylor',
        attachments: ['project_brief.pdf'],
        comments: [
          {
            id: 1,
            from: 'Benjamin Taylor',
            text: 'I’m interested! Let’s connect tomorrow to discuss the next steps.',
            avatar: Avatar5
          }
        ]
      },
      {
        id: 10,
        from: 'James Peterson',
        subject: 'Policy updates',
        snippet: 'Important policy changes are being implemented. Review the attached document for details on the new guidelines.',
        date: '13 Jul 22 03:42 PM',
        read: false,
        isStarred: false,
        avatar: Avatar1,
        important: true,
        mail: 'james@company.com',
        to: 'Charlotte Moore',
        attachments: [],
        comments: []
      },
      {
        id: 11,
        from: 'IT Support',
        subject: 'Meeting agenda',
        snippet: 'Please find the agenda for our upcoming meeting. We will be discussing Q3 priorities and team performance.',
        date: '20 Jul 22 04:28 PM',
        read: false,
        isStarred: false,
        avatar: Avatar6,
        mail: 'it@company.com',
        to: 'Mason White',
        attachments: ['meeting_notes.docx', 'presentation_slides.pptx'],
        comments: []
      },
      {
        id: 12,
        from: 'James Peterson',
        subject: 'Team outing details',
        snippet: 'Get ready for our team outing! This email contains all the necessary details, including time, location, and activities.',
        date: '18 Jul 22 08:20 AM',
        read: true,
        isStarred: true,
        label: ['Promotions'],
        avatar: Avatar8,
        mail: 'james@company.com',
        to: 'Amelia Harris',
        attachments: [],
        comments: [
          {
            id: 1,
            from: 'Amelia Harris',
            text: 'I am so excited for the team outing! Is there a vegetarian option for lunch?',
            avatar: Avatar7
          }
        ]
      }
    ],
    promotions: [
      {
        id: 1,
        from: 'Nathaniel Vance',
        subject: 'Collaboration request',
        snippet: 'I’m reaching out to you with a collaboration request on our new project. Let me know if you are interested.',
        date: '12 Jul 22 02:04 PM',
        read: true,
        isStarred: false,
        avatar: Avatar6,
        important: true,
        mail: 'nathaniel@company.com',
        to: 'Evelyn Clark',
        attachments: ['project_proposal.pdf'],
        comments: [
          {
            id: 1,
            from: 'Evelyn Clark',
            text: "I'll take a look at the proposal and let you know my thoughts by tomorrow.",
            avatar: Avatar3
          }
        ]
      },
      {
        id: 2,
        from: 'Nathaniel Vance',
        subject: 'Client feedback summary',
        snippet: 'Here is the summary of the latest client feedback. We will discuss the action plan during our next team meeting.',
        date: '16 Jul 22 09:05 PM',
        read: true,
        isStarred: false,
        avatar: Avatar5,
        mail: 'nathaniel@company.com',
        to: 'Liam Lewis',
        attachments: [],
        comments: [
          {
            id: 1,
            from: 'Liam Lewis',
            text: "I'll review the feedback before our meeting tomorrow. Thanks for the summary!",
            avatar: Avatar1,
            forwarded: {
              from: 'Project Manager',
              fromEmail: 'pm@company.com',
              date: 'Tue, Jul 16, 2022 at 09:00 PM',
              to: 'Nathaniel Vance',
              toEmail: 'nathaniel@company.com',
              body: 'Here is the final client feedback summary for the project. Please share it with the team.'
            }
          }
        ]
      },
      {
        id: 3,
        from: 'David Clark',
        subject: 'Policy updates',
        snippet: 'Important policy changes are being implemented. Review the attached document for details on the new guidelines.',
        date: '20 Jul 22 11:37 AM',
        label: ['Promotions'],
        read: false,
        isStarred: false,
        avatar: Avatar2,
        mail: 'david@company.com',
        to: 'Noah Walker',
        attachments: ['new_policies.pdf'],
        comments: [
          {
            id: 1,
            from: 'Noah Walker',
            text: 'I have read through the new policies. Thank you for the update.',
            avatar: Avatar8
          }
        ]
      },
      {
        id: 4,
        from: 'Amy Smith',
        subject: 'Client feedback summary',
        snippet: 'Here is the summary of the latest client feedback. We will discuss the action plan during our next team meeting.',
        date: '19 Jul 22 02:31 AM',
        read: true,
        isStarred: true,
        avatar: Avatar1,
        mail: 'amy@company.com',
        to: 'Isabella Hall',
        attachments: ['feedback_summary.xlsx'],
        comments: [
          {
            id: 1,
            from: 'Isabella Hall',
            text: 'I’ve added my comments directly in the spreadsheet. Let me know if you have any questions.',
            avatar: Avatar9,
            forwarded: {
              from: 'Client A',
              fromEmail: 'clienta@company.com',
              date: 'Wed, Jul 18, 2022 at 09:00 AM',
              to: 'Amy Smith',
              toEmail: 'amy@company.com',
              body: 'This is the latest feedback from our team. Please review the attached spreadsheet for details.'
            }
          }
        ]
      },
      {
        id: 5,
        from: 'Zachary Chan',
        subject: 'Event reminder',
        snippet: 'Just a friendly reminder about our upcoming event! We look forward to seeing you there.',
        date: '11 Jul 22 07:25 PM',
        read: true,
        isStarred: false,
        avatar: Avatar7,
        important: true,
        mail: 'zachary@company.com',
        to: 'Mia Allen',
        attachments: [],
        comments: []
      },
      {
        id: 6,
        from: 'Nathaniel Vance',
        subject: 'Client feedback summary',
        snippet: 'Here is the summary of the latest client feedback. We will discuss the action plan during our next team meeting.',
        date: '17 Jul 22 03:11 PM',
        label: ['Forums', 'Promotions'],
        read: false,
        isStarred: false,
        avatar: Avatar7,
        mail: 'nathaniel@company.com',
        to: 'Alexander King',
        attachments: [],
        comments: []
      },
      {
        id: 7,
        from: 'IT Support',
        subject: 'Welcome to our newsletter',
        snippet: 'Welcome to our newsletter! Thank you for subscribing. Stay tuned for our latest updates and exclusive offers.',
        date: '11 Jul 22 02:07 PM',
        read: true,
        isStarred: false,
        avatar: Avatar1,
        mail: 'it@company.com',
        to: 'Harper Scott',
        attachments: [],
        comments: []
      },
      {
        id: 8,
        from: 'James Peterson',
        subject: 'Welcome to our newsletter',
        snippet: 'Welcome to our newsletter! Thank you for subscribing. Stay tuned for our latest updates and exclusive offers.',
        date: '12 Jul 22 02:50 AM',
        label: ['Promotions', 'Forums'],
        read: false,
        isStarred: false,
        avatar: Avatar5,
        mail: 'james@company.com',
        to: 'Ella Adams',
        attachments: [],
        comments: []
      }
    ],
    social: [
      {
        id: 1,
        from: 'James Peterson',
        subject: 'Event reminder',
        snippet: 'Just a friendly reminder about our upcoming event! We look forward to seeing you there.',
        date: '17 Jul 22 06:03 PM',
        label: ['Promotions'],
        read: false,
        isStarred: true,
        avatar: Avatar10,
        important: true,
        mail: 'james@company.com',
        to: 'Daniel Evans',
        attachments: [],
        comments: [
          {
            id: 1,
            from: 'Daniel Evans',
            text: "I'm looking forward to it. Is there a dress code?",
            avatar: Avatar5,
            forwarded: {
              from: 'Event Coordinator',
              fromEmail: 'events@company.com',
              date: 'Tue, Jul 17, 2022 at 05:50 PM',
              to: 'James Peterson',
              toEmail: 'james@company.com',
              body: 'Just a final reminder for the event tomorrow. Please forward this to all attendees.'
            }
          },
          {
            id: 2,
            from: 'James Peterson',
            text: 'The dress code is business casual. See you there!',
            avatar: Avatar10
          }
        ]
      },
      {
        id: 2,
        from: 'Amy Smith',
        subject: 'Event reminder',
        snippet: 'Just a friendly reminder about our upcoming event! We look forward to seeing you there.',
        date: '15 Jul 22 04:58 AM',
        read: true,
        isStarred: false,
        avatar: Avatar2,
        mail: 'amy@company.com',
        to: 'Scarlett Wright',
        attachments: [],
        comments: []
      },
      {
        id: 3,
        from: 'Anna George',
        subject: 'Collaboration request',
        snippet: 'I’m reaching out to you with a collaboration request on our new project. Let me know if you are interested.',
        date: '14 Jul 22 02:47 AM',
        read: false,
        isStarred: false,
        avatar: Avatar7,
        mail: 'anna@company.com',
        to: 'Jackson Green',
        attachments: ['project_overview.pdf'],
        comments: [
          {
            id: 1,
            from: 'Jackson Green',
            text: 'I’ve taken a look and it seems like an interesting opportunity. What are the next steps?',
            avatar: Avatar5
          }
        ]
      },
      {
        id: 4,
        from: 'Peter Jones',
        subject: 'Event reminder',
        snippet: 'Just a friendly reminder about our upcoming event! We look forward to seeing you there.',
        date: '16 Jul 22 05:03 PM',
        read: true,
        isStarred: false,
        avatar: Avatar3,
        mail: 'peter@company.com',
        to: 'Grace Hill',
        attachments: [],
        comments: []
      },
      {
        id: 5,
        from: 'IT Support',
        subject: 'Client feedback summary',
        snippet: 'Here is the summary of the latest client feedback. We will discuss the action plan during our next team meeting.',
        date: '13 Jul 22 07:58 PM',
        read: false,
        isStarred: false,
        avatar: Avatar10,
        mail: 'it@company.com',
        to: 'Lucas Turner',
        attachments: ['client_feedback_report.docx'],
        comments: []
      },
      {
        id: 6,
        from: 'Mattie Reid',
        subject: 'Collaboration request',
        snippet: 'I’m reaching out to you with a collaboration request on our new project. Let me know if you are interested.',
        date: '20 Jul 22 05:05 AM',
        read: true,
        isStarred: true,
        avatar: Avatar3,
        important: true,
        mail: 'mattie@company.com',
        to: 'Lily Baker',
        attachments: [],
        comments: [
          {
            id: 1,
            from: 'Lily Baker',
            text: 'I’m happy to help. Let’s set up a time to chat about the project requirements.',
            avatar: Avatar8,
            forwarded: {
              from: 'Barney Thea',
              fromEmail: 'tazeanu@company.com',
              date: 'Tue, Nov 1, 2022 at 12:05 AM',
              to: 'Sreekumar Ks',
              toEmail: 'tazeanu@company.com',
              body: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.'
            }
          }
        ]
      },
      {
        id: 7,
        from: 'Nathaniel Vance',
        subject: 'Team outing details',
        snippet: 'Get ready for our team outing! This email contains all the necessary details, including time, location, and activities.',
        date: '18 Jul 22 08:33 AM',
        read: true,
        isStarred: false,
        label: ['Forums'],
        avatar: Avatar10,
        mail: 'nathaniel@company.com',
        to: 'Avery Mitchell',
        attachments: ['outing_map.jpg', 'schedule.pdf'],
        comments: [
          {
            id: 1,
            from: 'Avery Mitchell',
            text: "The map is very helpful, thank you! I've marked it on my calendar.",
            avatar: Avatar6
          }
        ]
      },
      {
        id: 8,
        from: 'Peter Jones',
        subject: 'Welcome to our newsletter',
        snippet: 'Welcome to our newsletter! Thank you for subscribing. Stay tuned for our latest updates and exclusive offers.',
        date: '15 Jul 22 09:36 PM',
        read: false,
        isStarred: false,
        avatar: Avatar2,
        mail: 'peter@company.com',
        to: 'Zoe Cooper',
        attachments: [],
        comments: []
      },
      {
        id: 9,
        from: 'Mattie Reid',
        subject: 'Welcome to our newsletter',
        snippet: 'Welcome to our newsletter! Thank you for subscribing. Stay tuned for our latest updates and exclusive offers.',
        date: '17 Jul 22 04:24 AM',
        read: false,
        isStarred: false,
        avatar: Avatar8,
        mail: 'mattie@company.com',
        to: 'Carter Reed',
        attachments: [],
        comments: []
      },
      {
        id: 10,
        from: 'Mattie Reid',
        subject: 'Weekly report submission',
        snippet:
          'This is a reminder to submit your weekly report. Please make sure to include your progress and any blockers you’ve encountered.',
        date: '16 Jul 22 12:00 PM',
        read: true,
        isStarred: false,
        label: ['Promotions', 'Forums'],
        avatar: Avatar6,
        important: true,
        mail: 'mattie@company.com',
        to: 'Luna Bailey',
        attachments: ['weekly_report.pdf'],
        comments: [
          {
            id: 1,
            from: 'Luna Bailey',
            text: 'I have attached my report. Let me know if you need any further information.',
            avatar: Avatar4
          }
        ]
      },
      {
        id: 11,
        from: 'James Peterson',
        subject: 'Your order confirmation',
        snippet: 'Thank you for your recent purchase! Your order #[ORDER_ID] has been confirmed and will be shipped shortly.',
        date: '16 Jul 22 04:54 PM',
        read: true,
        isStarred: false,
        avatar: Avatar7,
        mail: 'james@company.com',
        to: 'Logan Foster',
        attachments: [],
        comments: [
          {
            id: 1,
            from: 'Logan Foster',
            text: 'Can you please provide a tracking number for my order?',
            avatar: Avatar3
          }
        ]
      }
    ],
    updates: [
      {
        id: 1,
        from: 'Nathaniel Vance',
        subject: 'Team outing details',
        snippet: 'Get ready for our team outing! This email contains all the necessary details, including time, location, and activities.',
        date: '13 Jul 22 10:30 AM',
        read: true,
        isStarred: false,
        label: ['Promotions'],
        avatar: Avatar2,
        mail: 'nathaniel@company.com',
        to: 'Hannah Peterson',
        attachments: ['outing_info.pdf'],
        comments: [
          {
            id: 1,
            from: 'Hannah Peterson',
            text: 'Thanks for the details! Is there a deadline to RSVP?',
            avatar: Avatar1,
            forwarded: {
              from: 'Event Planning Team',
              fromEmail: 'events.team@company.com',
              date: 'Sat, Jul 13, 2022 at 10:00 AM',
              to: 'Nathaniel Vance',
              toEmail: 'nathaniel@company.com',
              body: 'Here are the final details for the upcoming team outing. Please forward this to all participants.'
            }
          }
        ]
      },
      {
        id: 2,
        from: 'Nathaniel Vance',
        subject: 'Collaboration request',
        snippet: 'I’m reaching out to you with a collaboration request on our new project. Let me know if you are interested.',
        date: '17 Jul 22 08:26 AM',
        read: false,
        isStarred: true,
        avatar: Avatar3,
        mail: 'nathaniel@company.com',
        to: 'Julian Bell',
        attachments: [],
        comments: [
          {
            id: 1,
            from: 'Julian Bell',
            text: "I'd love to collaborate on the project. Let's schedule a brief to discuss the scope.",
            avatar: Avatar5
          }
        ]
      },
      {
        id: 3,
        from: 'James Peterson',
        subject: 'Welcome to our newsletter',
        snippet: 'Welcome to our newsletter! Thank you for subscribing. Stay tuned for our latest updates and exclusive offers.',
        date: '18 Jul 22 12:28 AM',
        read: false,
        isStarred: false,
        avatar: Avatar3,
        label: ['Forums', 'Promotions'],
        mail: 'james@company.com',
        to: 'Victoria Scott',
        attachments: [],
        comments: []
      },
      {
        id: 4,
        from: 'Amy Smith',
        subject: 'Welcome to our newsletter',
        snippet: 'Welcome to our newsletter! Thank you for subscribing. Stay tuned for our latest updates and exclusive offers.',
        date: '10 Jul 22 03:08 PM',
        read: true,
        isStarred: true,
        avatar: Avatar9,
        mail: 'amy@company.com',
        to: 'Jack Turner',
        attachments: [],
        comments: []
      },
      {
        id: 5,
        from: 'Nathaniel Vance',
        subject: 'Collaboration request',
        snippet: 'I’m reaching out to you with a collaboration request on our new project. Let me know if you are interested.',
        date: '16 Jul 22 06:17 AM',
        read: true,
        isStarred: false,
        important: true,
        avatar: Avatar6,
        mail: 'nathaniel@company.com',
        to: 'Gabriel Martinez',
        attachments: ['proposal_summary.pdf'],
        comments: [
          {
            id: 1,
            from: 'Gabriel Martinez',
            text: "The proposal looks interesting. I'll get back to you with my availability for a kick-off meeting.",
            avatar: Avatar4
          }
        ]
      },
      {
        id: 6,
        from: 'Nathaniel Vance',
        subject: 'Salary credit notification',
        snippet: 'Your salary has been credited to your account. You can view the details on the employee portal.',
        date: '15 Jul 22 09:25 AM',
        read: false,
        isStarred: false,
        avatar: Avatar5,
        label: ['Forums'],
        mail: 'nathaniel@company.com',
        to: 'Aria Wright',
        attachments: ['pay_stub.pdf'],
        comments: [
          {
            id: 1,
            from: 'Aria Wright',
            text: 'Thank you for the update! My salary has been credited correctly.',
            avatar: Avatar2,
            forwarded: {
              from: 'Finance Department',
              fromEmail: 'finance.dept@company.com',
              date: 'Mon, Jul 15, 2022 at 09:00 AM',
              to: 'Nathaniel Vance',
              toEmail: 'nathaniel@company.com',
              body: 'Salary payments have been processed successfully for all employees.'
            }
          }
        ]
      },
      {
        id: 7,
        from: 'Zachary Chan',
        subject: 'Your order confirmation',
        snippet: 'Thank you for your recent purchase! Your order #[ORDER_ID] has been confirmed and will be shipped shortly.',
        date: '10 Jul 22 10:20 AM',
        read: true,
        isStarred: false,
        avatar: Avatar1,
        important: true,
        mail: 'zachary@company.com',
        to: 'Leo Green',
        attachments: [],
        comments: []
      }
    ],
    announcement: [
      {
        id: 1,
        from: 'Nathaniel Vance',
        subject: 'Welcome to our newsletter',
        snippet: 'Welcome to our newsletter! Thank you for subscribing. Stay tuned for our latest updates and exclusive offers.',
        date: '10 Jul 22 02:02 PM',
        read: false,
        isStarred: true,
        avatar: Avatar10,
        important: true,
        label: ['Forums', 'Promotions'],
        mail: 'nathaniel@company.com',
        to: 'Nora Hall',
        attachments: [],
        comments: []
      },
      {
        id: 2,
        from: 'Barney Thea',
        subject: 'Welcome to our newsletter',
        snippet: 'Welcome to our newsletter! Thank you for subscribing. Stay tuned for our latest updates and exclusive offers.',
        date: '15 Jul 22 08:48 PM',
        read: true,
        isStarred: false,
        avatar: Avatar6,
        mail: 'barney@company.com',
        to: 'Caleb Evans',
        attachments: [],
        comments: []
      },
      {
        id: 3,
        from: 'Anna George',
        subject: 'Invoice payment received',
        snippet: 'Great news! Your invoice has been paid. We appreciate your business and look forward to working with you again.',
        date: '20 Jul 22 09:31 AM',
        read: false,
        isStarred: false,
        avatar: Avatar10,
        mail: 'anna@company.com',
        to: 'Chloe King',
        attachments: ['invoice_details.pdf'],
        comments: [
          {
            id: 1,
            from: 'Chloe King',
            text: 'Thank you for confirming. I have updated my records.',
            avatar: Avatar2
          }
        ]
      },
      {
        id: 4,
        from: 'Zachary Chan',
        subject: 'Collaboration request',
        snippet: 'I’m reaching out to you with a collaboration request on our new project. Let me know if you are interested.',
        date: '12 Jul 22 12:27 PM',
        read: true,
        isStarred: false,
        avatar: Avatar1,
        mail: 'zachary@company.com',
        to: 'Isaac Moore',
        attachments: ['project_brief.docx', 'project_timeline.xlsx'],
        comments: [
          {
            id: 1,
            from: 'Isaac Moore',
            text: 'I’ve reviewed the brief and timeline. I have a few suggestions for the timeline, can we talk about them tomorrow?',
            avatar: Avatar3,
            forwarded: {
              from: 'Team Manager',
              fromEmail: 'manager@company.com',
              date: 'Fri, Jul 12, 2022 at 12:00 PM',
              to: 'Zachary Chan',
              toEmail: 'zachary@company.com',
              body: 'Please forward the collaboration request to Isaac and the rest of the team for their feedback.'
            }
          },
          {
            id: 2,
            from: 'Zachary Chan',
            text: "Let's set up a call for tomorrow morning at 10 AM. I'll send a calendar invite.",
            avatar: Avatar1
          }
        ]
      },
      {
        id: 5,
        from: 'Zachary Chan',
        subject: 'Your order confirmation',
        snippet: 'Thank you for your recent purchase! Your order #[ORDER_ID] has been confirmed and will be shipped shortly.',
        date: '16 Jul 22 05:51 AM',
        read: false,
        isStarred: false,
        avatar: Avatar5,
        mail: 'zachary@company.com',
        to: 'Stella Adams',
        attachments: [],
        comments: [
          {
            id: 1,
            from: 'Stella Adams',
            text: 'Thank you for the order confirmation! Can you provide an estimated delivery date?',
            avatar: Avatar4
          }
        ]
      },
      {
        id: 6,
        from: 'Barney Thea',
        subject: 'Welcome to our newsletter',
        snippet: 'Welcome to our newsletter! Thank you for subscribing. Stay tuned for our latest updates and exclusive offers.',
        date: '14 Jul 22 11:11 AM',
        read: true,
        isStarred: true,
        avatar: Avatar2,
        important: true,
        label: ['Forums'],
        mail: 'barney@company.com',
        to: 'Elijah Brown',
        attachments: [],
        comments: []
      },
      {
        id: 7,
        from: 'John Walker',
        subject: 'Welcome to our newsletter',
        snippet: 'Welcome to our newsletter! Thank you for subscribing. Stay tuned for our latest updates and exclusive offers.',
        date: '16 Jul 22 01:51 PM',
        read: false,
        isStarred: false,
        avatar: Avatar6,
        mail: 'john@company.com',
        to: 'Penelope Wilson',
        attachments: [],
        comments: []
      },
      {
        id: 8,
        from: 'David Clark',
        subject: 'Weekly report submission',
        snippet:
          'This is a reminder to submit your weekly report. Please make sure to include your progress and any blockers you’ve encountered.',
        date: '17 Jul 22 06:05 AM',
        read: true,
        isStarred: false,
        avatar: Avatar5,
        mail: 'david@company.com',
        to: 'Wyatt Johnson',
        attachments: ['weekly_progress.docx'],
        comments: [
          {
            id: 1,
            from: 'Wyatt Johnson',
            text: 'I’ll submit my report by the end of the day. Thanks for the reminder.',
            avatar: Avatar8,
            forwarded: {
              from: 'Team Lead',
              fromEmail: 'lead@company.com',
              date: 'Wed, Jul 17, 2022 at 06:00 AM',
              to: 'David Clark',
              toEmail: 'david.clark@company.com',
              body: 'A reminder has been sent to the team regarding the weekly reports. Please ensure all submissions are complete.'
            }
          }
        ]
      }
    ]
  },
  sent: [
    {
      id: 1,
      from: 'Anna George',
      subject: 'Salary credit notification',
      snippet: 'Your salary has been credited to your account. You can view the details on the employee portal.',
      date: '20 Jul 22 09:47 AM',
      read: true,
      isStarred: false,
      avatar: Avatar10,
      mail: 'anna@company.com',
      to: 'Grace Davis',
      attachments: [],
      comments: [
        {
          id: 1,
          from: 'Grace Davis',
          text: "Thanks for the heads-up! I've checked and confirmed receipt.",
          avatar: Avatar4
        }
      ]
    },
    {
      id: 2,
      from: 'HR Department',
      subject: 'Salary credit notification',
      snippet: 'Your salary has been credited to your account. You can view the details on the employee portal.',
      date: '10 Jul 22 11:57 AM',
      read: false,
      isStarred: true,
      avatar: Avatar6,
      important: true,
      mail: 'hr@company.com',
      to: 'Adam Miller',
      attachments: ['salary_details.pdf'],
      comments: [
        {
          id: 1,
          from: 'Adam Miller',
          text: 'Thanks for the quick response. I’ve checked the details, and everything looks correct.',
          avatar: Avatar5,
          forwarded: {
            from: 'Finance Team',
            fromEmail: 'finance@company.com',
            date: 'Tue, Jul 10, 2022 at 11:30 AM',
            to: 'HR Department',
            toEmail: 'hr@company.com',
            body: 'The salary credit has been processed for all employees.'
          }
        }
      ]
    },
    {
      id: 3,
      from: 'Amy Smith',
      subject: 'Welcome to our newsletter',
      snippet: 'Welcome to our newsletter! Thank you for subscribing. Stay tuned for our latest updates and exclusive offers.',
      date: '20 Jul 22 04:53 PM',
      read: true,
      isStarred: false,
      avatar: Avatar1,
      label: ['Forums'],
      mail: 'amy@company.com',
      to: 'Madison Taylor',
      attachments: [],
      comments: [
        {
          id: 1,
          from: 'Madison Taylor',
          text: 'Thanks, looking forward to reading the newsletter!',
          avatar: Avatar6
        }
      ]
    },
    {
      id: 4,
      from: 'Barney Thea',
      subject: 'Team outing details',
      snippet: 'Get ready for our team outing! This email contains all the necessary details, including time, location, and activities.',
      date: '20 Jul 22 01:34 AM',
      read: true,
      isStarred: false,
      avatar: Avatar3,
      mail: 'barney@company.com',
      to: 'Abigail White',
      attachments: ['outing_flyer.pdf'],
      comments: []
    },
    {
      id: 5,
      from: 'IT Support',
      subject: 'Event reminder',
      snippet: 'Just a friendly reminder about our upcoming event! We look forward to seeing you there.',
      date: '13 Jul 22 12:03 AM',
      read: true,
      isStarred: true,
      avatar: Avatar8,
      label: ['Forums', 'Promotions'],
      mail: 'it@company.com',
      to: 'Henry Wilson',
      attachments: [],
      comments: [
        {
          id: 1,
          from: 'Henry Wilson',
          text: 'Got it. Thanks for the reminder.',
          avatar: Avatar1
        }
      ]
    }
  ],
  draft: [
    {
      id: 1,
      from: 'James Peterson',
      subject: 'Client feedback summary',
      snippet: 'Here is the summary of the latest client feedback. We will discuss the action plan during our next team meeting.',
      date: '14 Jul 22 05:11 PM',
      read: true,
      isStarred: false,
      important: false,
      avatar: Avatar6,
      mail: 'james@company.com',
      to: 'Ella Anderson',
      attachments: ['feedback_report.docx'],
      comments: [
        {
          id: 1,
          from: 'Ella Anderson',
          text: 'I’ll review this and send over my thoughts on the action plan.',
          avatar: Avatar7,
          forwarded: {
            from: 'Client A',
            fromEmail: 'clienta@company.com',
            date: 'Wed, Nov 2, 2022 at 10:00 AM',
            to: 'Ella Anderson',
            toEmail: 'ella.anderson@company.com',
            body: "Here's the initial feedback on the project proposal. Let me know if you need any clarification."
          }
        }
      ]
    },
    {
      id: 2,
      from: 'HR Department',
      subject: 'Event reminder',
      snippet: 'Just a friendly reminder about our upcoming event! We look forward to seeing you there.',
      date: '12 Jul 22 12:37 PM',
      read: false,
      isStarred: true,
      avatar: Avatar8,
      mail: 'hr@company.com',
      to: 'Ryan King',
      attachments: [],
      comments: []
    },
    {
      id: 3,
      from: 'Nathaniel Vance',
      subject: 'Your order confirmation',
      snippet: 'Thank you for your recent purchase! Your order #[ORDER_ID] has been confirmed and will be shipped shortly.',
      date: '14 Jul 22 10:44 AM',
      read: false,
      isStarred: false,
      avatar: Avatar4,
      mail: 'nathaniel@company.com',
      to: 'Chloe Harris',
      attachments: [],
      comments: []
    },
    {
      id: 4,
      from: 'Mattie Reid',
      subject: 'Event reminder',
      snippet: 'Just a friendly reminder about our upcoming event! We look forward to seeing you there.',
      date: '12 Jul 22 09:14 AM',
      read: true,
      isStarred: false,
      avatar: Avatar7,
      label: ['Promotions'],
      mail: 'mattie@company.com',
      to: 'Sebastian Hall',
      attachments: [],
      comments: []
    },
    {
      id: 5,
      from: 'Barney Thea',
      subject: 'Your order confirmation',
      snippet: 'Thank you for your recent purchase! Your order #[ORDER_ID] has been confirmed and will be shipped shortly.',
      date: '11 Jul 22 09:22 AM',
      read: false,
      isStarred: false,
      avatar: Avatar4,
      mail: 'barney@company.com',
      to: 'Mia Miller',
      attachments: [],
      comments: []
    },
    {
      id: 6,
      from: 'Zachary Chan',
      subject: 'Your order confirmation',
      snippet: 'Thank you for your recent purchase! Your order #[ORDER_ID] has been confirmed and will be shipped shortly.',
      date: '12 Jul 22 01:23 PM',
      read: true,
      isStarred: true,
      avatar: Avatar7,
      mail: 'zachary@company.com',
      to: 'Eleanor Davis',
      attachments: ['order_receipt.pdf'],
      comments: [
        {
          id: 1,
          from: 'Eleanor Davis',
          text: 'Thanks for the confirmation! The receipt looks correct.',
          avatar: Avatar8
        }
      ]
    },
    {
      id: 7,
      from: 'HR Department',
      subject: 'Meeting agenda',
      snippet: 'Please find the agenda for our upcoming meeting. We will be discussing Q3 priorities and team performance.',
      date: '20 Jul 22 03:57 AM',
      read: true,
      isStarred: false,
      avatar: Avatar2,
      mail: 'hr@company.com',
      to: 'Jack Wilson',
      attachments: [],
      comments: [
        {
          id: 1,
          from: 'Jack Wilson',
          text: "I'll be sure to attend the meeting. Thanks for the agenda.",
          avatar: Avatar1
        }
      ]
    },
    {
      id: 8,
      from: 'Amy Smith',
      subject: 'Welcome to our newsletter',
      snippet: 'Welcome to our newsletter! Thank you for subscribing. Stay tuned for our latest updates and exclusive offers.',
      date: '12 Jul 22 05:31 PM',
      read: false,
      isStarred: false,
      avatar: Avatar10,
      important: true,
      label: ['Forums', 'Promotions'],
      mail: 'amy@company.com',
      to: 'Layla Clark',
      attachments: [],
      comments: []
    },
    {
      id: 9,
      from: 'HR Department',
      subject: 'Invoice payment received',
      snippet: 'Great news! Your invoice has been paid. We appreciate your business and look forward to working with you again.',
      date: '19 Jul 22 03:30 AM',
      read: true,
      isStarred: false,
      avatar: Avatar8,
      mail: 'hr@company.com',
      to: 'Owen Taylor',
      attachments: [],
      comments: []
    },
    {
      id: 10,
      from: 'Amy Smith',
      subject: 'Weekly report submission',
      snippet:
        'This is a reminder to submit your weekly report. Please make sure to include your progress and any blockers you’ve encountered.',
      date: '17 Jul 22 04:37 PM',
      read: true,
      isStarred: false,
      avatar: Avatar8,
      mail: 'amy@company.com',
      to: 'Paisley Evans',
      attachments: ['report_data.pdf'],
      comments: [
        {
          id: 1,
          from: 'Paisley Evans',
          text: 'I’ve submitted my report. Let me know if you need any clarification on the numbers.',
          avatar: Avatar6,
          forwarded: {
            from: 'Colleague B',
            fromEmail: 'colleagueb@company.com',
            date: 'Wed, Jul 17, 2022 at 04:00 PM',
            to: 'Amy Smith',
            toEmail: 'amy@company.com',
            body: 'Hey, just wanted to share the progress on the latest project. Let me know if you have any questions.'
          }
        }
      ]
    }
  ],
  spam: [],
  trash: [
    {
      id: 1,
      from: 'John Walker',
      subject: 'Team outing details',
      snippet: 'Get ready for our team outing! This email contains all the necessary details, including time, location, and activities.',
      date: '10 Jul 22 07:35 PM',
      read: true,
      isStarred: false,
      avatar: Avatar7,
      mail: 'john@company.com',
      to: 'David Johnson',
      attachments: [],
      comments: [
        {
          id: 1,
          from: 'David Johnson',
          text: "Thanks for the details. I'll bring my camera for some team photos!",
          avatar: Avatar5
        }
      ]
    },
    {
      id: 2,
      from: 'James Peterson',
      subject: 'Invoice payment received',
      snippet: 'Great news! Your invoice has been paid. We appreciate your business and look forward to working with you again.',
      date: '15 Jul 22 07:26 PM',
      read: false,
      isStarred: true,
      avatar: Avatar9,
      mail: 'james@company.com',
      to: 'Sophia Smith',
      attachments: ['payment_receipt.pdf'],
      comments: [
        {
          id: 1,
          from: 'Sophia Smith',
          text: 'This is a duplicate of a previous invoice. I will follow up with finance to resolve this.',
          avatar: Avatar2,
          forwarded: {
            from: 'Finance Department',
            fromEmail: 'finance@company.com',
            date: 'Mon, Jul 15, 2022 at 07:15 PM',
            to: 'James Peterson',
            toEmail: 'james@company.com',
            body: 'We have received a payment for invoice #[INVOICE_ID].'
          }
        }
      ]
    },
    {
      id: 3,
      from: 'James Peterson',
      subject: 'Meeting agenda',
      snippet: 'Please find the agenda for our upcoming meeting. We will be discussing Q3 priorities and team performance.',
      date: '19 Jul 22 04:13 AM',
      read: false,
      isStarred: false,
      avatar: Avatar5,
      label: ['Promotions'],
      mail: 'james@company.com',
      to: 'Benjamin Miller',
      attachments: ['meeting_minutes.docx'],
      comments: [
        {
          id: 1,
          from: 'Benjamin Miller',
          text: 'These minutes look correct. Thanks for sending them over.',
          avatar: Avatar4
        }
      ]
    },
    {
      id: 4,
      from: 'David Clark',
      subject: 'Invoice payment received',
      snippet: 'Great news! Your invoice has been paid. We appreciate your business and look forward to working with you again.',
      date: '15 Jul 22 04:21 AM',
      read: false,
      isStarred: false,
      avatar: Avatar5,
      label: ['Forums', 'Promotions'],
      mail: 'david@company.com',
      to: 'Olivia Brown',
      attachments: [],
      comments: []
    },
    {
      id: 5,
      from: 'James Peterson',
      subject: 'Your order confirmation',
      snippet: 'Thank you for your recent purchase! Your order #[ORDER_ID] has been confirmed and will be shipped shortly.',
      date: '19 Jul 22 08:07 PM',
      read: true,
      isStarred: true,
      important: true,
      avatar: Avatar1,
      mail: 'james@company.com',
      to: 'Ethan Davis',
      attachments: [],
      comments: []
    },
    {
      id: 6,
      from: 'Mattie Reid',
      subject: 'Client feedback summary',
      snippet: 'Here is the summary of the latest client feedback. We will discuss the action plan during our next team meeting.',
      date: '17 Jul 22 02:48 PM',
      read: false,
      isStarred: false,
      avatar: Avatar5,
      mail: 'mattie@company.com',
      to: 'Ava Johnson',
      attachments: ['feedback_summary_report.pdf'],
      comments: [
        {
          id: 1,
          from: 'Ava Johnson',
          text: "I'll take a look at the report. Do you want me to share this with the rest of the team?",
          avatar: Avatar7
        }
      ]
    }
  ]
};
