const Queues = require('../../queue');
const _ = require('lodash');

const ACTIONS = ['remove', 'retry'];

function bulkAction(action) {
  return async function handler(req, res) {
    if (!_.includes(ACTIONS, action)) {
      res.status(401).send({
        error: 'unauthorized action',
        details: `action ${action} not permitted`
      });
    }

    const { queueName, queueHost } = req.params;
    const {Queues} = req.app.locals;
    const queue = await Queues.get(queueName, queueHost);
    if (!queue) return res.status(404).send({error: 'queue not found'});

    const {jobs} = req.body;

    try {
      if (!_.isEmpty(jobs)) {
        const jobsPromises = jobs.map((id) => queue.getJob(decodeURIComponent(id)));
        const fetchedJobs = await Promise.all(jobsPromises);

        for (const job of fetchedJobs) {
          const state = await job.getState();

          if (action === 'remove' && state === 'active') {
            await job.discard();
            await job.moveToFailed({ message: 'Aborted by user' }, true);
          } else {
            await job[action]();
          }
        }

        return res.sendStatus(200);
      }
    } catch(e) {
      const body = {
        error: 'queue error',
        details: e.stack
      };
      return res.status(500).send(body);
    }

    return res.sendStatus(200);
  }
}

module.exports = bulkAction;
