const router = require('express').Router();
const { body, query } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/tasks');

const STATUSES  = ['todo', 'in_progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];

router.use(auth); // all task routes require authentication

router.get('/',
  query('status').optional().isIn(STATUSES),
  query('priority').optional().isIn(PRIORITIES),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  ctrl.list
);

router.post('/',
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('description').optional().isString(),
  body('status').optional().isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
  body('priority').optional().isIn(PRIORITIES).withMessage(`Priority must be one of: ${PRIORITIES.join(', ')}`),
  body('due_date').optional({ nullable: true }).isISO8601().withMessage('due_date must be ISO 8601.'),
  validate,
  ctrl.create
);

router.get('/:id', ctrl.get);

router.patch('/:id',
  body('title').optional().trim().notEmpty(),
  body('status').optional().isIn(STATUSES),
  body('priority').optional().isIn(PRIORITIES),
  body('due_date').optional({ nullable: true }).isISO8601(),
  validate,
  ctrl.update
);

router.delete('/:id', ctrl.remove);

module.exports = router;
