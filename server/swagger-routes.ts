/**
 * @swagger
 * /api/login:
 *   post:
 *     tags: [Authentication]
 *     summary: User login
 *     description: Authenticate user with username/password and get JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: User logout
 *     description: Logout user and invalidate session
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/user:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user
 *     description: Get authenticated user information
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products
 *     description: Retrieve all beauty products
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: API key required
 *   post:
 *     tags: [Products]
 *     summary: Create product
 *     description: Create a new beauty product (Admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, price, category]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number, minimum: 0 }
 *               category: { type: string }
 *               imageUrl: { type: string, format: url }
 *               image2Url: { type: string, format: url }
 *               image3Url: { type: string, format: url }
 *               inStock: { type: boolean }
 *               featured: { type: boolean }
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     description: Retrieve a specific product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *   put:
 *     tags: [Products]
 *     summary: Update product
 *     description: Update an existing product (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number, minimum: 0 }
 *               category: { type: string }
 *               imageUrl: { type: string, format: url }
 *               image2Url: { type: string, format: url }
 *               image3Url: { type: string, format: url }
 *               inStock: { type: boolean }
 *               featured: { type: boolean }
 *     responses:
 *       200:
 *         description: Product updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *   delete:
 *     tags: [Products]
 *     summary: Delete product
 *     description: Delete a product (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     description: Retrieve all product categories
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *   post:
 *     tags: [Categories]
 *     summary: Create category
 *     description: Create a new product category (Admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug]
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               description: { type: string }
 *               image1Url: { type: string, format: url }
 *               image2Url: { type: string, format: url }
 *               sortOrder: { type: number }
 *               isActive: { type: boolean }
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get all orders
 *     description: Retrieve all customer orders
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *   post:
 *     tags: [Orders]
 *     summary: Create order
 *     description: Create a new customer order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerName, customerEmail, customerPhone, shippingAddress, items, total]
 *             properties:
 *               customerName: { type: string }
 *               customerEmail: { type: string, format: email }
 *               customerPhone: { type: string }
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   province: { type: string }
 *                   canton: { type: string }
 *                   district: { type: string }
 *                   exactAddress: { type: string }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId: { type: string, format: uuid }
 *                     productName: { type: string }
 *                     quantity: { type: number, minimum: 1 }
 *                     price: { type: number, minimum: 0 }
 *               total: { type: number, minimum: 0 }
 *     responses:
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */

/**
 * @swagger
 * /api/home-content:
 *   get:
 *     tags: [CMS]
 *     summary: Get home page content
 *     description: Retrieve all home page content for CMS
 *     responses:
 *       200:
 *         description: Home page content
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HomePageContent'
 *   post:
 *     tags: [CMS]
 *     summary: Create home page content
 *     description: Create new home page content (Admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Content created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HomePageContent'
 */

/**
 * @swagger
 * /api/objects/upload:
 *   post:
 *     tags: [Upload]
 *     summary: Get S3 upload URL
 *     description: Get presigned URL for S3 upload (Admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Upload URL generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadURL: { type: string, format: url }
 */

/**
 * @swagger
 * /api/deploy:
 *   post:
 *     tags: [Deployment]
 *     summary: Deploy to AWS S3
 *     description: Deploy application to AWS S3 (Admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Deployment started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 deploymentId: { type: string }
 */

/**
 * @swagger
 * /api/locations/provinces:
 *   get:
 *     tags: [Locations]
 *     summary: Get Costa Rica provinces
 *     description: Retrieve list of Costa Rica provinces
 *     responses:
 *       200:
 *         description: List of provinces
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   code: { type: string }
 *                   name: { type: string }
 */