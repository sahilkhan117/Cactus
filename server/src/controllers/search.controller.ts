import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import Post from "../models/Post.js";
import { getEmbedding } from "../services/embedding.js";

/**
 * Perform semantic search on posts using Google Gemini embeddings
 * and MongoDB Atlas Vector Search, with a regex fallback.
 */
export const searchPosts = async (req: AuthRequest, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const hasGemini = !!process.env.GEMINI_API_KEY;

    if (hasGemini) {
      try {
        // 1. Generate query vector using Gemini text-embedding-004
        const queryVector = await getEmbedding(query);

        // 2. Query MongoDB using Atlas Vector Search aggregate pipeline
        const results = await Post.aggregate([
          {
            $vectorSearch: {
              index: "vector_index",
              path: "embedding",
              queryVector: queryVector,
              numCandidates: 100,
              limit: 20
            }
          },
          {
            $lookup: {
              from: "users",
              localField: "authorId",
              foreignField: "_id",
              as: "author"
            }
          },
          {
            $unwind: "$author"
          },
          {
            $project: {
              _id: 1,
              content: 1,
              mediaUrls: 1,
              tags: 1,
              likeCount: 1,
              commentCount: 1,
              createdAt: 1,
              score: { $meta: "vectorSearchScore" },
              authorId: {
                _id: "$author._id",
                fullName: "$author.fullName",
                avatarUrl: "$author.avatarUrl",
                role: "$author.role"
              }
            }
          }
        ]);

        return res.json(results);
      } catch (err: any) {
        console.warn("Vector search index not ready or search failed, falling back to regex:", err.message);
      }
    }

    // 3. Fallback: standard regex keyword matching
    console.log("Executing standard text query fallback...");
    const regexResults = await Post.find({
      content: { $regex: query, $options: "i" }
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("authorId", "fullName avatarUrl role");

    res.json(regexResults);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
