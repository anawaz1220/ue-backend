import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../entities/User.entity';

const router = Router();
const adminController = new AdminController();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  '/users',
  authenticate,
  authorize([UserRole.ADMIN]),
  adminController.getAllUsers
);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get(
  '/users/:userId',
  authenticate,
  authorize([UserRole.ADMIN]),
  adminController.getUserById
);

/**
 * @swagger
 * /api/admin/service-types:
 *   post:
 *     summary: Create a new service type
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service type created successfully
 *       400:
 *         description: Invalid input or service type already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post(
  '/service-types',
  authenticate,
  authorize([UserRole.ADMIN]),
  adminController.createServiceType
);

/**
 * @swagger
 * /api/admin/service-types:
 *   get:
 *     summary: Get all service types
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Service types retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  '/service-types',
  authenticate,
  authorize([UserRole.ADMIN]),
  adminController.getAllServiceTypes
);

/**
 * @swagger
 * /api/admin/service-types/{serviceTypeId}:
 *   put:
 *     summary: Update a service type
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceTypeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the service type to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service type updated successfully
 *       400:
 *         description: Invalid input or service type with this name already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Service type not found
 *       500:
 *         description: Server error
 */
router.put(
  '/service-types/:serviceTypeId',
  authenticate,
  authorize([UserRole.ADMIN]),
  adminController.updateServiceType
);

/**
 * @swagger
 * /api/admin/service-types/{serviceTypeId}:
 *   delete:
 *     summary: Delete a service type
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceTypeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the service type to delete
 *     responses:
 *       200:
 *         description: Service type deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Service type not found
 *       500:
 *         description: Server error
 */
router.delete(
  '/service-types/:serviceTypeId',
  authenticate,
  authorize([UserRole.ADMIN]),
  adminController.deleteServiceType
);

export default router;