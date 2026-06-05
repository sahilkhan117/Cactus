import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { getEmbedding } from "../services/embedding.js";

// Load environment variables
dotenv.config();

const mockUsersData = [
  {
    email: "aarav@university.edu",
    fullName: "Aarav Sharma",
    department: "Computer Science",
    batch: 2027,
    bio: "Interested in machine learning and blockchain. Let's build something cool!",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80",
    role: "student" as const,
  },
  {
    email: "vihaan@university.edu",
    fullName: "Vihaan Patel",
    department: "Electronics & Telecom",
    batch: 2026,
    bio: "Hardware geek. Building a drone in my backyard. Looking for collaborators.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    role: "student" as const,
  },
  {
    email: "ananya@university.edu",
    fullName: "Ananya Iyer",
    department: "Information Technology",
    batch: 2027,
    bio: "Data science enthusiast. Loves clean code and filter coffee.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    role: "student" as const,
  },
  {
    email: "diya@university.edu",
    fullName: "Diya Sen",
    department: "Mechanical Engineering",
    batch: 2026,
    bio: "Robotics and CAD design. Passionate about Formula Student.",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
    role: "student" as const,
  },
  {
    email: "aditya@university.edu",
    fullName: "Aditya Nair",
    department: "Computer Science",
    batch: 2027,
    bio: "Full stack developer. React, Node, and Python. Open to freelancing.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    role: "student" as const,
  },
  {
    email: "riya@university.edu",
    fullName: "Riya Kapoor",
    department: "Management Studies",
    batch: 2026,
    bio: "Marketing and strategy. Organizing the next campus entrepreneurship summit.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    role: "student" as const,
  }
];

const mockPostsData = [
  {
    authorEmail: "aarav@university.edu",
    content: "Just published my research paper draft on Semantic Vector Search using Atlas and Gemini! If anyone wants to collaborate on building a customized front-end visualizer for it, DM me! 🚀",
    tags: ["opportunity", "research", "ai"],
    likeCount: 12,
  },
  {
    authorEmail: "vihaan@university.edu",
    content: "Is anyone else experiencing weird signal attenuation issues with the ESP32 transmitter in the West Wing campus building? Let's meet at the hardware lab tomorrow at 4 PM to run some spectrum analysis.",
    tags: ["electronics", "hardware", "iot"],
    likeCount: 5,
  },
  {
    authorEmail: "ananya@university.edu",
    content: "Quick reminder for the IT batch: Mid-term exam registrations close this Friday at 5:00 PM. Make sure your submissions are completed on the portal, no extensions allowed!",
    tags: ["announcement", "academics"],
    likeCount: 22,
  },
  {
    authorEmail: "diya@university.edu",
    content: "Our CAD model for the Formula Student aerodynamic diffuser is finally approved! Super proud of the design team. Next phase is fabricating it in the workshop. carbon fiber layups here we come! 🏎💨",
    tags: ["mechanical", "autosports", "design"],
    likeCount: 45,
  },
  {
    authorEmail: "aditya@university.edu",
    content: "Spent the weekend refactoring a custom messaging gateway with Socket.io. The broadcast latency is down under 10ms. Open-sourcing the repository soon. What are you guys hacking on this week?",
    tags: ["programming", "javascript", "webdev"],
    likeCount: 18,
  },
  {
    authorEmail: "riya@university.edu",
    content: "Excited to announce that registrations for the E-Summit 2026 are officially open! We have some of India's top tech founders joining us as keynote speakers this year. Grab your passes before they sell out!",
    tags: ["events", "summit", "business"],
    likeCount: 58,
  }
];

