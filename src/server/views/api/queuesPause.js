async function handler(req, res) {
  const {Queues} = req.app.locals;
  const queues = Queues.list();

  for (const item of queues) {
    const queue = await Queues.get(item.name, item.hostId);
    if (!queue) return res.status(404).send({ error: 'queue not found' });

    try {
      await queue.pause();
    } catch (e) {
      const body = {
        error: 'queue error',
        details: e.stack
      };
      return res.status(500).send(body);
    }
  }

  return res.sendStatus(200);
}

module.exports = handler;
