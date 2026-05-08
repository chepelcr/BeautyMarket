# POS Invoice Management - Backend Plan

## Executive Summary

This document outlines the backend microservices architecture for the POS Invoice Management system. The backend is split into three independent services:

1. **Sales Service** - Document creation, CRUD operations, file upload
2. **Validation Service** - Hacienda validation, acceptance/rejection
3. **Notification Service** - Email notifications, document resend

**Architecture Pattern:** Microservices with independent databases and async communication

---

## 1. Architecture Overview

### 1.1 Microservices Structure

```

                         API Gateway                          
              /api/organizations/{org_id}/...                 

                              
        
                                                  
                                                  
        
 Sales Service       Validation        Notification  
                       Service           Service     
        
 - Create sale      - Validate         - Send email  
 - List sales       - Accept           - Resend      
 - Get sale         - Reject           - Templates   
 - Update sale      - Partial          - Queue mgmt  
 - Delete sale      - Status sync                    
 - Upload PDF                                        
 - Upload XML                                        
        
                                                  
                                                  
        
  Sales DB          Validation DB      Notification  
                                           DB        
        
                                                  
        
                              
                              
                    
                       Message Queue   
                       (RabbitMQ/SQS)  
                    
```

### 1.2 Service Communication

**Synchronous (REST):**
- API Gateway  Services (HTTP/REST)
- Frontend  API Gateway (HTTP/REST)

**Asynchronous (Events):**
- Sales Service  Validation Service (sale.created event)
- Validation Service  Notification Service (validation.completed event)
- Sales Service  Notification Service (sale.created event)

---

## 2. Sales Service

### 2.1 Responsibilities

- Create, read, update, delete sales/invoices
- Store sale data (header, lines, payments, references)
- Upload PDF, XML, JSON files to S3
- Generate pre-signed URLs for file access
- Emit events for validation and notification
- Query and filter sales

### 2.2 Endpoints

**Base Path:** `/api/organizations/{organization_id}/sales`

```
POST   /                                    - Create sale/invoice
GET    /                                    - List sales/invoices
GET    /{sale_id}                           - Get sale details
PUT    /{sale_id}                           - Update sale (draft only)
DELETE /{sale_id}                           - Delete sale (draft only)
POST   /{sale_id}/files                     - Upload PDF/XML/JSON files
```

### 2.3 Create Sale Endpoint

**POST /api/organizations/{organization_id}/sales**

**Request Body:**
```json
{
  "document_type": 1,
  "version_id": 1,
  "activity_code": "123456",
  "sale_condition_id": 1,
  "credit_term": "30",
  "notes": "Optional notes",
  "branch_code": "001",
  "terminal_code": "001",
  "receiver": {
    "identification": {
      "number": "123456789",
      "type": 1,
      "code": "01"
    },
    "business_name": "Cliente SA",
    "email": "cliente@example.com",
    "residence": {
      "state_id": 1,
      "county_id": 101,
      "district_id": 10101,
      "address": "San José, Costa Rica"
    }
  },
  "details": [
    {
      "line_number": 1,
      "product_id": "uuid",
      "description": "Product description",
      "quantity": 2,
      "net_price": 5000,
      "base_amount": 10000,
      "unit_id": 1,
      "commercial_unit_measure": "Unidad",
      "customs_part": "123456789012",
      "discounts": [
        {
          "discount_type_id": 1,
          "reason": "Commercial discount",
          "percentage": 10,
          "amount": 1000
        }
      ],
      "taxes": [
        {
          "tax_type_id": 1,
          "tax_rate_id": 1,
          "rate": 13,
          "amount": 1170,
          "special_fields": {}
        }
      ],
      "factory_tax_charge_id": null,
      "discount_amount": 1000,
      "tax_amount": 1170,
      "factory_assumed_tax": 0,
      "line_total": 10170
    }
  ],
  "payments": [
    {
      "payment_type_id": 1,
      "amount": 10170
    }
  ],
  "references": [],
  "currency_code": {
    "iso_code": "CRC",
    "exchange_rate": 1
  },
  "copy_emails": ["copy@example.com"],
  "subtotal": 10000,
  "discount_amount": 1000,
  "tax_amount": 1170,
  "total_amount": 10170
}
```

