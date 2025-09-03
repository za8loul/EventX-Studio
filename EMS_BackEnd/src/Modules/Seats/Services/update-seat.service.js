import Seat from "../../../DB/Models/seats.model.js";
import Event from "../../../DB/Models/events.model.js";

const updateSeatService = async (req, res) => {
    try {
        const { seatId } = req.params;
        const { rowNumber, seatNumber, status, basePrice, category, features, isAccessible } = req.body;

        // Find the seat
        const seat = await Seat.findById(seatId);
        if (!seat) {
            return res.status(404).json({ message: "Seat not found" });
        }

        // Check if user is the event creator (admin)
        const event = await Event.findById(seat.event);
        if (!event || event.createdBy.toString() !== req.loggedInUser.user._id.toString()) {
            return res.status(403).json({ message: "Access denied. You can only update seats for events you created." });
        }

        // Update price multiplier if category changes
        let priceMultiplier = seat.priceMultiplier;
        if (category && category !== seat.category) {
            if (category === "premium") priceMultiplier = 1.5;
            else if (category === "vip") priceMultiplier = 2.0;
            else priceMultiplier = 1.0;
        }

        // Update the seat
        const updatedSeat = await Seat.findByIdAndUpdate(
            seatId,
            {
                rowNumber,
                seatNumber,
                status,
                basePrice,
                priceMultiplier,
                category,
                features,
                isAccessible
            },
            { new: true }
        );

        res.json({ 
            message: "Seat updated successfully", 
            seat: updatedSeat 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error updating seat", 
            error: error.message 
        });
    }
};

export default updateSeatService;
