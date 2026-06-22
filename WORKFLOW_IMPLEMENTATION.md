# 🎯 WORKFLOW IMPLEMENTATION - HOÀN THÀNH 90%

## ✅ ĐÃ HOÀN THÀNH

### Backend (100%)
1. ✅ **Email Utility** (`backend/src/utils/email.js`)
   - Professional email template
   - Error handling
   - Skip if no config

2. ✅ **Document Controller** (`backend/src/controllers/document.controller.js`)
   - `getAll()` - Role-based filtering
   - `create()` - With history logging
   - `update()` - With notifications
   - `assign()` - Assign + email + notification
   - `approve()` - Approve + email + notification
   - `reject()` - Reject + email + notification
   - `delete()` - Cascade delete
   - `getStats()` - Statistics

3. ✅ **Document Routes** (`backend/src/routes/document.routes.js`)
   - GET `/:type/stats/summary`
   - POST `/:type/:id/assign`
   - POST `/outgoing/:id/approve`
   - POST `/outgoing/:id/reject`

### Frontend - Core (100%)
4. ✅ **API Services** (`fontend/src/services/api.js`)
   - `documentAPI.assign()`
   - `documentAPI.approve()`
   - `documentAPI.reject()`
   - `documentAPI.getStats()`

5. ✅ **AssignDocumentModal** (`fontend/src/components/documents/AssignDocumentModal.jsx`)
   - Select user
   - Set deadline
   - Add note
   - Beautiful UI

6. ✅ **ApprovalModal** (`fontend/src/components/documents/ApprovalModal.jsx`)
   - Approve/Reject actions
   - Required note for reject
   - Confirmation message
   - Beautiful UI

---

## ⏳ CẦN HOÀN THÀNH (10%)

### Update Incoming.jsx

**Cần thêm:**

```javascript
// 1. Import
import AssignDocumentModal from '../../components/documents/AssignDocumentModal';

// 2. State
const [showAssignModal, setShowAssignModal] = useState(false);
const [assigningDoc, setAssigningDoc] = useState(null);

// 3. Check permission
const user = JSON.parse(sessionStorage.getItem('user') || '{}');
const canAssign = ['admin', 'leader'].includes(user.role);

// 4. Handle assign
const handleAssign = (doc) => {
    setAssigningDoc(doc);
    setShowAssignModal(true);
};

const handleAssignSuccess = () => {
    fetchDocuments(); // Reload list
};

// 5. Add column in table
{canAssign && (
    <th>Người xử lý</th>
)}

// 6. Add data in table row
{canAssign && (
    <td>{doc.assigned_to_name || '-'}</td>
)}

// 7. Add button in actions
{canAssign && doc.status === 'pending' && (
    <button onClick={() => handleAssign(doc)}>
        👥 Phân công
    </button>
)}

// 8. Render modal
{showAssignModal && assigningDoc && (
    <AssignDocumentModal
        document={assigningDoc}
        onClose={() => setShowAssignModal(false)}
        onSuccess={handleAssignSuccess}
    />
)}
```

---

### Update Outgoing.jsx

**Cần thêm:**

```javascript
// 1. Import
import ApprovalModal from '../../components/documents/ApprovalModal';

// 2. State
const [showApprovalModal, setShowApprovalModal] = useState(false);
const [approvalDoc, setApprovalDoc] = useState(null);
const [approvalAction, setApprovalAction] = useState('approve');

// 3. Check permission
const user = JSON.parse(sessionStorage.getItem('user') || '{}');
const canApprove = ['admin', 'leader'].includes(user.role);

// 4. Handle actions
const handleSendForApproval = async (doc) => {
    // Update status to pending_approval
    await documentAPI.update('outgoing', doc.id, {
        ...doc,
        status: 'pending_approval'
    });
    fetchDocuments();
};

const handleApprove = (doc) => {
    setApprovalDoc(doc);
    setApprovalAction('approve');
    setShowApprovalModal(true);
};

const handleReject = (doc) => {
    setApprovalDoc(doc);
    setApprovalAction('reject');
    setShowApprovalModal(true);
};

const handleApprovalSuccess = () => {
    fetchDocuments();
};

// 5. Add columns in table
<th>Người soạn</th>
{canApprove && <th>Người duyệt</th>}

// 6. Add data in table row
<td>{doc.created_by_name || '-'}</td>
{canApprove && <td>{doc.approved_by_name || '-'}</td>}

// 7. Add buttons in actions
{doc.status === 'draft' && (
    <button onClick={() => handleSendForApproval(doc)}>
        📨 Gửi duyệt
    </button>
)}

{canApprove && doc.status === 'pending_approval' && (
    <>
        <button onClick={() => handleApprove(doc)}>
            ✓ Duyệt
        </button>
        <button onClick={() => handleReject(doc)}>
            ✗ Từ chối
        </button>
    </>
)}

// 8. Update stats
const stats = [
    { label: 'Tổng số', value: documents.length, color: 'blue' },
    { label: 'Dự thảo', value: documents.filter(d => d.status === 'draft').length, color: 'gray' },
    { label: 'Chờ duyệt', value: documents.filter(d => d.status === 'pending_approval').length, color: 'yellow' },
    { label: 'Đã duyệt', value: documents.filter(d => d.status === 'approved').length, color: 'green' },
    { label: 'Đã gửi', value: documents.filter(d => d.status === 'sent').length, color: 'teal' }
];

// 9. Render modal
{showApprovalModal && approvalDoc && (
    <ApprovalModal
        document={approvalDoc}
        action={approvalAction}
        onClose={() => setShowApprovalModal(false)}
        onSuccess={handleApprovalSuccess}
    />
)}
```

---

## 🚀 BƯỚC TIẾP THEO

Bạn muốn tôi:

**A. Update Incoming.jsx** (văn bản đến)
**B. Update Outgoing.jsx** (văn bản đi)
**C. Update cả 2 files** (nhanh nhất)

**Khuyến nghị: Chọn C** để hoàn thành 100%!
