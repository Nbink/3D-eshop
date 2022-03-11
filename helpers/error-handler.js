// Handles all errors. Could possibly expand this to handle specific errors
function errorHandler(err, req, res, next) {
    if (err) {
        res.status(500).json({ message: err });
    }
}

module.exports = errorHandler;
