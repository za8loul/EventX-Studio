import { hashSync } from "bcrypt";
import User, { ROLES } from "../../../DB/Models/users.model.js";

// Create Signup service
const SignUpService = async (req, res) => {
    try {
        const { firstName, lastName, email, gender, age, password, role } = req.body;

        // If user already exists
        const isEmailExist = await User.findOne({ email });
        if (isEmailExist) {
            return res.status(409).json({ message: "Email already exists" })
        }

        // Password hashing
        const hashedPassword = hashSync(password, +process.env.SALT_ROUNDS);

        // Create user with role (default to USER if not specified)
        const userData = { 
            firstName, 
            lastName, 
            email, 
            gender, 
            age, 
            password: hashedPassword,
            role: role || ROLES.USER
        };

        const user = await User.create(userData);

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(201).json({ message: "User created successfully", user: userResponse });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error", err });
    }
}

export default SignUpService;