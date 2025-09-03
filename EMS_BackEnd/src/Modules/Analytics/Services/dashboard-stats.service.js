import Ticket from '../../../DB/Models/tickets.model.js';
import Event from '../../../DB/Models/events.model.js';
import Payment from '../../../DB/Models/payments.model.js';

const dashboardStatsService = async (req, res) => {
    try {
        // Get total revenue
        const revenue = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Get tickets stats
        const ticketsStats = await Ticket.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get events stats
        const eventsStats = await Event.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            revenue: revenue[0]?.total || 0,
            tickets: {
                total: ticketsStats.reduce((acc, curr) => acc + curr.count, 0),
                byStatus: ticketsStats.reduce((acc, curr) => ({
                    ...acc,
                    [curr._id]: curr.count
                }), {})
            },
            events: {
                total: eventsStats.reduce((acc, curr) => acc + curr.count, 0),
                byCategory: eventsStats.reduce((acc, curr) => ({
                    ...acc,
                    [curr._id]: curr.count
                }), {})
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching dashboard stats", error: error.message });
    }
};

export default dashboardStatsService;