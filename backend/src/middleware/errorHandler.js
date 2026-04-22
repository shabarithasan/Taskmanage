/* eslint-disable no-unused-vars */
module.exports = function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON body.' });
  }

  const status = err.status || 500;
  const message = status < 500 ? err.message : 'An unexpected error occurred.';
  res.status(status).json({ error: message });
};
