import Seat from "../../../DB/Models/seats.model.js";
import Event from "../../../DB/Models/events.model.js";

const deleteSeatService = async (req, res) => {
    try {
        const { seatId } = req.params;

        // Find the seat
        const seat = await Seat.findById(seatId);
        if (!seat) {
            return res.status(404).json({ message: "Seat not found" });
        }

        // Check if user is the event creator (admin)
        const event = await Event.findById(seat.event);
        if (!event || event.createdBy.toString() !== req.loggedInUser.user._id.toString()) {
            return res.status(403).json({ message: "Access denied. You can only delete seats for events you created." });
        }

        // Check if seat can be deleted (not paid or reserved)
        if (seat.status === "paid" || seat.status === "reserved") {
            return res.status(400).json({ 
                message: "Cannot delete seat that is paid or reserved" 
            });
        }

        // Delete the seat
        await Seat.findByIdAndDelete(seatId);

        res.json({ message: "Seat deleted successfully" });
    } catch (error) {
        res.status(500).json({ 
            message: "Error deleting seat", 
            error: error.message 
        });
    }
};

export default deleteSeatService;