**Response:**
```json
{
  "sale_id": "uuid",
  "organization_id": "uuid",
  "assignment_id": "uuid",
  "branch_code": 1,
  "terminal_code": 1,
  "branch_id": "uuid",
  "terminal_id": "uuid",
  "client_id": "uuid",
  "document_type": 1,
  "version_id": 1,
  "activity_code": "123456",
  "sale_condition_id": 1,
  "credit_term": "30",
  "notes": "Optional notes",
  "copy_emails": ["copy@example.com"],
  "receiver_id_type": 1,
  "receiver_id_number": "123456789",
  "receiver_business_name": "Cliente SA",
  "receiver_email": "cliente@example.com",
  "payments": [
    {
      "type": 1,
      "amount": 10170
    }
  ],
  "subtotal": 10000.0,
  "discount_amount": 1000.0,
  "tax_amount": 1170.0,
  "total_amount": 10170.0,
  "lines": [
    {
      "line_id": 1,
      "line_number": 1,
      "product_id": "uuid",
      "description": "Product description",
      "quantity": 2.0,
      "unit_id": 1,
      "net_price": 5000.0,
      "discount_rate": 10.0,
      "tax_rate": 13.0,
      "line_total": 10170.0
    }
  ],
  "status": 1,
  "created_at": "2026-05-07T22:30:00Z",
  "created_by": "user_id",
  "pdf_url": "https://cdn.example.com/sales/uuid.pdf",
  "xml_url": "https://cdn.example.com/sales/uuid.xml",
  "json_url": "https://cdn.example.com/sales/uuid.json",
  "document_key": "50601234567890123456789012345678901234567890123",
  "consecutive_number": "00100001000000000001"
}
```

**Business Logic:**
1. Validate request data
2. Generate document_key (50 digits)
3. Generate consecutive_number
4. Save sale to database
5. Generate PDF, XML, JSON files
6. Upload files to S3
7. Generate pre-signed URLs (valid for 7 days)
8. Emit `sale.created` event to message queue
9. Return response with file URLs

### 2.4 List Sales Endpoint

**GET /api/organizations/{organization_id}/sales**

**Query Parameters:**
```
?document_types=01,04,08              - Filter by document types (comma-separated)
&issued=true                          - Filter issued vs received (omit for all)
&search={"status":"validated"}        - Complex search (URL-encoded JSON)
&page=0                               - Page number (0-indexed)
&size=20                              - Page size (default: 10, max: 250)
```

**Search Object Structure:**
```json
{
  "searchTerm": "00100001000000000001",
  "status": "validated",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "sort": "sale_date,desc"
}
```

**Response:**
```json
{
  "data": [
    {
      "sale_id": "uuid",
      "consecutive_number": "00100001000000000001",
      "document_type": 1,
      "sale_date": "2026-05-07",
      "receiver_business_name": "Cliente SA",
      "total_amount": 10170.0,
      "status": 1,
      "validation_status": "validated",
      "pdf_url": "https://cdn.example.com/sales/uuid.pdf",
      "xml_url": "https://cdn.example.com/sales/uuid.xml"
    }
  ],
  "pagination": {
    "page": 0,
    "size": 20,
    "total_elements": 100,
    "total_pages": 5
  }
}
```

### 2.5 Upload Files Endpoint

**POST /api/organizations/{organization_id}/sales/{sale_id}/files**

**Request (multipart/form-data):**
```
pdf: <file>
xml: <file>
json: <file>
```

**Response:**
```json
{
  "pdf_url": "https://cdn.example.com/sales/uuid.pdf",
  "xml_url": "https://cdn.example.com/sales/uuid.xml",
  "json_url": "https://cdn.example.com/sales/uuid.json"
}
```

**Business Logic:**
1. Validate sale exists and belongs to organization
2. Upload files to S3 bucket
3. Generate pre-signed URLs (7 days expiry)
4. Update sale record with file URLs
5. Return URLs

### 2.6 Database Schema

**Table: sales**
```sql
CREATE TABLE sales (
  sale_id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  assignment_id UUID,
  branch_id UUID NOT NULL,
  terminal_id UUID NOT NULL,
  branch_code INTEGER NOT NULL,
  terminal_code INTEGER NOT NULL,
  client_id UUID,
  
  document_type INTEGER NOT NULL,
  document_key VARCHAR(50) UNIQUE NOT NULL,
  consecutive_number VARCHAR(20) NOT NULL,
  version_id INTEGER NOT NULL,
  activity_code VARCHAR(20) NOT NULL,
  sale_condition_id INTEGER NOT NULL,
  credit_term VARCHAR(10),
  notes TEXT,
  
  receiver_id_type INTEGER,
  receiver_id_number VARCHAR(20),
  receiver_business_name VARCHAR(200),
  receiver_email VARCHAR(100),
  
  subtotal DECIMAL(15,2) NOT NULL,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  
  copy_emails JSONB,
  payments JSONB NOT NULL,
  
  pdf_url VARCHAR(500),
  xml_url VARCHAR(500),
  json_url VARCHAR(500),
  
  status INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  
  UNIQUE(organization_id, consecutive_number)
);

CREATE INDEX idx_sales_org_date ON sales(organization_id, created_at DESC);
CREATE INDEX idx_sales_consecutive ON sales(consecutive_number);
CREATE INDEX idx_sales_document_key ON sales(document_key);
```

