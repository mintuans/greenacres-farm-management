# 🔄 Rollback SOLID Architecture - Complete Guide

## ⚠️ Warning

**Trước khi rollback, hãy chắc chắn:**
- ✅ Đã backup code hiện tại
- ✅ Hiểu rõ lý do muốn rollback
- ✅ Đã commit code vào Git

---

## 📋 Rollback Steps

### Step 1: Revert Frontend API Files

**Xóa SOLID API files:**
```bash
cd frontend/src/api
rm -f partner-solid.api.ts
rm -f work-schedule-solid.api.ts
rm -f inventory-solid.api.ts
rm -f transaction-solid.api.ts
rm -f season-solid.api.ts
rm -f payroll-solid.api.ts
rm -f job-type-solid.api.ts
rm -f work-shift-solid.api.ts
rm -f warehouse-type-solid.api.ts
```

**Revert component imports:**

Tìm và thay thế trong tất cả files:
```typescript
// Find:
from '../api/partner-solid.api'
from '../api/work-schedule-solid.api'
from '../api/inventory-solid.api'
from '../api/transaction-solid.api'
from '../api/season-solid.api'
from '../api/payroll-solid.api'

// Replace with:
from '../api/partner.api'
from '../api/work-schedule.api'
from '../api/inventory.api'
from '../api/transaction.api'
from '../api/season.api'
from '../api/payroll.api'
```

**Files cần update (11 files):**
```
src/pages/WorkSchedules.tsx
src/pages/Workers.tsx
src/pages/Transactions.tsx
src/pages/Schedule.tsx
src/pages/DailyWorkLogs.tsx
src/pages/Inventory.tsx
src/pages/Seasons.tsx
src/pages/FarmEvents.tsx
src/pages/PayrollManagement.tsx
```

---

### Step 2: Revert Backend Routes

**Update server.ts:**

```typescript
// Remove SOLID routes
- import solidRoutes from './routes/solid';
- app.use('/api/solid', solidRoutes);

// Keep only old routes
app.use('/api/management', managementRoutes);
app.use('/api', otherRoutes);
```

**File:** `backend/src/server.ts`

---

### Step 3: Remove SOLID Code (Optional)

**Nếu muốn xóa hoàn toàn:**

```bash
cd backend/src

# Remove SOLID directories
rm -rf presentation/
rm -rf domain/
rm -rf infrastructure/
rm -rf core/

# Remove SOLID routes
rm -rf routes/solid/

# Remove SOLID scripts
rm -rf ../scripts/create-solid-routes.js
rm -rf ../scripts/fix-solid-routes.js
rm -rf ../scripts/generate-solid-modules.js
rm -rf ../scripts/analyze-missing-endpoints.js
```

---

### Step 4: Remove Dependencies

**Update package.json:**

```json
// Remove these dependencies:
"inversify": "^6.0.2",
"reflect-metadata": "^0.2.1"
```

**Run:**
```bash
cd backend
npm uninstall inversify reflect-metadata
```

---

### Step 5: Clean Up Documentation

```bash
cd document
rm -f SOLID_STATUS_FINAL.md
rm -f CLEANUP_REPORT.md
rm -f BACKEND_STRUCTURE.md
```

---

## 🎯 Quick Rollback Script

**Create:** `rollback-solid.sh`

```bash
#!/bin/bash

echo "🔄 Rolling back SOLID architecture..."

# Frontend
echo "📱 Reverting frontend..."
cd frontend/src/api
rm -f *-solid.api.ts

# Update imports (manual step)
echo "⚠️  Please manually update component imports"
echo "   Change: *-solid.api → *.api"

# Backend
echo "🔧 Reverting backend..."
cd ../../../backend/src

# Comment out SOLID routes in server.ts
echo "⚠️  Please manually update server.ts"
echo "   Remove: app.use('/api/solid', solidRoutes)"

# Optional: Remove SOLID code
read -p "Remove SOLID code completely? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    rm -rf presentation/
    rm -rf domain/
    rm -rf infrastructure/
    rm -rf core/
    rm -rf routes/solid/
    echo "✅ SOLID code removed"
fi

echo "✅ Rollback complete!"
echo "⚠️  Don't forget to:"
echo "   1. Update component imports"
echo "   2. Update server.ts"
echo "   3. Restart backend server"
```

---

