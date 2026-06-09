export interface Message {
  id: string;
  from: "instructor" | "student";
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  studentName: string;
  studentAvatar: string;
  course: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  starred: boolean;
  online: boolean;
  messages: Message[];
}

export const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    studentName: "Amelia Watson",
    studentAvatar: "AW",
    course: "UI/UX Design Mastery",
    lastMessage: "Thank you so much! That really cleared things up.",
    lastTime: "2m ago",
    unread: 2,
    starred: true,
    online: true,
    messages: [
      { id: "m1", from: "student", text: "Hi! I'm having trouble with the Figma auto-layout section in Module 3.", time: "10:12" },
      { id: "m2", from: "instructor", text: "Hey Amelia! Auto-layout can be tricky at first. Which part specifically — direction, spacing, or the nested frames?", time: "10:15" },
      { id: "m3", from: "student", text: "The nested frames part. I keep getting unexpected padding.", time: "10:18" },
      { id: "m4", from: "instructor", text: "Ah, classic issue! When you nest a frame inside an auto-layout, the inner frame's own padding adds on top. Try setting the inner frame's padding to 0 and control spacing only from the parent.", time: "10:21" },
      { id: "m5", from: "student", text: "That worked perfectly! I can't believe it was that simple 😄", time: "10:24" },
      { id: "m6", from: "student", text: "Thank you so much! That really cleared things up.", time: "10:25" },
    ],
  },
  {
    id: "c2",
    studentName: "James Rivera",
    studentAvatar: "JR",
    course: "React & Next.js Bootcamp",
    lastMessage: "When will the new module on Server Actions be released?",
    lastTime: "1h ago",
    unread: 1,
    starred: false,
    online: true,
    messages: [
      { id: "m1", from: "student", text: "Love the course so far! Just finished the App Router section.", time: "09:05" },
      { id: "m2", from: "instructor", text: "Great to hear, James! That section has the most updates — glad it's landing well.", time: "09:10" },
      { id: "m3", from: "student", text: "When will the new module on Server Actions be released?", time: "09:30" },
    ],
  },
  {
    id: "c3",
    studentName: "Sofia Nguyen",
    studentAvatar: "SN",
    course: "Figma for Beginners",
    lastMessage: "Got it, I'll re-watch that lesson tonight.",
    lastTime: "3h ago",
    unread: 0,
    starred: true,
    online: false,
    messages: [
      { id: "m1", from: "student", text: "Is there a keyboard shortcut for creating components?", time: "08:00" },
      { id: "m2", from: "instructor", text: "Yes! Select the layer then hit Ctrl+Alt+K (or ⌘⌥K on Mac). Works on any frame or group.", time: "08:05" },
      { id: "m3", from: "student", text: "Got it, I'll re-watch that lesson tonight.", time: "08:10" },
    ],
  },
  {
    id: "c4",
    studentName: "Liam Park",
    studentAvatar: "LP",
    course: "Advanced CSS Techniques",
    lastMessage: "The grid challenge at the end was mind-bending 😅",
    lastTime: "Yesterday",
    unread: 0,
    starred: false,
    online: false,
    messages: [
      { id: "m1", from: "student", text: "Just finished Module 2! The grid challenge at the end was mind-bending 😅", time: "14:22" },
      { id: "m2", from: "instructor", text: "Haha that's intentional — but you got through it! Try the bonus challenge if you want more practice.", time: "14:45" },
    ],
  },
  {
    id: "c5",
    studentName: "Mei Chen",
    studentAvatar: "MC",
    course: "Product Design Principles",
    lastMessage: "I submitted my project. Can you review it when you get a chance?",
    lastTime: "Yesterday",
    unread: 3,
    starred: false,
    online: false,
    messages: [
      { id: "m1", from: "student", text: "Hi! I submitted my project. Can you review it when you get a chance?", time: "16:10" },
      { id: "m2", from: "student", text: "It's the redesign brief from Module 5.", time: "16:11" },
      { id: "m3", from: "student", text: "No rush — just wanted to flag it!", time: "16:15" },
    ],
  },
  {
    id: "c6",
    studentName: "Carlos Mendez",
    studentAvatar: "CM",
    course: "UI/UX Design Mastery",
    lastMessage: "Makes sense now. Thanks for the quick reply!",
    lastTime: "2d ago",
    unread: 0,
    starred: false,
    online: false,
    messages: [
      { id: "m1", from: "student", text: "Quick question — what's the difference between a style and a variable in Figma?", time: "11:00" },
      { id: "m2", from: "instructor", text: "Great question! Styles are static values (a specific color or text style). Variables are dynamic — they can change based on mode (e.g. light/dark) and are used in tokens.", time: "11:05" },
      { id: "m3", from: "student", text: "Makes sense now. Thanks for the quick reply!", time: "11:08" },
    ],
  },
];