**Table: sale_lines**
```sql
CREATE TABLE sale_lines (
  line_id SERIAL PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES sales(sale_id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  product_id UUID,
  description TEXT NOT NULL,
  quantity DECIMAL(15,4) NOT NULL,
  unit_id INTEGER,
  net_price DECIMAL(15,2) NOT NULL,
  discount_rate DECIMAL(5,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  line_total DECIMAL(15,2) NOT NULL,
  
  UNIQUE(sale_id, line_number)
);

CREATE INDEX idx_sale_lines_sale ON sale_lines(sale_id);
```

### 2.7 Events Emitted

**sale.created**
```json
{
  "event_type": "sale.created",
  "timestamp": "2026-05-07T22:30:00Z",
  "data": {
    "sale_id": "uuid",
    "organization_id": "uuid",
    "document_key": "50601234567890123456789012345678901234567890123",
    "document_type": 1,
    "receiver_email": "cliente@example.com",
    "copy_emails": ["copy@example.com"],
    "pdf_url": "https://cdn.example.com/sales/uuid.pdf",
    "xml_url": "https://cdn.example.com/sales/uuid.xml"
  }
}
```

---

## 3. Validation Service

### 3.1 Responsibilities

- Validate documents with Hacienda (Costa Rica tax authority)
- Accept/reject/partially accept received documents
- Store validation status and messages
- Sync validation status back to Sales Service
- Emit events for notification service

### 3.2 Endpoints

**Base Path:** `/api/organizations/{organization_id}/sales/{sale_id}/validation`

```
POST   /{document_key}/validation          - Submit validation (accept/reject/partial)
GET    /{document_key}/validation          - Get validation status
POST   /{document_key}/validation/hacienda - Validate with Hacienda
```

### 3.3 Submit Validation Endpoint

**POST /api/organizations/{organization_id}/sales/{document_key}/validation**

**Request Body:**
```json
{
  "action": "accept",
  "message": "Documento aceptado",
  "details": {
    "partial_amount": null,
    "reason_code": null
  }
}
```

**Actions:**
- `accept` - Accept document (status: 1)
- `reject` - Reject document (status: 3, message required)
- `partial` - Partially accept (status: 2, partial_amount required)

**Response:**
```json
{
  "validation_id": "uuid",
  "document_key": "50601234567890123456789012345678901234567890123",
  "action": "accept",
  "status": 1,
  "message": "Documento aceptado",
  "validated_at": "2026-05-07T22:35:00Z",
  "validated_by": "user_id",
  "hacienda_response": {
    "status": "accepted",
    "message": "Aceptado por Hacienda"
  }
}
```

**Business Logic:**
1. Validate document_key exists
2. Validate action and required fields
3. Submit to Hacienda API
4. Store validation result
5. Emit `validation.completed` event
6. Return validation result

### 3.4 Get Validation Status Endpoint

**GET /api/organizations/{organization_id}/sales/{document_key}/validation**

**Response:**
```json
{
  "validation_id": "uuid",
  "document_key": "50601234567890123456789012345678901234567890123",
  "status": 1,
  "status_text": "validated",
  "message": "Documento aceptado",
  "validated_at": "2026-05-07T22:35:00Z",
  "validated_by": "user_id",
  "hacienda_response": {
    "status": "accepted",
    "message": "Aceptado por Hacienda",
    "response_date": "2026-05-07T22:35:00Z"
  }
}
```

### 3.5 Validate with Hacienda Endpoint

**POST /api/organizations/{organization_id}/sales/{document_key}/validation/hacienda**

**Request Body:**
```json
{
  "xml_content": "<base64_encoded_xml>"
}
```

**Response:**
```json
{
  "validation_id": "uuid",
  "status": "validated",
  "message": "Documento validado por Hacienda",
  "hacienda_response": {
    "status": "accepted",
    "message": "Aceptado",
    "response_date": "2026-05-07T22:35:00Z"
  }
}
```

