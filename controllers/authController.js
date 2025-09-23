import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT token with user info
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      role: user.role,
      // For backward compatibility
      isAdmin: user.role === 'ADMIN' 
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Format user data for response
const formatUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  location: user.location || "",
  memberSince: user.createdAt,
  role: user.role,
  isAdmin: user.role === 'ADMIN' // For backward compatibility
});

export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'CUSTOMER' } = req.body;
    
    // Validate role
    if (role && !['ADMIN', 'CUSTOMER'].includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid role. Must be either 'ADMIN' or 'CUSTOMER'"
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Generate token
    const token = generateToken(user);

    // Return response
    res.status(200).json({
      success: true,
      token,
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate token
    const token = generateToken(user);

    // Return response
    res.json({
      success: true,
      token,
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    // req.user is already the user document from the protect middleware
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const updateProfile = async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const { name, phone, location } = req.body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    // Update user fields
    const updateData = {
      name: name.trim(),
      phone: phone ? phone.trim() : "",
      location: location ? location.trim() : ""
    };

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: formatUserResponse(updatedUser)
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getAdminAllUser=async(req,res)=>{

 try 
  { const alluser = await User.find();
  res.status(200).json({
    success:true,
    message:alluser
  })

 } catch (error) {
  res.status(500).json({
    success:true,
    message:error
  })
 }
}
