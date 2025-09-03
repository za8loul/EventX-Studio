import User from "../../../DB/Models/users.model.js";
import { ROLES } from "../../../DB/Models/users.model.js";

const UpdateUserService = async (req, res) => {
    try{
        const {_id} = req.loggedInUser.user
        const {firstName , lastName , email , gender , age, role} = req.body
        
        // Check if user is trying to change their own role or if they have permission
        if (role && req.loggedInUser.user.role !== ROLES.SUPER_ADMIN) {
            return res.status(403).json({message: "Only super admins can change user roles"});
        }

        // Check if email is being changed and if it already exists
        if (email && email !== req.loggedInUser.user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({message: "Email already exists"});
            }
        }
        
        const updateData = {firstName , lastName , email , age , gender};
        if (role && req.loggedInUser.user.role === ROLES.SUPER_ADMIN) {
            updateData.role = role;
        }

        const user = await User.findByIdAndUpdate(
            _id,
            updateData,
            {new: true}
        )

        if(!user) {
            return res.status(404).json({message: "User not found"});
        }

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({message: "User updated successfully" , user: userResponse})
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: "Internal server error", err });
    }
}

export default UpdateUserService