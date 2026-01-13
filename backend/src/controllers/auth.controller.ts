// import { Request, Response } from 'express';
// import { registerSchema, loginSchema } from '../validators/auth.validator';
// import { hashPassword, comparePassword } from '../helpers/hash.helper';
// import { generateToken } from '../helpers/jwt.helper';
// import prisma from '../config/database';

// export const register = async (req: Request, res: Response) => {
//     try {
//         // Validate input
//         const validatedData = registerSchema.parse(req.body);

//         // Check if user already exists
//         const existingUser = await prisma.user.findUnique({
//             where: { email: validatedData.email },
//         });

//         if (existingUser) {
//             return res.status(400).json({
//                 error: 'Bad Request',
//                 message: 'Email đã được sử dụng',
//             });
//         }

//         // Hash password
//         const hashedPassword = await hashPassword(validatedData.password);

//         // Create user
//         const user = await prisma.user.create({
//             data: {
//                 email: validatedData.email,
//                 password: hashedPassword,
//                 name: validatedData.name,
//             },
//             select: {
//                 id: true,
//                 email: true,
//                 name: true,
//                 role: true,
//                 createdAt: true,
//             },
//         });

//         // Generate token
//         const token = generateToken({
//             id: user.id,
//             email: user.email,
//             role: user.role,
//         });

//         res.status(201).json({
//             success: true,
//             data: {
//                 user,
//                 token,
//             },
//         });
//     } catch (error: any) {
//         if (error.name === 'ZodError') {
//             return res.status(400).json({
//                 error: 'Validation Error',
//                 message: error.errors[0].message,
//             });
//         }

//         res.status(500).json({
//             error: 'Internal Server Error',
//             message: 'Đã xảy ra lỗi khi đăng ký',
//         });
//     }
// };

// export const login = async (req: Request, res: Response) => {
//     try {
//         // Validate input
//         const validatedData = loginSchema.parse(req.body);

//         // Find user
//         const user = await prisma.user.findUnique({
//             where: { email: validatedData.email },
//         });

//         if (!user) {
//             return res.status(401).json({
//                 error: 'Unauthorized',
//                 message: 'Email hoặc mật khẩu không đúng',
//             });
//         }

//         // Verify password
//         const isPasswordValid = await comparePassword(validatedData.password, user.password);

//         if (!isPasswordValid) {
//             return res.status(401).json({
//                 error: 'Unauthorized',
//                 message: 'Email hoặc mật khẩu không đúng',
//             });
//         }

//         // Generate token
//         const token = generateToken({
//             id: user.id,
//             email: user.email,
//             role: user.role,
//         });

//         res.json({
//             success: true,
//             data: {
//                 user: {
//                     id: user.id,
//                     email: user.email,
//                     name: user.name,
//                     role: user.role,
//                 },
//                 token,
//             },
//         });
//     } catch (error: any) {
//         if (error.name === 'ZodError') {
//             return res.status(400).json({
//                 error: 'Validation Error',
//                 message: error.errors[0].message,
//             });
//         }

//         res.status(500).json({
//             error: 'Internal Server Error',
//             message: 'Đã xảy ra lỗi khi đăng nhập',
//         });
//     }
// };

// export const getMe = async (req: Request, res: Response) => {
//     try {
//         if (!req.user) {
//             return res.status(401).json({
//                 error: 'Unauthorized',
//                 message: 'Vui lòng đăng nhập',
//             });
//         }

//         const user = await prisma.user.findUnique({
//             where: { id: req.user.id },
//             select: {
//                 id: true,
//                 email: true,
//                 name: true,
//                 role: true,
//                 createdAt: true,
//             },
//         });

//         if (!user) {
//             return res.status(404).json({
//                 error: 'Not Found',
//                 message: 'Không tìm thấy người dùng',
//             });
//         }

//         res.json({
//             success: true,
//             data: user,
//         });
//     } catch (error) {
//         res.status(500).json({
//             error: 'Internal Server Error',
//             message: 'Đã xảy ra lỗi',
//         });
//     }
// };
