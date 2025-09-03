import User from '../../../DB/Models/users.model.js';
import Ticket from '../../../DB/Models/tickets.model.js';

const demographicChartsService = async (req, res) => {
    try {
        // Age groups
        const ageGroups = await User.aggregate([
            {
                $project: {
                    ageGroup: {
                        $switch: {
                            branches: [
                                { case: { $lte: ['$age', 18] }, then: '< 18' },
                                { case: { $lte: ['$age', 25] }, then: '18-25' },
                                { case: { $lte: ['$age', 35] }, then: '26-35' },
                                { case: { $lte: ['$age', 50] }, then: '36-50' }
                            ],
                            default: '50+'
                        }
                    }
                }
            },
            { $group: { _id: '$ageGroup', count: { $sum: 1 } } }
        ]);

        // Gender distribution
        const genderStats = await User.aggregate([
            { $group: { _id: '$gender', count: { $sum: 1 } } }
        ]);

        // Location distribution
        const locationStats = await User.aggregate([
            { $group: { _id: '$location', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            ageGroups,
            genderStats,
            locationStats
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching demographic data", error: error.message });
    }
};

export default demographicChartsService;