import { Router } from 'express';
import { BusinessController } from '../controllers/business.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../entities/User.entity';

const router = Router();
const businessController = new BusinessController();

/**
 * @swagger
 * tags:
 *   name: Business
 *   description: Business profile management
 */

/**
 * @swagger
 * /api/business/profile:
 *   put:
 *     summary: Update business profile
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               whatsappNumber:
 *                 type: string
 *               instagramId:
 *                 type: string
 *               ownerName:
 *                 type: string
 *               ownerPhone:
 *                 type: string
 *               building:
 *                 type: string
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               latitude:
 *                 type: number
 *                 format: float
 *               longitude:
 *                 type: number
 *                 format: float
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
  '/profile',
  authenticate,
  authorize([UserRole.BUSINESS]),
  businessController.updateBusinessProfile
);

/**
 * @swagger
 * /api/business/photos:
 *   post:
 *     summary: Add a business photo
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - photoUrl
 *             properties:
 *               photoUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Photo added successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Business profile not found
 *       500:
 *         description: Server error
 */
router.post(
    '/photos',
    authenticate,
    authorize([UserRole.BUSINESS]),
    businessController.addBusinessPhoto
  );
  
  /**
   * @swagger
   * /api/business/photos:
   *   get:
   *     summary: Get all photos for a business
   *     tags: [Business]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Photos retrieved successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Business profile not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/photos',
    authenticate,
    authorize([UserRole.BUSINESS]),
    businessController.getBusinessPhotos
  );
  
  /**
   * @swagger
   * /api/business/photos/{photoId}:
   *   delete:
   *     summary: Delete a business photo
   *     tags: [Business]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: photoId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the photo to delete
   *     responses:
   *       200:
   *         description: Photo deleted successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Photo not found
   *       500:
   *         description: Server error
   */
  router.delete(
    '/photos/:photoId',
    authenticate,
    authorize([UserRole.BUSINESS]),
    businessController.deleteBusinessPhoto
  );
  
  /**
   * @swagger
   * /api/business/service-types:
   *   get:
   *     summary: Get all service types
   *     tags: [Business]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Service types retrieved successfully
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.get(
    '/service-types',
    authenticate,
    businessController.getServiceTypes
  );
  
  /**
   * @swagger
   * /api/business/services:
   *   post:
   *     summary: Add a business service
   *     tags: [Business]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - serviceTypeId
   *             properties:
   *               serviceTypeId:
   *                 type: string
   *     responses:
   *       201:
   *         description: Service added successfully
   *       400:
   *         description: Invalid input or service already exists
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Business profile or service type not found
   *       500:
   *         description: Server error
   */
  router.post(
    '/services',
    authenticate,
    authorize([UserRole.BUSINESS]),
    businessController.addBusinessService
  );
  
  /**
   * @swagger
   * /api/business/services:
   *   get:
   *     summary: Get all services for a business
   *     tags: [Business]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Services retrieved successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Business profile not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/services',
    authenticate,
    authorize([UserRole.BUSINESS]),
    businessController.getBusinessServices
  );
  
  /**
   * @swagger
   * /api/business/services/{serviceId}:
   *   delete:
   *     summary: Delete a business service
   *     tags: [Business]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: serviceId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the service to delete
   *     responses:
   *       200:
   *         description: Service deleted successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Service not found
   *       500:
   *         description: Server error
   */
  router.delete(
    '/services/:serviceId',
    authenticate,
    authorize([UserRole.BUSINESS]),
    businessController.deleteBusinessService
  );
  
  export default router;