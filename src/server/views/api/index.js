const router = require('express').Router();

const queuesPause = require('./queuesPause');
const queuesResume = require('./queuesResume');
const queuePause = require('./queuePause');
const queueResume = require('./queueResume');
const jobAdd = require('./jobAdd');
const jobRetry = require('./jobRetry');
const jobRemove = require('./jobRemove');
const bulkJobsRemove = require('./bulkJobsRemove');
const bulkJobsRetry = require('./bulkJobsRetry');

router.post('/queues/pause', queuesPause);
router.post('/queues/resume', queuesResume);
router.post('/queue/:queueHost/:queueName/pause', queuePause);
router.post('/queue/:queueHost/:queueName/resume', queueResume);
router.post('/queue/:queueHost/:queueName/job', jobAdd);
router.post('/queue/:queueHost/:queueName/job/bulk', bulkJobsRemove);
router.patch('/queue/:queueHost/:queueName/job/bulk', bulkJobsRetry);
router.patch('/queue/:queueHost/:queueName/job/:id', jobRetry);
router.delete('/queue/:queueHost/:queueName/job/:id', jobRemove);

module.exports = router;
