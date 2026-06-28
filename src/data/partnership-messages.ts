export interface PartnerMessage {
  id: string;
  from: "me" | "partner";
  text: string;
  time: string;
}

export interface PartnerConversation {
  id: string;
  name: string;
  initials: string;
  organization: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  starred: boolean;
  online: boolean;
  messages: PartnerMessage[];
}

export const PARTNER_CONVERSATIONS: PartnerConversation[] = [
  {
    id: "p1",
    name: "Rachel Morgan",
    initials: "RM",
    organization: "TechCorp International",
    lastMessage: "We're ready to sign the enterprise agreement.",
    lastTime: "2m ago",
    unread: 2,
    starred: true,
    online: true,
    messages: [
      { id: "m1", from: "partner", text: "Hi! We've reviewed the proposal for the Enterprise Training Bundle.", time: "10:10" },
      { id: "m2", from: "me", text: "Great to hear! Any questions on the pricing or course structure?", time: "10:13" },
      { id: "m3", from: "partner", text: "The pricing looks good. We'd like to add 2 more cohorts to the Q3 plan.", time: "10:20" },
      { id: "m4", from: "me", text: "Absolutely, I'll update the proposal and send a revised version by EOD.", time: "10:24" },
      { id: "m5", from: "partner", text: "Perfect. We're ready to sign the enterprise agreement.", time: "10:26" },
      { id: "m6", from: "partner", text: "We're ready to sign the enterprise agreement.", time: "10:26" },
    ],
  },
  {
    id: "p2",
    name: "Dr. Lena Fischer",
    initials: "LF",
    organization: "Greenfield University",
    lastMessage: "When can we schedule the onboarding call?",
    lastTime: "1h ago",
    unread: 1,
    starred: false,
    online: true,
    messages: [
      { id: "m1", from: "partner", text: "We've just approved the Academic Partnership proposal internally.", time: "09:00" },
      { id: "m2", from: "me", text: "Wonderful news! Congratulations to the team. Let's get the onboarding started.", time: "09:05" },
      { id: "m3", from: "partner", text: "When can we schedule the onboarding call?", time: "09:30" },
    ],
  },
  {
    id: "p3",
    name: "Marcus Webb",
    initials: "MW",
    organization: "Apex Solutions",
    lastMessage: "We'd like to revisit the proposal next quarter.",
    lastTime: "3h ago",
    unread: 0,
    starred: true,
    online: false,
    messages: [
      { id: "m1", from: "partner", text: "Thanks for sending over the SMB Skills Bundle details.", time: "08:00" },
      { id: "m2", from: "me", text: "Of course! Happy to answer any questions.", time: "08:10" },
      { id: "m3", from: "partner", text: "Budget is tight right now. We'd like to revisit the proposal next quarter.", time: "08:20" },
      { id: "m4", from: "me", text: "Completely understood. I'll follow up in October — good luck with Q3!", time: "08:25" },
    ],
  },
  {
    id: "p4",
    name: "Priya Nair",
    initials: "PN",
    organization: "NovaTech Partners",
    lastMessage: "Commission for June has been processed on our end.",
    lastTime: "Yesterday",
    unread: 0,
    starred: false,
    online: false,
    messages: [
      { id: "m1", from: "partner", text: "Just checking in on the FinTech Leadership Dev cohort. All 22 learners are active!", time: "14:00" },
      { id: "m2", from: "me", text: "Excellent! The completion rate for that cohort is tracking at 91% so far.", time: "14:10" },
      { id: "m3", from: "partner", text: "Commission for June has been processed on our end.", time: "14:30" },
    ],
  },
  {
    id: "p5",
    name: "James Okafor",
    initials: "JO",
    organization: "Bright Future NGO",
    lastMessage: "Can we get a custom pricing plan for non-profits?",
    lastTime: "Yesterday",
    unread: 3,
    starred: false,
    online: false,
    messages: [
      { id: "m1", from: "partner", text: "We loved the webinar on Clinical Data Management!", time: "16:00" },
      { id: "m2", from: "partner", text: "Our team of 15 would like to enroll in the next cohort.", time: "16:02" },
      { id: "m3", from: "partner", text: "Can we get a custom pricing plan for non-profits?", time: "16:05" },
    ],
  },
  {
    id: "p6",
    name: "Sofia Reyes",
    initials: "SR",
    organization: "Elevate Corp",
    lastMessage: "Thanks for the quick turnaround on the revised proposal!",
    lastTime: "2d ago",
    unread: 0,
    starred: false,
    online: false,
    messages: [
      { id: "m1", from: "me", text: "Hi Sofia, here's the revised proposal with the updated cohort schedule.", time: "11:00" },
      { id: "m2", from: "partner", text: "This looks great. The timeline works perfectly for our Q4 rollout.", time: "11:20" },
      { id: "m3", from: "partner", text: "Thanks for the quick turnaround on the revised proposal!", time: "11:22" },
    ],
  },
];
