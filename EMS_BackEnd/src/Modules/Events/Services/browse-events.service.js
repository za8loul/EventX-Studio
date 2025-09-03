import Event from '../../../DB/Models/events.model.js';

const browseEventsService = async (req, res) => {
    try {
        const { 
            search, 
            category, 
            startDate, 
            endDate, 
            minPrice, 
            maxPrice,
            location,
            page = 1,
            limit = 10
        } = req.query;

        let query = { status: 'published' };

        // Search by title or description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by date range
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Filter by location
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        const skip = (page - 1) * limit;

        const events = await Event.find(query)
            .skip(skip)
            .limit(Number(limit))
            .sort({ date: 1 });

        const total = await Event.countDocuments(query);

        res.status(200).json({
            events,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalEvents: total
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching events", error: error.message });
    }
};

export default browseEventsService;