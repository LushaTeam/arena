const _ = require('lodash');
const util = require('util');

async function handler(req, res) {
  const { queueName, queueHost, id } = req.params;
  const { json } = req.query;
  const basePath = req.baseUrl;

  const {Queues} = req.app.locals;
  const queue = await Queues.get(queueName, queueHost);
  if (!queue) return res.status(404).render('dashboard/templates/queueNotFound', {basePath, queueName, queueHost});

  const job = await queue.getJob(id);
  if (!job) return res.status(404).render('dashboard/templates/jobNotFound', {basePath, id, queueName, queueHost});

  if (json === 'true') {
    delete job.queue; // avoid circular references parsing error
    return res.json(job);
  }

  let jobState;
  if (queue.IS_BEE) {
    jobState = job.status;
  } else {
    jobState = await job.getState();
  }

  job.displayName = job.data.name || job.name || job.id;

  if (job.finishedOn)
    job.duration = job.finishedOn - job.processedOn;
  else if (jobState === 'active')
    job.duration = Date.now() - job.processedOn;

  return res.render('dashboard/templates/jobDetails', {
    basePath,
    queueName,
    queueHost,
    jobState,
    job
  });
}

module.exports = handler;
