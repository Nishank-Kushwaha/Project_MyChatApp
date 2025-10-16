import User from "../models/User.js";
import ConversationMember from "../models/conversationMember.js";
import { signToken } from "../utils/auth.js";

const postSignUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists",
      });
    }

    const user = await User.create({
      username: username,
      email: email,
      passwordHash: password,
    });

    if (!user) {
      return res.status(400).json({
        message: "Error while register process",
      });
    }

    return res.status(201).json({
      message: "Registration successfull",
      data: user,
    });
  } catch (error) {
    console.log("❌ Error while register process", error);
    return res.status(500).json({
      message: "Error while register process",
      error: error,
    });
  }
};

const postSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid user",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    const loggedInUser = await User.findById({ _id: user._id }).select(
      "-passwordHash"
    );

    if (!loggedInUser) {
      return res.status(400).json({
        message: "Error while login process",
      });
    }

    const rawToken = signToken({
      id: loggedInUser._id.toString(),
      email: loggedInUser.email,
      username: loggedInUser.username,
    });

    const bearerToken = `Bearer ${rawToken}`;

    res.cookie("authorization", bearerToken, {
      // httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: loggedInUser._id,
        username: loggedInUser.username,
        email: loggedInUser.email,
      },
    });
  } catch (error) {
    console.log("❌ Error while login process", error);
    return res.status(500).json({
      message: "Error while login process",
      error: error,
    });
  }
};

const getLogout = async (req, res) => {
  try {
    res.clearCookie("authorization", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(userId).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const count = await ConversationMember.countDocuments({ userId });

    return res.status(200).json({
      message: "User data retrieved",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        conversationCount: count,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    return res.status(500).json({ message: "Error fetching user data" });
  }
};

const getUsers = async (req, res) => {
  try {
    const { userId } = req.body;

    let users;

    if (userId) {
      // Fetch single user by ID (excluding password)
      users = await User.findById(userId).select("-passwordHash");
      if (!users) {
        return res.status(404).json({ message: "User not found" });
      }
    } else {
      // Fetch all users (excluding passwords)
      users = await User.find().select("-passwordHash");
    }

    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /api/users/search?q=<query>
 * Returns users matching query (by username or email)
 */
const searchUsers = async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .select("_id username email createdAt")
      .limit(20)
      .lean();

    console.log("Search user backend:", users);

    return res.status(200).json({ users: users });
  } catch (error) {
    console.error("Error searching users:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export { postSignUp, postSignIn, getLogout, getMe, getUsers, searchUsers };
