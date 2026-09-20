import swaggerJsdoc from "swagger-jsdoc";
import { config } from "../config/index.js";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Nayantara Opticals - Enterprise REST API",
      version: "1.0.0",
      description:
        "Comprehensive, production-grade REST API backend for Nayantara Opticals e-commerce, appointment booking, prescription vault, payment gateway, and analytics platform.",
      contact: {
        name: "Nayantara Opticals Tech Support",
        email: "support@nayantaraopticals.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/v1`,
        description: "Local / Development API Gateway",
      },
      {
        url: "https://api.nayantaraopticals.com/api/v1",
        description: "Production API Gateway",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your short-lived access JWT token",
        },
      },
      schemas: {
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                fields: { type: "object" },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
