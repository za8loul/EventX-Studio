import {Router} from "express";
import SignUpService from "./Services/signup.service.js";
import loginService from "./Services/login.service.js";
import UpdateUserService from "./Services/update-admin.service.js";
import logoutService from "./Services/logout.service.js";
import authenticationMiddleware from "../../Middlewares/auth.middleware.js";
import refreshTokenService from "./Services/refresh-token.service.js";
import { requireAdmin, requirePermission } from "../../Middlewares/authorization.middleware.js";
import User from "../../DB/Models/users.model.js";
import validationMiddleware from "../../Middlewares/validation.middleware.js";
import signupSchema from "../../validators/schemas/user/signup.validator.js";
import updateUserSchema from "../../validators/schemas/user/update-user.validation.js";
import loginSchema from "../../validators/schemas/user/login.validation.js";

const userController = Router();

// Public routes (no authentication required)
userController.post('/signup' , validationMiddleware(signupSchema), SignUpService);
userController.post('/login', validationMiddleware(loginSchema), loginService);
userController.post('/refresh-token', refreshTokenService);

// Protected routes (authentication required)
userController.put('/update' , validationMiddleware(updateUserSchema),  authenticationMiddleware , UpdateUserService);
userController.post('/logout', authenticationMiddleware , logoutService);

// Admin-only routes
userController.post('/add' , authenticationMiddleware, requireAdmin, SignUpService); // Only admins can create users
userController.get('/profile', authenticationMiddleware, (req, res) => {
    const user = req.loggedInUser.user;
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ user: userResponse });
});

// Admin routes for managing users
userController.get('/users', authenticationMiddleware, requireAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
});

export default userController;