**Business Logic:**
1. Decode XML content
2. Submit to Hacienda API
3. Parse Hacienda response
4. Store validation result
5. Emit `validation.completed` event
6. Return validation result

### 3.6 Database Schema

**Table: validations**
```sql
CREATE TABLE validations (
  validation_id UUID PRIMARY KEY,
  document_key VARCHAR(50) NOT NULL,
  organization_id UUID NOT NULL,
  sale_id UUID,
  
  action VARCHAR(20) NOT NULL,
  status INTEGER NOT NULL,
  message TEXT,
  
  partial_amount DECIMAL(15,2),
  reason_code VARCHAR(10),
  
  hacienda_response JSONB,
  
  validated_at TIMESTAMP DEFAULT NOW(),
  validated_by UUID NOT NULL,
  
  UNIQUE(document_key)
);

CREATE INDEX idx_validations_document_key ON validations(document_key);
CREATE INDEX idx_validations_org ON validations(organization_id);
```

### 3.7 Events Emitted

**validation.completed**
```json
{
  "event_type": "validation.completed",
  "timestamp": "2026-05-07T22:35:00Z",
  "data": {
    "validation_id": "uuid",
    "document_key": "50601234567890123456789012345678901234567890123",
    "sale_id": "uuid",
    "organization_id": "uuid",
    "status": 1,
    "message": "Documento aceptado",
    "receiver_email": "cliente@example.com"
  }
}
```

---

## 4. Notification Service

### 4.1 Responsibilities

- Send email notifications for new sales
- Resend document emails
- Email templates management
- Queue management for async email sending
- Track email delivery status

### 4.2 Endpoints

**Base Path:** `/api/organizations/{organization_id}/sales/{sale_id}/notifications`

```
POST   /resend                              - Resend document email
GET    /status                              - Get notification status
```

### 4.3 Resend Email Endpoint

**POST /api/organizations/{organization_id}/sales/{sale_id}/notifications/resend**

**Request Body:**
```json
{
  "to_emails": ["cliente@example.com"],
  "cc_emails": ["copy@example.com"],
  "subject": "Factura Electrónica",
  "message": "Adjunto encontrará su factura electrónica"
}
```

**Response:**
```json
{
  "notification_id": "uuid",
  "status": "sent",
  "sent_at": "2026-05-07T22:40:00Z",
  "recipients": ["cliente@example.com", "copy@example.com"]
}
```

**Business Logic:**
1. Validate sale exists
2. Get PDF and XML URLs from Sales Service
3. Generate email from template
4. Send email with attachments
5. Store notification record
6. Return status

### 4.4 Get Notification Status Endpoint

**GET /api/organizations/{organization_id}/sales/{sale_id}/notifications/status**

**Response:**
```json
{
  "notifications": [
    {
      "notification_id": "uuid",
      "type": "sale_created",
      "status": "sent",
      "sent_at": "2026-05-07T22:30:00Z",
      "recipients": ["cliente@example.com"]
    },
    {
      "notification_id": "uuid",
      "type": "resend",
      "status": "sent",
      "sent_at": "2026-05-07T22:40:00Z",
      "recipients": ["cliente@example.com", "copy@example.com"]
    }
  ]
}
```

### 4.5 Database Schema

**Table: notifications**
```sql
CREATE TABLE notifications (
  notification_id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  sale_id UUID NOT NULL,
  
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  
  to_emails JSONB NOT NULL,
  cc_emails JSONB,
  subject VARCHAR(200) NOT NULL,
  message TEXT,
  
  sent_at TIMESTAMP,
  error_message TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_sale ON notifications(sale_id);
CREATE INDEX idx_notifications_org ON notifications(organization_id);
```

### 4.6 Email Templates

**Template: sale_created**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Factura Electrónica</title>
</head>
<body>
  <h1>Factura Electrónica</h1>
  <p>Estimado cliente,</p>
  <p>Adjunto encontrará su factura electrónica.</p>
  <p><strong>Número:</strong> {{consecutive_number}}</p>
  <p><strong>Fecha:</strong> {{sale_date}}</p>
  <p><strong>Total:</strong> {{total_amount}}</p>
  <p>Gracias por su compra.</p>