## 🔍 Verification

**After rollback, verify:**

### 1. Frontend
```bash
# Check imports
grep -r "solid.api" frontend/src/pages/
# Should return nothing

# Check old API still works
curl http://localhost:5000/api/management/partners
```

### 2. Backend
```bash
# Check server.ts
cat backend/src/server.ts | grep solid
# Should return nothing or commented out

# Restart server
cd backend
npm run dev
```

### 3. Test Application
```
1. Open http://localhost:5173
2. Test all pages
3. Verify CRUD operations work
4. Check no console errors
```

---

## ⚡ Alternative: Keep Both APIs

**Thay vì xóa hoàn toàn, có thể giữ cả 2:**

### Option 1: Dual API (Recommended)
```typescript
// server.ts
app.use('/api/management', managementRoutes);  // Old API
app.use('/api/solid', solidRoutes);            // New API (keep)
```

**Benefits:**
- ✅ Có thể switch qua lại dễ dàng
- ✅ Test so sánh performance
- ✅ Gradual migration
- ✅ Rollback nhanh (chỉ cần đổi import)

### Option 2: Feature Flag
```typescript
// config.ts
export const USE_SOLID_API = process.env.USE_SOLID === 'true';

// frontend
const apiPath = USE_SOLID_API ? '/api/solid' : '/api/management';
```

**Benefits:**
- ✅ Switch bằng environment variable
- ✅ A/B testing
- ✅ Zero downtime rollback

---

## 📊 Comparison

### Keep SOLID
**Pros:**
- ✅ Better architecture
- ✅ Easier to maintain
- ✅ Easier to test
- ✅ Scalable

**Cons:**
- ⚠️ More complex
- ⚠️ More files
- ⚠️ Learning curve

### Rollback to Old
**Pros:**
- ✅ Simpler
- ✅ Familiar
- ✅ Less files

**Cons:**
- ❌ Harder to maintain
- ❌ Harder to test
- ❌ Less scalable
- ❌ Mixed concerns

---

## 💡 Recommendation

**Thay vì rollback hoàn toàn:**

### Option A: Keep Dual API
```
✅ Giữ cả 2 APIs
✅ Frontend dùng old API
✅ SOLID code vẫn còn (có thể dùng sau)
```

### Option B: Gradual Rollback
```
✅ Rollback từng module
✅ Test từng bước
✅ Giữ lại modules tốt
```

### Option C: Feature Flag
```
✅ Switch qua lại bằng config
✅ Test performance
✅ Quyết định sau
```

---

## 🎯 Quick Decision Guide

**Rollback nếu:**
- ❌ Team không quen SOLID
- ❌ Không có thời gian maintain
- ❌ Project nhỏ, đơn giản

**Keep SOLID nếu:**
- ✅ Muốn code quality tốt
- ✅ Project sẽ scale lớn
- ✅ Có thời gian maintain
- ✅ Team muốn học SOLID

---

## 📝 Files to Rollback

### Frontend (11 files)
```
src/pages/WorkSchedules.tsx
src/pages/Workers.tsx
src/pages/Transactions.tsx
src/pages/Schedule.tsx
src/pages/DailyWorkLogs.tsx
src/pages/Inventory.tsx
src/pages/Seasons.tsx
src/pages/FarmEvents.tsx
src/pages/PayrollManagement.tsx
src/api/*-solid.api.ts (9 files)
```

### Backend (1 file)
```
src/server.ts (comment out SOLID routes)
```

### Optional Cleanup
```
src/presentation/ (9 controllers)
src/domain/ (27 files)
src/infrastructure/ (10 files)
src/core/ (4 files)
src/routes/solid/ (10 files)
```

---

## ✅ Checklist

- [ ] Backup current code
- [ ] Commit to Git
- [ ] Remove SOLID API files (frontend)
- [ ] Update component imports (11 files)
- [ ] Update server.ts (backend)
- [ ] Remove SOLID dependencies (optional)
- [ ] Remove SOLID code (optional)
- [ ] Test all pages
- [ ] Verify CRUD operations
- [ ] Check console for errors

---

**Estimated Time:** 30-60 minutes

**Risk:** Low (old code vẫn còn nguyên)

**Recommendation:** Giữ dual API thay vì xóa hoàn toàn

---

**Bạn muốn tôi giúp rollback không?** 🔄
