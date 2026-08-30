function formatVisitMessage(message) {
  if (typeof message !== 'string' || message.trim().length === 0) {
    return 'hello from task3';
  }
  return message.trim();
}

function isHealthy(dbCheckResult) {
  return dbCheckResult === true;
}

module.exports = { formatVisitMessage, isHealthy };