</body>
</html>
```

### 4.7 Events Consumed

**sale.created** - Send initial email
**validation.completed** - Send validation status email

---

## 5. Data API Endpoints

**Base Path:** `/api/data`

```
GET    /document-types                      - Document types
GET    /sale-conditions                     - Sale conditions
GET    /payment-types                       - Payment types
GET    /measurement-units                   - Measurement units
GET    /tax-types                           - Tax types
GET    /tax-rates                           - Tax rates
GET    /tax-factors                         - Tax factors (for IVARBU)
GET    /discount-types                      - Discount types
GET    /factory-charges                     - Factory charge types
GET    /reference-types                     - Reference types
GET    /identification-types                - Identification types
```

**Note:** These endpoints can be in Sales Service or a separate Data Service.

---

## 6. Implementation Checklist

### 6.1 Sales Service
- [ ] Create FastAPI application
- [ ] Implement database models (sales, sale_lines)
- [ ] Implement create sale endpoint
- [ ] Implement list sales endpoint
- [ ] Implement get sale endpoint
- [ ] Implement update sale endpoint
- [ ] Implement delete sale endpoint
- [ ] Implement file upload endpoint
- [ ] Implement S3 integration
- [ ] Implement pre-signed URL generation
- [ ] Implement message queue producer
- [ ] Implement consecutive number generation
- [ ] Implement document key generation
- [ ] Add validation rules
- [ ] Add error handling
- [ ] Add logging
- [ ] Add unit tests
- [ ] Add integration tests

### 6.2 Validation Service
- [ ] Create FastAPI application
- [ ] Implement database models (validations)
- [ ] Implement submit validation endpoint
- [ ] Implement get validation status endpoint
- [ ] Implement Hacienda validation endpoint
- [ ] Integrate with Hacienda API
- [ ] Implement message queue producer
- [ ] Add validation rules
- [ ] Add error handling
- [ ] Add logging
- [ ] Add unit tests
- [ ] Add integration tests

### 6.3 Notification Service
- [ ] Create FastAPI application
- [ ] Implement database models (notifications)
- [ ] Implement resend email endpoint
- [ ] Implement get notification status endpoint
- [ ] Implement email templates
- [ ] Integrate with email service (SendGrid/SES)
- [ ] Implement message queue consumer
- [ ] Add error handling
- [ ] Add logging
- [ ] Add unit tests
- [ ] Add integration tests

### 6.4 Infrastructure
- [ ] Set up message queue (RabbitMQ/SQS)
- [ ] Set up S3 bucket for documents
- [ ] Set up API Gateway
- [ ] Set up databases (PostgreSQL)
- [ ] Set up monitoring (CloudWatch/Datadog)
- [ ] Set up logging (ELK/CloudWatch)
- [ ] Set up CI/CD pipelines
- [ ] Set up environment variables
- [ ] Set up secrets management

---

## 7. Technology Stack

**Framework:** FastAPI (Python 3.11+)
**Database:** PostgreSQL 14+
**Message Queue:** RabbitMQ or AWS SQS
**File Storage:** AWS S3
**Email Service:** SendGrid or AWS SES
**API Gateway:** AWS API Gateway or Kong
**Monitoring:** CloudWatch or Datadog
**Logging:** CloudWatch Logs or ELK Stack

---

## 8. Security Considerations

- [ ] Implement JWT authentication
- [ ] Implement organization-level authorization
- [ ] Validate all input data
- [ ] Sanitize file uploads
- [ ] Use pre-signed URLs with expiration
- [ ] Encrypt sensitive data at rest
- [ ] Use HTTPS for all communications
- [ ] Implement rate limiting
- [ ] Implement CORS policies
- [ ] Log security events

---

## 9. Performance Considerations

- [ ] Implement database indexing
- [ ] Implement caching (Redis)
- [ ] Implement pagination
- [ ] Optimize database queries
- [ ] Use async operations
- [ ] Implement connection pooling
- [ ] Monitor query performance
- [ ] Implement CDN for file delivery

---

## 10. Deployment Strategy

### 10.1 Development
- Local Docker Compose setup
- Local PostgreSQL databases
- Local RabbitMQ
- LocalStack for S3

### 10.2 Staging
- AWS ECS or Kubernetes
- AWS RDS PostgreSQL
- AWS SQS
- AWS S3
- AWS SES

### 10.3 Production
- AWS ECS or Kubernetes (multi-AZ)
- AWS RDS PostgreSQL (multi-AZ)
- AWS SQS
- AWS S3 with CloudFront
- AWS SES
- Auto-scaling enabled
- Load balancing

---

## Version History

- **v1.0** (2026-05-07) - Initial backend plan with microservices architecture
