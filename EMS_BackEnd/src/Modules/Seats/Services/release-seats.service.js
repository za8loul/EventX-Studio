import Seat from "../../../DB/Models/seats.model.js";

const releaseSeatsService = async (req, res) => {
    try {
        const { seatIds } = req.body;
        const userId = req.loggedInUser.user._id;

        if (!seatIds || seatIds.length === 0) {
            return res.status(400).json({ message: "No seats specified for release" });
        }

        const seats = await Seat.find({ 
            _id: { $in: seatIds },
            reservedBy: userId,
            status: "reserved"
        });

        if (seats.length === 0) {
            return res.status(404).json({ message: "No reserved seats found for this user" });
        }

        // Release all seats
        for (const seat of seats) {
            await seat.releaseReservation();
        }

        res.json({
            message: `${seats.length} seats released successfully`,
            releasedSeats: seats.length
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Error releasing seats", 
            error: error.message 
        });
    }
};

export default releaseSeatsService;
