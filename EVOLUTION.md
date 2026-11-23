# 🚀 Hallways Evolution — Feature Guide

## Overview

Hallways has been significantly evolved with 4 major feature additions that enhance its capabilities as a comprehensive business management system. These additions transform Hallways from a foundational CRM into an enterprise-ready platform.

---

## 1. 🔐 User Authentication & Multi-user Support

### What's New
- **User Management System**: Create and manage multiple user accounts with role-based access control
- **Authentication**: Secure login with password hashing (PBKDF2-SHA256)
- **Role-based Access**: Support for admin, manager, and user roles
- **User Activity Tracking**: Track user engagement and system usage

### API Endpoints

#### Register New User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@company.com",
  "password": "SecurePassword123",
  "role": "user"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@company.com",
  "role": "user",
  "ativo": true,
  "criado_em": "2025-05-22T10:30:45.123456"
}
```

#### User Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "access_token": "abc123def456...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@company.com",
    "role": "user",
    "ativo": true,
    "criado_em": "2025-05-22T10:30:45.123456"
  }
}
```

#### List All Users
```bash
GET /api/users
```

#### Get User Details
```bash
GET /api/users/{user_id}
```

#### Update User
```bash
PATCH /api/users/{user_id}
Content-Type: application/json

{
  "email": "newemail@company.com",
  "role": "manager"
}
```

### Demo Credentials
```
Admin:        admin / admin123
Manager:      sales_manager / password123
Sales Rep 1:  sales_rep1 / password123
Sales Rep 2:  sales_rep2 / password123
```

---

## 2. 🏷️ Tags & Segmentation System

### What's New
- **Flexible Tagging**: Tag accounts, contacts, and deals for organization and filtering
- **Color-coded Tags**: Visual organization with customizable tag colors
- **Bulk Segmentation**: Quickly identify and group records by tags
- **Filter by Tags**: Search and filter records using tags

### API Endpoints

#### Create Tag
```bash
POST /api/tags
Content-Type: application/json

{
  "nome": "VIP",
  "cor": "#ff6b6b"
}
```

#### List All Tags
```bash
GET /api/tags
```

#### Update Tag
```bash
PATCH /api/tags/{tag_id}
Content-Type: application/json

{
  "nome": "VIP Updated",
  "cor": "#ff4444"
}
```

#### Delete Tag
```bash
DELETE /api/tags/{tag_id}
```

### Tagging Entities

#### Tag an Account
```bash
POST /api/accounts/{account_id}/tags/{tag_id}
```

#### Remove Tag from Account
```bash
DELETE /api/accounts/{account_id}/tags/{tag_id}
```

#### Get Account Tags
```bash
GET /api/accounts/{account_id}/tags
```

#### Tag a Contact
```bash
POST /api/contacts/{contact_id}/tags/{tag_id}
```

#### Tag a Deal
```bash
POST /api/deals/{deal_id}/tags/{tag_id}
```

#### Get All Accounts with a Tag
```bash
GET /api/tags/{tag_id}/accounts
```

