import { Parser } from 'json2csv';
import Ticket from '../../../DB/Models/tickets.model.js';

const exportReportsService = async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;

        let data;
        let fields;

        switch (type) {
            case 'tickets':
                data = await Ticket.find({
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                })
                .populate('event', 'title')
                .populate('user', 'name email')
                .lean();

                fields = ['_id', 'event.title', 'user.name', 'user.email', 'status', 'purchasePrice'];
                break;
            // Add more report types as needed
            default:
                return res.status(400).json({ message: "Invalid report type" });
        }

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(data);

        res.header('Content-Type', 'text/csv');
        res.attachment(`${type}-report-${startDate}-to-${endDate}.csv`);
        res.send(csv);

    } catch (error) {
        res.status(500).json({ message: "Error generating report", error: error.message });
    }
};

export default exportReportsService;