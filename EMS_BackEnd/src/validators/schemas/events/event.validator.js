import joi from "joi";

const categoryValues = ["conference", "workshop", "seminar", "concert", "sports", "other"];

const baseEventFields = {
  title: joi.string().trim().min(3).max(100),
  description: joi.string().trim().min(10).max(1000),
  date: joi.date().iso(),
  location: joi.string().trim().min(3).max(200),
  capacity: joi.number().integer().min(1),
  price: joi.number().min(0),
  category: joi.string().valid(...categoryValues),
  bookingDeadline: joi.date().iso(),
  refundPolicy: joi.string().trim().max(500),
  seatingLayout: joi.object({
    type: joi.string().valid("theater", "stadium", "banquet", "conference", "custom"),
    rows: joi.number().integer().min(1),
    seatsPerRow: joi.number().integer().min(1),
    customLayout: joi.array().items(joi.object({
      rowNumber: joi.number().integer().min(1),
      seatsInRow: joi.number().integer().min(1)
    }))
  })
};

const createEventSchema = {
  body: joi
    .object(baseEventFields)
    .fork(
      [
        "title",
        "description",
        "date",
        "location",
        "capacity",
        "price",
        "category",
        "bookingDeadline"
      ],
      (s) => s.required()
    )
    .custom((value, helpers) => {
      const now = new Date();
      const eventDate = new Date(value.date);
      const deadline = new Date(value.bookingDeadline);

      if (eventDate <= now) {
        return helpers.error("any.custom", {
          message: "Event date must be in the future"
        });
      }
      if (deadline <= now) {
        return helpers.error("any.custom", {
          message: "Booking deadline must be in the future"
        });
      }
      if (deadline >= eventDate) {
        return helpers.error("any.custom", {
          message: "Booking deadline must be before the event date"
        });
      }
      return value;
    })
    .options({ abortEarly: false, allowUnknown: false, stripUnknown: true })
};

const updateEventSchema = {
  body: joi
    .object(baseEventFields)
    .min(1)
    .custom((value, helpers) => {
      if (value.date || value.bookingDeadline) {
        const eventDate = value.date ? new Date(value.date) : undefined;
        const deadline = value.bookingDeadline
          ? new Date(value.bookingDeadline)
          : undefined;
        const now = new Date();

        if (eventDate && eventDate <= now) {
          return helpers.error("any.custom", {
            message: "Event date must be in the future"
          });
        }
        if (deadline && deadline <= now) {
          return helpers.error("any.custom", {
            message: "Booking deadline must be in the future"
          });
        }
        if (eventDate && deadline && deadline >= eventDate) {
          return helpers.error("any.custom", {
            message: "Booking deadline must be before the event date"
          });
        }
      }
      return value;
    })
    .options({ abortEarly: false, allowUnknown: false, stripUnknown: true })
};

export { createEventSchema, updateEventSchema };


