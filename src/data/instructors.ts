import image1 from "@/assets/images/instructors/image1.webp";
import image2 from "@/assets/images/instructors/image2.webp";
import image3 from "@/assets/images/instructors/image3.webp";
import image4 from "@/assets/images/instructors/image4.webp";
import { StaticImageData } from "next/image";

export type Instructor = {
  slug: string;
  name: string;
  role: string;
  subtitle: string;
  image: StaticImageData;
  about: string;
  experience: string;
  rating: string;
  students: string;
  courses: string;
  expertise: { label: string; desc: string }[];
  social: { facebook?: string; twitter?: string; linkedin?: string };
};

export const INSTRUCTORS: Instructor[] = [
  {
    slug: "zubair-mahmud",
    name: "Zubair Mahmud",
    role: "Sr. Senior UI/UX Designer",
    subtitle:
      "Helping aspiring designers build real-world skills through practical, user-centered design approaches and hands-on projects.",
    image: image1,
    about:
      "Zubair Mahmud is a highly experienced UI/UX designer and dedicated mentor with a strong passion for helping learners transform their careers through practical, real-world education. With over five years of hands-on experience working with startups, global brands, and digital products, he brings deep industry knowledge and a results-driven mindset into every course he teaches. His expertise spans across user research, wireframing, prototyping, design systems, and product strategy. Zubair has successfully guided thousands of students — from complete beginners to aspiring professionals — in building job-ready skills and creating impactful portfolios that stand out in today's competitive market.",
    experience: "6 years Experience",
    rating: "4.7 Ratings",
    students: "3K+ Students Taught",
    courses: "08 Courses Available",
    expertise: [
      { label: "UI/UX Design", desc: "Creating intuitive, user-centered digital experiences" },
      { label: "User Research & Testing", desc: "Understanding user behavior to improve product usability" },
      { label: "Wireframing & Prototyping", desc: "Turning ideas into interactive design solutions" },
      { label: "Design Systems", desc: "Building scalable and consistent design frameworks" },
      { label: "Figma & Design Tools", desc: "Mastering modern tools for efficient design workflows" },
      { label: "Product Strategy", desc: "Aligning design decisions with business goals" },
    ],
    social: { facebook: "#", twitter: "#", linkedin: "#" },
  },
  {
    slug: "mahmudul-karim",
    name: "Mahmudul Karim",
    role: "Full-Stack Developer",
    subtitle:
      "Empowering developers to build scalable, production-ready applications from front-end to back-end.",
    image: image2,
    about:
      "Mahmudul Karim is a seasoned full-stack developer and passionate educator with extensive experience building modern web applications. He has worked with leading tech companies and startups, delivering robust solutions using React, Node.js, and cloud infrastructure. His teaching philosophy centers on hands-on projects and real-world problem solving, ensuring every student graduates with a portfolio they are proud of.",
    experience: "8 years Experience",
    rating: "4.8 Ratings",
    students: "5K+ Students Taught",
    courses: "12 Courses Available",
    expertise: [
      { label: "React & Next.js", desc: "Building fast, SEO-friendly frontends" },
      { label: "Node.js & Express", desc: "Designing scalable server-side applications" },
      { label: "Database Design", desc: "Structuring efficient SQL and NoSQL databases" },
      { label: "REST & GraphQL APIs", desc: "Creating robust data interfaces" },
      { label: "DevOps & CI/CD", desc: "Automating deployment pipelines" },
      { label: "Cloud (AWS / GCP)", desc: "Deploying and scaling cloud-native apps" },
    ],
    social: { facebook: "#", twitter: "#", linkedin: "#" },
  },
  {
    slug: "rafia-siddique",
    name: "Rafia Siddique",
    role: "Digital Marketing Expert",
    subtitle:
      "Driving measurable growth through data-driven marketing strategies and creative campaigns.",
    image: image3,
    about:
      "Rafia Siddique is a digital marketing strategist with a track record of scaling brands across SEO, paid media, email, and social channels. She has consulted for e-commerce, SaaS, and non-profit organisations, bringing a performance-first mindset to every project. Her courses break down complex marketing frameworks into actionable playbooks that students can apply immediately.",
    experience: "7 years Experience",
    rating: "4.6 Ratings",
    students: "4K+ Students Taught",
    courses: "09 Courses Available",
    expertise: [
      { label: "SEO & Content Strategy", desc: "Ranking content that converts" },
      { label: "Paid Advertising", desc: "Running profitable Google & Meta campaigns" },
      { label: "Email Marketing", desc: "Building automated nurture sequences" },
      { label: "Social Media Growth", desc: "Growing engaged communities organically" },
      { label: "Analytics & Reporting", desc: "Turning data into actionable insights" },
      { label: "Conversion Optimisation", desc: "Improving funnels to maximise ROI" },
    ],
    social: { facebook: "#", twitter: "#", linkedin: "#" },
  },
  {
    slug: "saif-islam",
    name: "Saif Islam",
    role: "Sr. Python & AI Expert",
    subtitle:
      "Making artificial intelligence approachable and practical for developers at every level.",
    image: image4,
    about:
      "Saif Islam is a senior AI/ML engineer who has built production machine learning systems for finance, healthcare, and e-commerce domains. He holds advanced credentials in deep learning and has published research on natural language processing. Saif's courses demystify AI concepts and guide students from foundational Python to deploying real machine learning models in production.",
    experience: "9 years Experience",
    rating: "4.9 Ratings",
    students: "6K+ Students Taught",
    courses: "10 Courses Available",
    expertise: [
      { label: "Python & Data Science", desc: "Writing clean, analytical Python code" },
      { label: "Machine Learning", desc: "Building and evaluating predictive models" },
      { label: "Deep Learning", desc: "Designing neural networks with TensorFlow & PyTorch" },
      { label: "Natural Language Processing", desc: "Processing and understanding text at scale" },
      { label: "MLOps", desc: "Deploying and monitoring models in production" },
      { label: "Computer Vision", desc: "Building image recognition pipelines" },
    ],
    social: { facebook: "#", twitter: "#", linkedin: "#" },
  },
  {
    slug: "rafia-siddique-se",
    name: "Rafia Siddique",
    role: "Sr. Software Engineer",
    subtitle: "Building reliable, maintainable software systems with clean architecture principles.",
    image: image1,
    about:
      "A senior software engineer with deep expertise in systems design and clean code practices. She has led engineering teams at multiple product companies and is passionate about mentoring the next generation of developers.",
    experience: "10 years Experience",
    rating: "4.7 Ratings",
    students: "2K+ Students Taught",
    courses: "06 Courses Available",
    expertise: [
      { label: "System Design", desc: "Architecting scalable distributed systems" },
      { label: "Clean Code", desc: "Writing readable and maintainable software" },
      { label: "Testing & TDD", desc: "Ensuring quality through automated tests" },
      { label: "Microservices", desc: "Decomposing monoliths into services" },
      { label: "API Design", desc: "Crafting intuitive developer experiences" },
      { label: "Performance Tuning", desc: "Identifying and resolving bottlenecks" },
    ],
    social: { facebook: "#", twitter: "#", linkedin: "#" },
  },
  {
    slug: "saif-islam-ux",
    name: "Saif Islam",
    role: "Sr. UX Researcher",
    subtitle: "Turning user insights into product decisions that drive real business outcomes.",
    image: image2,
    about:
      "A senior UX researcher specialising in mixed-method research and usability studies. He has collaborated with product teams at global companies to ensure every design decision is grounded in genuine user understanding.",
    experience: "5 years Experience",
    rating: "4.5 Ratings",
    students: "1.5K+ Students Taught",
    courses: "05 Courses Available",
    expertise: [
      { label: "Usability Testing", desc: "Running moderated and unmoderated studies" },
      { label: "Interview Techniques", desc: "Extracting meaningful insights from users" },
      { label: "Survey Design", desc: "Crafting unbiased quantitative research" },
      { label: "Journey Mapping", desc: "Visualising end-to-end user experiences" },
      { label: "Affinity Diagramming", desc: "Synthesising qualitative data" },
      { label: "Research Ops", desc: "Scaling research across organisations" },
    ],
    social: { facebook: "#", twitter: "#", linkedin: "#" },
  },
  {
    slug: "zubair-mahmud-python",
    name: "Zubair Mahmud",
    role: "Lead Python Expert",
    subtitle: "Helping professionals automate workflows and build powerful Python applications.",
    image: image3,
    about:
      "A lead Python developer with extensive experience in automation, scripting, and backend development. He has built internal tools for Fortune 500 companies and teaches Python from fundamentals to advanced patterns.",
    experience: "7 years Experience",
    rating: "4.6 Ratings",
    students: "3.5K+ Students Taught",
    courses: "07 Courses Available",
    expertise: [
      { label: "Python Fundamentals", desc: "Solid grounding in Python syntax and paradigms" },
      { label: "Automation & Scripting", desc: "Saving hours with intelligent automation" },
      { label: "Django & FastAPI", desc: "Building production-grade web services" },
      { label: "Data Pipelines", desc: "Processing and transforming large datasets" },
      { label: "Testing in Python", desc: "Pytest, mocking, and TDD workflows" },
      { label: "Packaging & Deployment", desc: "Distributing Python projects professionally" },
    ],
    social: { facebook: "#", twitter: "#", linkedin: "#" },
  },
  {
    slug: "mahmudul-karim-pm",
    name: "Mahmudul Karim",
    role: "Project Manager",
    subtitle: "Delivering complex projects on time by combining agile practices with clear communication.",
    image: image4,
    about:
      "An experienced project manager certified in PMP and Scrum, with a background in both software delivery and digital transformation. He teaches project management through real case studies and practical frameworks that teams can adopt immediately.",
    experience: "11 years Experience",
    rating: "4.8 Ratings",
    students: "2.8K+ Students Taught",
    courses: "08 Courses Available",
    expertise: [
      { label: "Agile & Scrum", desc: "Running effective sprints and ceremonies" },
      { label: "Risk Management", desc: "Identifying and mitigating project risks" },
      { label: "Stakeholder Communication", desc: "Keeping everyone aligned and informed" },
      { label: "Roadmap Planning", desc: "Translating strategy into executable plans" },
      { label: "Budget Management", desc: "Delivering projects within financial constraints" },
      { label: "Team Leadership", desc: "Motivating and developing high-performing teams" },
    ],
    social: { facebook: "#", twitter: "#", linkedin: "#" },
  },
];

export function getInstructorBySlug(slug: string): Instructor | undefined {
  return INSTRUCTORS.find((i) => i.slug === slug);
}
