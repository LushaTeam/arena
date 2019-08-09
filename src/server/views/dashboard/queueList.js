async function handler(req, res) {
  const {Queues} = req.app.locals;
  const queues = Queues.list();
  const basePath = req.baseUrl;
  const now = Date.now();
  const yesterday = now - (24 * 60 * 60 * 1000);
  const hourAgo = now - (60 * 60 * 1000);
  let singleHost = true;
  let active = 0;
  let waiting = 0;
  let completedLastHourCount = 0;
  let completedLastDayCount = 0;
  let failedLastHourCount = 0;
  let failedLastDayCount = 0;
  let completed, failed;

  for (const q of queues) {
    const queue = await Queues.get(q.name, q.hostId);
    if (!queue) return res.status(404).send({ error: 'queue not found' });

    if (singleHost) {
      if (singleHost === true)
        singleHost = q.hostId;
      else if (singleHost !== q.hostId)
        singleHost = false;
    }

    q.activeCount = await queue.getActiveCount();
    active += q.activeCount;

    q.waitingCount = await queue.getWaitingCount();
    waiting += q.waitingCount;

    q.completedLastHourCount = 0;
    q.completedLastDayCount = 0;
    q.failedLastHourCount = 0;
    q.failedLastDayCount = 0;

    completed = await queue.getCompleted();
    failed = await queue.getFailed();

    for (const job of completed) {
      if (job.finishedOn > yesterday) {
        q.completedLastDayCount++;
        completedLastDayCount++;

        if (job.finishedOn > hourAgo) {
          q.completedLastHourCount++;
          completedLastHourCount++;
        }
      }
    }

    for (const job of failed) {
      if (job.finishedOn > yesterday) {
        q.failedLastDayCount++;
        failedLastDayCount++;

        if (job.finishedOn > hourAgo) {
          q.failedLastHourCount++;
          failedLastHourCount++;
        }
      }
    }
  }

  return res.render('dashboard/templates/queueList', {
    basePath,
    queues,
    showHostColumn: !singleHost,
    active,
    waiting,
    completedLastHourCount,
    completedLastDayCount,
    failedLastHourCount,
    failedLastDayCount
  });
}

module.exports = handler;
