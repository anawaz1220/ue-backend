import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../entities/User.entity';

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile management
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/profile', authenticate, userController.getProfile);

/**
 * @swagger
 * /api/users/customer/profile:
 *   put:
 *     summary: Update customer profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               whatsappNumber:
 *                 type: string
 *               profilePhotoUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
router.put(
  '/customer/profile',
  authenticate,
  authorize([UserRole.CUSTOMER]),
  userController.updateCustomerProfile
);

/**
 * @swagger
 * /api/users/customer/addresses:
 *   post:
 *     summary: Add a new customer address
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - house
 *               - street
 *               - city
 *             properties:
 *               house:
 *                 type: string
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Address added successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Customer profile not found
 *       500:
 *         description: Server error
 */
router.post(
  '/customer/addresses',
  authenticate,
  authorize([UserRole.CUSTOMER]),
  userController.addCustomerAddress
);

/**
 * @swagger
 * /api/users/customer/addresses:
 *   get:
 *     summary: Get all addresses for a customer
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Customer profile not found
 *       500:
 *         description: Server error
 */
router.get(
  '/customer/addresses',
  authenticate,
  authorize([UserRole.CUSTOMER]),
  userController.getCustomerAddresses
);

/**
 * @swagger
 * /api/users/customer/addresses/{addressId}:
 *   put:
 *     summary: Update a customer address
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the address to update
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               house:
 *                 type: string
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 */
router.put(
  '/customer/addresses/:addressId',
  authenticate,
  authorize([UserRole.CUSTOMER]),
  userController.updateCustomerAddress
);

/**
 * @swagger
 * /api/users/customer/addresses/{addressId}:
 *   delete:
 *     summary: Delete a customer address
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the address to delete
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Address not found
 *       500:
 *         description: Server error
 */
router.delete(
  '/customer/addresses/:addressId',
  authenticate,
  authorize([UserRole.CUSTOMER]),
  userController.deleteCustomerAddress
);

export default router;