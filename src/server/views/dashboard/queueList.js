async function handler(req, res) {
  const {Queues} = req.app.locals;
  const queues = Queues.list();
  const basePath = req.baseUrl;
  const now = Date.now();
  const yesterday = now - (24 * 60 * 60 * 1000);
  const hourAgo = now - (60 * 60 * 1000);
  let completed, failed;

  for (const q of queues) {
    const queue = await Queues.get(q.name, q.hostId);
    if (!queue) return res.status(404).send({ error: 'queue not found' });

    q.activeCount = await queue.getActiveCount();
    q.waitingCount = await queue.getWaitingCount();
    q.completedLastHourCount = 0;
    q.completedLastDayCount = 0;
    q.failedLastHourCount = 0;
    q.failedLastDayCount = 0;

    completed = await queue.getCompleted();
    failed = await queue.getFailed();

    for (const job of completed) {
      if (job.finishedOn > yesterday) {
        q.completedLastDayCount++;

        if (job.finishedOn > hourAgo)
          q.completedLastHourCount++;
      }
    }

    for (const job of failed) {
      if (job.finishedOn > yesterday) {
        q.failedLastDayCount++;

        if (job.finishedOn > hourAgo)
          q.failedLastHourCount++;
      }
    }
  }

  return res.render('dashboard/templates/queueList', { basePath, queues });
}

module.exports = handler;