async function generateEmbeddingSafely(text: string): Promise<number[]> {
  if (!process.env.GEMINI_API_KEY) {
    // Return dummy 768-dimensional array if API key is not configured
    return Array.from({ length: 768 }, () => Math.random() * 0.1);
  }
  try {
    return await getEmbedding(text);
  } catch (err) {
    // Fallback to random floats if API call fails
    return Array.from({ length: 768 }, () => Math.random() * 0.1);
  }
}

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is missing");
    }

    console.log("Connecting to database...");
    await mongoose.connect(mongoUri);
    console.log("Database connected successfully.");

    // 1. Clean existing records for mock users to avoid duplicates
    const emails = mockUsersData.map(u => u.email);
    console.log("Removing existing mock users...");
    const existingUsers = await User.find({ email: { $in: emails } });
    const userIds = existingUsers.map(u => u._id);

    await User.deleteMany({ email: { $in: emails } });
    await Post.deleteMany({ authorId: { $in: userIds } });
    
    // 2. Hash password and insert users
    console.log("Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("Password123", salt);

    console.log("Inserting new mock users...");
    const userMap: Record<string, mongoose.Types.ObjectId> = {};
    for (const userData of mockUsersData) {
      const createdUser = await User.create({
        ...userData,
        passwordHash,
        isVerified: true
      });
      userMap[userData.email] = createdUser._id as mongoose.Types.ObjectId;
      console.log(`Created user: ${userData.fullName} (${userData.email})`);
    }

    // 3. Insert Posts with semantic embeddings
    console.log("Generating embeddings and inserting posts...");
    for (const postData of mockPostsData) {
      const authorId = userMap[postData.authorEmail];
      if (!authorId) continue;

      const embedding = await generateEmbeddingSafely(postData.content);

      await Post.create({
        authorId,
        content: postData.content,
        tags: postData.tags,
        likeCount: postData.likeCount,
        embedding
      });
      console.log(`Created post by: ${postData.authorEmail}`);
    }

    // 4. Create Mock Conversations and Messages
    console.log("Creating mock conversations and messages...");
    const aaravId = userMap["aarav@university.edu"];
    const ananyaId = userMap["ananya@university.edu"];
    const vihaanId = userMap["vihaan@university.edu"];
    const diyaId = userMap["diya@university.edu"];

    if (aaravId && ananyaId) {
      // Clean up previous conversations between them
      await Conversation.deleteMany({
        participants: { $all: [aaravId, ananyaId] }
      });

      const conversation = await Conversation.create({
        participants: [aaravId, ananyaId],
        lastMessageAt: new Date()
      });

      const messages = [
        { senderId: aaravId, content: "Hey Ananya! Are you joining the research study group this evening?" },
        { senderId: ananyaId, content: "Hey Aarav! Yes, absolutely. I want to look into the Atlas search vectors." },
        { senderId: aaravId, content: "Great! I've loaded some sample datasets. See you in the library." }
      ];

      for (const msg of messages) {
        await Message.create({
          conversationId: conversation._id,
          senderId: msg.senderId,
          content: msg.content,
          isRead: true
        });
      }
      console.log("Created Aarav <-> Ananya chat history.");
    }

    if (vihaanId && diyaId) {
      // Clean up previous conversations between them
      await Conversation.deleteMany({
        participants: { $all: [vihaanId, diyaId] }
      });

      const conversation = await Conversation.create({
        participants: [vihaanId, diyaId],
        lastMessageAt: new Date()
      });

      const messages = [
        { senderId: vihaanId, content: "Hey Diya, saw your post about the diffuser CAD design. Looks super clean!" },
        { senderId: diyaId, content: "Thanks Vihaan! We spent all week tuning the surface flows." },
        { senderId: vihaanId, content: "Do you need help with mounting the telemetry sensors on the carbon fiber layup?" },
        { senderId: diyaId, content: "That would be awesome. Let's sync at the fabrication lab tomorrow." }
      ];

      for (const msg of messages) {
        await Message.create({
          conversationId: conversation._id,
          senderId: msg.senderId,
          content: msg.content,
          isRead: true
        });
      }
      console.log("Created Vihaan <-> Diya chat history.");
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
    process.exit(0);
  }
}

seed();
