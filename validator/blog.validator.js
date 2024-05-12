const joi = require('joi');

const validateBookMiddleWare = (req, res, next) => {
    const bookPayload = req.body;
    const { error } = validateBook(bookPayload);

    if (error) {
        console.log(error);
        return res.status(406).send(error.details[0].message);
    }

    next();

}


const bookValidator = joi.object({
    title: joi.string()
        .min(5)
        .max(255)
        .required(),
    description: joi.string()
        .min(5)
        .max(255)
        .optional(),
    author: joi.string()
        .min(10)
        .max(225),
    state: joi.string()
        .min(5)
        .max(255)
        .required(),
    read_count: joi.number()
        .min(0)
        .default(0),
    price: joi.number()
        .min(0)
        .required(),
    timestamp: joi.date()
        .default(Date.now())
})

module.exports = validateBookMiddleWare;