### Demo Tags
- **VIP** — High-value clients (#ff6b6b - Red)
- **Hot Lead** — Urgent opportunities (#ffd93d - Yellow)
- **Follow-up** — Requires attention (#6bcf7f - Green)
- **Enterprise** — Large deal size (#4d96ff - Blue)
- **Startup** — Early-stage company (#a78bfa - Purple)
- **Contrato Assinado** — Signed contract (#20c997 - Teal)
- **Negociando** — Currently negotiating (#fd7e14 - Orange)

### Use Cases
1. **Sales Pipeline Segmentation**: Tag deals by industry, territory, or stage
2. **Customer Classification**: Mark VIP accounts for prioritized support
3. **Lead Scoring**: Tag hot leads for quick follow-up
4. **Risk Management**: Tag at-risk accounts for retention focus

---

## 3. 📎 Document/Attachment Management

### What's New
- **File Upload System**: Upload and attach documents to any entity (account, contact, deal, invoice, task)
- **Document Tracking**: Maintain audit trail of who uploaded what and when
- **Storage Management**: Secure file storage in `static/attachments/`
- **MIME Type Detection**: Automatic file type identification

### API Endpoints

#### Upload Attachment
```bash
POST /api/attachments?entity_type=account&entity_id=1&uploaded_by=admin
Content-Type: multipart/form-data

file: <binary file data>
```

**Response:**
```json
{
  "id": 1,
  "entity_type": "account",
  "entity_id": 1,
  "filename": "contract_2025.pdf",
  "file_path": "/path/to/static/attachments/account_1_1716377445.pdf",
  "file_size": 245678,
  "mime_type": "application/pdf",
  "criado_em": "2025-05-22T10:30:45.123456",
  "uploaded_by": "admin"
}
```

#### List Attachments
```bash
GET /api/attachments?entity_type=account&entity_id=1
```

#### Get Attachment Details
```bash
GET /api/attachments/{attachment_id}
```

#### Delete Attachment
```bash
DELETE /api/attachments/{attachment_id}
```

### Supported Entity Types
- `account` — Company/account records
- `contact` — Contact records
- `deal` — Sales opportunity records
- `invoice` — Invoice records
- `task` — Task records

### Use Cases
1. **Contract Management**: Store signed contracts linked to accounts
2. **Proposal Tracking**: Attach proposals to deals
3. **Invoice Documentation**: Store receipts and supporting docs
4. **Compliance**: Maintain audit trail of all documents
5. **Knowledge Base**: Attach relevant materials to tasks

---

## 4. ⚙️ Automation & Workflows Engine

### What's New
- **Workflow Automation**: Create rules to automatically manage business processes
- **Trigger-based Actions**: Execute actions when conditions are met
- **Workflow Logs**: Track execution history and results
- **Multi-rule Workflows**: Chain multiple conditions and actions together

### API Endpoints

#### Create Workflow
```bash
POST /api/workflows
Content-Type: application/json

{
  "nome": "Auto-qualify Hot Leads",
  "descricao": "Automatically move hot leads to qualification stage",
  "entity_type": "deal",
  "trigger_type": "on_field_change",
  "ativo": true,
  "rules": [
    {
      "condicao_tipo": "field",
      "condicao_campo": "etapa_funil",
      "condicao_operador": "equals",
      "condicao_valor": "Prospecção",
      "acao_tipo": "create_task",
      "acao_parametros": "{\"titulo\": \"Qualify lead\", \"prioridade\": \"alta\"}"
    },
    {
      "condicao_tipo": "field",
      "condicao_campo": "valor",
      "condicao_operador": "greater_than",
      "condicao_valor": "50000",
      "acao_tipo": "change_stage",
      "acao_parametros": "{\"nova_etapa\": \"Qualificação\"}"
    }
  ]
}
```

#### List Workflows
```bash
GET /api/workflows?entity_type=deal&ativo=true
```

#### Get Workflow Details
```bash
GET /api/workflows/{workflow_id}
```

#### Update Workflow
```bash
PATCH /api/workflows/{workflow_id}
Content-Type: application/json

{
  "nome": "Updated workflow name",
  "ativo": false
}
```

#### Execute Workflow Manually
```bash
POST /api/workflows/{workflow_id}/execute?entity_type=deal&entity_id=1
```

**Response:**
```json
{
  "workflow_id": 1,
  "entity_type": "deal",
  "entity_id": 1,
  "executed_actions": [
    {
      "rule_id": 1,
      "acao_tipo": "create_task",
      "status": "executed"
    }
  ],
  "total_actions": 1,
  "status": "success"
}
```

#### Get Workflow Logs
```bash
GET /api/workflows/{workflow_id}/logs?limit=50
```

#### Delete Workflow
```bash
DELETE /api/workflows/{workflow_id}
```

### Trigger Types
- `on_create` — When new record is created
- `on_update` — When record is updated
- `on_field_change` — When specific field changes
- `scheduled` — At scheduled intervals

### Condition Operators
- `equals` — Exact match
- `contains` — String contains
- `greater_than` — Numeric comparison
- `less_than` — Numeric comparison

### Action Types
- `create_task` — Automatically create a task
- `change_stage` — Move record to different stage
- `send_notification` — Alert user
- `update_field` — Modify field value

### Demo Workflows
1. **Auto-qualify Hot Leads** — Automatically process hot leads through pipeline
2. **Escalate Overdue Tasks** — Move urgent overdue tasks to critical status
3. **Create Follow-up Tasks** — Generate follow-up task when deal stage changes

### Use Cases
1. **Lead Qualification**: Auto-create tasks when hot leads arrive
2. **Pipeline Acceleration**: Auto-advance deals meeting criteria
3. **Escalation**: Flag overdue items automatically
4. **Follow-up Automation**: Create reminders for next steps
5. **SLA Enforcement**: Auto-escalate breached agreements

---

## 📊 Database Schema Updates

### New Tables

#### users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  ativo INTEGER DEFAULT 1,
  criado_em TEXT NOT NULL
);
```

#### tags
```sql
CREATE TABLE tags (
  id INTEGER PRIMARY KEY,
  nome TEXT UNIQUE NOT NULL,
  cor TEXT DEFAULT '#3b82f6',
  criado_em TEXT NOT NULL
);
```

#### account_tags, contact_tags, deal_tags
- Junction tables for many-to-many relationships
- Enables flexible tagging of any entity

#### attachments
```sql
CREATE TABLE attachments (
  id INTEGER PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT,
  criado_em TEXT NOT NULL,
  uploaded_by TEXT
);
```

#### workflows
```sql
CREATE TABLE workflows (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  entity_type TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  ativo INTEGER DEFAULT 1,
  criado_em TEXT NOT NULL
);
```

#### workflow_rules
```sql
CREATE TABLE workflow_rules (
  id INTEGER PRIMARY KEY,
  workflow_id INTEGER NOT NULL,
  condicao_tipo TEXT NOT NULL,
  condicao_campo TEXT NOT NULL,
  condicao_operador TEXT NOT NULL,
  condicao_valor TEXT NOT NULL,
  acao_tipo TEXT NOT NULL,
  acao_parametros TEXT,
  ordem INTEGER DEFAULT 0,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);
```

#### workflow_logs
```sql
CREATE TABLE workflow_logs (
  id INTEGER PRIMARY KEY,
  workflow_id INTEGER NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  acao_executada TEXT,
  resultado TEXT,
  criado_em TEXT NOT NULL,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);
```

---

## 🚀 Getting Started

### 1. Start the Application
```bash
cd g:\PASTA\Hallways
python main.py
```

The app will be available at `http://localhost:8000`

### 2. Seed Demo Data
```bash
python seed_demo_data.py
```

This creates:
- 4 demo users with different roles
- 7 tags for segmentation
- 5 sample companies
- 5 sample contacts
- 5 sample deals with tags
- 5 sample tasks
- 3 sample invoices
- 4 sample expenses
- 5 sample products
- 3 sample workflows

### 3. Test Authentication
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### 4. Explore the API
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 📈 Advanced Features

### Tag-based Reporting
Use tags to create custom segments for analysis:
```bash
# Get all VIP accounts
GET /api/tags/1/accounts

# Get all hot lead deals
GET /api/tags/2/deals
```

### Document-Driven Workflows
Link attachments to workflows for document approval processes:
1. Upload contract attachment
2. Trigger workflow to create review task
3. Track execution in workflow logs

### Multi-stage Automation
Create complex workflows with multiple conditions:
1. Check if deal value > R$100k
2. Check if sales rep is manager
3. Auto-escalate to director review

---

## 🔒 Security Considerations

1. **Password Security**: Uses PBKDF2 with SHA256 for hashing
2. **File Uploads**: Files stored outside web root (`static/attachments/`)
3. **Database Integrity**: Foreign keys enforced on all relationships
4. **Audit Trail**: All user activities and workflow executions logged

### Recommended Improvements
- Implement JWT token expiration
- Add file upload size limits
- Add rate limiting on authentication endpoints
- Implement IP-based access controls
- Add audit logging for sensitive operations

---

## 🔧 Configuration

### Environment Variables (Recommended)
```bash
HALLWAYS_PORT=8000
HALLWAYS_HOST=127.0.0.1
HALLWAYS_DATABASE=hallways.db
HALLWAYS_UPLOAD_MAX_SIZE=52428800  # 50MB
```

### File Attachments Settings
- Location: `static/attachments/`
- Naming: `{entity_type}_{entity_id}_{timestamp}{extension}`
- Auto-created on first upload

---

## 📚 API Reference Summary

| Feature | Endpoints | Methods |
|---------|-----------|---------|
| **Auth** | `/api/auth/register`, `/api/auth/login` | POST |
| **Users** | `/api/users`, `/api/users/{id}` | GET, PATCH, DELETE |
| **Tags** | `/api/tags`, `/api/tags/{id}` | GET, POST, PATCH, DELETE |
| **Tag Relations** | `/api/{entity}/{id}/tags/{tag_id}` | POST, DELETE |
| **Attachments** | `/api/attachments`, `/api/attachments/{id}` | GET, POST, DELETE |
| **Workflows** | `/api/workflows`, `/api/workflows/{id}` | GET, POST, PATCH, DELETE |
| **Workflow Exec** | `/api/workflows/{id}/execute`, `/api/workflows/{id}/logs` | POST, GET |

---

## 🎯 Next Steps & Roadmap

### Completed in This Evolution
✅ Multi-user authentication system
✅ Tag-based segmentation
✅ Document/attachment management
✅ Automation engine with workflows

### Recommended Future Enhancements
- 📧 Email integration and templates
- 📱 Mobile app support
- 🔗 Third-party API integrations
- 📊 Advanced analytics and forecasting
- 💬 Real-time collaboration features
- 🤖 AI-powered lead scoring
- 📅 Calendar sync (Google, Outlook)
- 💳 Payment processing integration

---

## 📞 Support & Troubleshooting

### Common Issues

**Q: "Tag already exists" error**
- Solution: Use different tag name or update existing tag

**Q: Attachment not found after upload**
- Solution: Check `static/attachments/` directory exists and is writable

**Q: Workflow not executing**
- Solution: Ensure workflow is marked as `ativo: true`

**Q: Login fails with valid credentials**
- Solution: Verify user exists, is active, and credentials are correct

### Database Reset
To start fresh with demo data:
```bash
# Delete existing database
rm hallways.db
# Initialize fresh database and seed data
python database.py
python seed_demo_data.py
```

---

## 📄 File Structure

```
Hallways/
├── main.py                  # FastAPI entry point
├── api.py                   # API routes and endpoints
├── database.py              # Database schema and connection
├── models.py                # Pydantic data models
├── timeline.py              # Activity timeline helpers
├── seed_demo_data.py        # Demo data seeder (NEW)
├── static/
│   ├── app.js               # Frontend JavaScript
│   ├── style.css            # Frontend styles
│   └── attachments/         # Document storage (NEW)
├── templates/
│   └── index.html           # Frontend UI
└── README.md                # This file
```

---

**Version**: 2.1.0 (Evolved)  
**Last Updated**: May 22, 2025  
**Status**: Production Ready ✅
