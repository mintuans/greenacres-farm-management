# Hướng dẫn triển khai Lịch làm việc thực tế

## 📅 Tổng quan

Lịch làm việc đã được triển khai với các tính năng:
- ✅ Hiển thị lịch động theo tháng/năm thực tế
- ✅ Tự động highlight ngày hôm nay
- ✅ Chuyển tháng trước/sau
- ✅ Nút "Hôm nay" để quay về tháng hiện tại
- ✅ Hiển thị events theo từng ngày
- ✅ Thống kê tổng số events theo loại

## 🏗️ Kiến trúc

### 1. Calendar Utilities (`src/utils/calendar.utils.ts`)

File này chứa các hàm tiện ích để xử lý lịch:

```typescript
// Tạo mảng 42 ngày (6 tuần) cho lưới lịch
generateCalendarDays(year, month) 

// Lấy số ngày trong tháng
getDaysInMonth(year, month)

// Kiểm tra ngày hôm nay
isToday(date)

// So sánh hai ngày
isSameDay(date1, date2)

// Format tên tháng tiếng Việt
getMonthName(month)
```

### 2. Type Definitions (`src/@types/schedule.types.ts`)

Định nghĩa các interface cho events:

```typescript
interface ScheduleEvent {
  id: string;
  title: string;
  type: 'staff' | 'task' | 'harvest' | 'issue' | 'maintenance';
  date: Date;
  startTime?: string;
  endTime?: string;
  // ...
}
```

### 3. Schedule Component (`src/pages/Schedule.tsx`)

Component chính hiển thị lịch với:
- State quản lý tháng/năm hiện tại
- useMemo để tối ưu việc tính toán lịch
- Functions để chuyển tháng
- Hiển thị events theo ngày

## 🔧 Cách hoạt động

### Tính toán lịch

```typescript
// 1. Lấy tháng/năm hiện tại
const [currentDate, setCurrentDate] = useState(new Date());
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

// 2. Tạo lưới lịch 42 ô (6 tuần x 7 ngày)
const calendarDays = useMemo(() => {
  return generateCalendarDays(currentYear, currentMonth);
}, [currentYear, currentMonth]);

// 3. Lấy events cho từng ngày
const getEventsForDay = (day: CalendarDay): ScheduleEvent[] => {
  return events.filter(event => isSameDay(event.date, day.date));
};
```

### Chuyển tháng

```typescript
// Tháng trước
const goToPreviousMonth = () => {
  setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
};

// Tháng sau
const goToNextMonth = () => {
  setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
};

// Về hôm nay
const goToToday = () => {
  setCurrentDate(new Date());
};
```

## 📊 Dữ liệu mẫu

Hiện tại đang dùng dữ liệu mẫu hardcode:

```typescript
const [events] = useState<ScheduleEvent[]>([
  {
    id: '1',
    title: 'Bắt đầu mùa trồng',
    type: 'task',
    date: new Date(2026, 0, 8), // 8/1/2026
  },
  // ...
]);
```

## 🚀 Bước tiếp theo: Tích hợp Backend

### 1. Tạo API endpoints

Tạo file `backend/src/routes/schedule.routes.ts`:

```typescript
import { Router } from 'express';

const router = Router();

// GET /api/schedules?month=1&year=2026
router.get('/', async (req, res) => {
  const { month, year } = req.query;
  // Lấy events từ database
});

// POST /api/schedules
router.post('/', async (req, res) => {
  // Tạo event mới
});

// PUT /api/schedules/:id
router.put('/:id', async (req, res) => {
  // Cập nhật event
});

// DELETE /api/schedules/:id
router.delete('/:id', async (req, res) => {
  // Xóa event
});

export default router;
```

### 2. Tạo Database Schema

```sql
CREATE TABLE schedule_events (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type ENUM('staff', 'task', 'harvest', 'issue', 'maintenance'),
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location VARCHAR(255),
  status ENUM('pending', 'in-progress', 'completed', 'cancelled'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE work_shifts (
  id VARCHAR(36) PRIMARY KEY,
  staff_id VARCHAR(36) NOT NULL,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  role ENUM('field-worker', 'machine-operator', 'supervisor', 'other'),
  task VARCHAR(255),
  status ENUM('scheduled', 'confirmed', 'completed', 'absent'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES users(id)
);
```

### 3. Tạo API Service

Tạo file `frontend/src/api/schedule.api.ts`:

```typescript
import axios from 'axios';
import { ScheduleEvent } from '@/src/@types/schedule.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const scheduleAPI = {
  // Lấy events theo tháng
  getEventsByMonth: async (month: number, year: number): Promise<ScheduleEvent[]> => {
    const response = await axios.get(`${API_URL}/schedules`, {
      params: { month, year }
    });
    return response.data.map((event: any) => ({
      ...event,
      date: new Date(event.event_date)
    }));
  },

  // Tạo event mới
  createEvent: async (event: Omit<ScheduleEvent, 'id'>): Promise<ScheduleEvent> => {
    const response = await axios.post(`${API_URL}/schedules`, event);
    return response.data;
  },

  // Cập nhật event
  updateEvent: async (id: string, event: Partial<ScheduleEvent>): Promise<ScheduleEvent> => {
    const response = await axios.put(`${API_URL}/schedules/${id}`, event);
    return response.data;
  },

  // Xóa event
  deleteEvent: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/schedules/${id}`);
  }
};
```

### 4. Cập nhật Schedule Component

```typescript
import { useEffect, useState } from 'react';
import { scheduleAPI } from '@/src/api/schedule.api';

const Schedule: React.FC = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Load events khi tháng thay đổi
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const data = await scheduleAPI.getEventsByMonth(
          currentDate.getMonth(),
          currentDate.getFullYear()
        );
        setEvents(data);
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [currentDate]);

  // ...rest of component
};
```

## 🎨 Tính năng nâng cao có thể thêm

### 1. Modal thêm/sửa event

```typescript
const [showModal, setShowModal] = useState(false);
const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

const handleAddEvent = () => {
  setSelectedEvent(null);
  setShowModal(true);
};

const handleEditEvent = (event: ScheduleEvent) => {
  setSelectedEvent(event);
  setShowModal(true);
};
```

### 2. Click vào ngày để xem chi tiết

```typescript
const [selectedDay, setSelectedDay] = useState<Date | null>(null);

const handleDayClick = (day: CalendarDay) => {
  setSelectedDay(day.date);
  // Show sidebar hoặc modal với danh sách events của ngày đó
};
```

### 3. Drag & Drop events

Sử dụng thư viện như `react-beautiful-dnd` hoặc `dnd-kit`:

```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

### 4. Xuất lịch ra PDF/Excel

```typescript
import jsPDF from 'jspdf';

const exportToPDF = () => {
  const doc = new jsPDF();
  // Generate PDF từ calendar data
  doc.save(`lich-lam-viec-${currentMonth}-${currentYear}.pdf`);
};
```

### 5. Notifications/Reminders

Tích hợp với Web Notifications API:

```typescript
const scheduleNotification = (event: ScheduleEvent) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(event.title, {
      body: event.description,
      icon: '/icon.png'
    });
  }
};
```

## 📱 Responsive Design

Lịch đã được thiết kế responsive:
- Desktop: Hiển thị đầy đủ 7 cột
- Tablet/Mobile: Scroll ngang với `overflow-x-auto`
- Minimum width: 800px cho calendar grid

## 🐛 Xử lý Edge Cases

1. **Năm nhuận**: Hàm `getDaysInMonth()` tự động xử lý
2. **Chuyển năm**: Khi chuyển từ tháng 12 sang tháng 1 (và ngược lại)
3. **Timezone**: Sử dụng Date object của JavaScript, cần cẩn thận khi lưu vào DB
4. **Performance**: Sử dụng `useMemo` để tránh tính toán lại không cần thiết

## 📝 Checklist triển khai đầy đủ

- [x] Hiển thị lịch động
- [x] Chuyển tháng trước/sau
- [x] Highlight ngày hôm nay
- [x] Hiển thị events
- [x] Thống kê events
- [ ] Tích hợp backend API
- [ ] Modal thêm/sửa event
- [ ] Click vào ngày để xem chi tiết
- [ ] Xóa event
- [ ] Filter theo loại event
- [ ] Search events
- [ ] Export PDF/Excel
- [ ] Notifications
- [ ] Recurring events (sự kiện lặp lại)
- [ ] Multi-user support
- [ ] Permission management

## 🎯 Kết luận

Bạn đã có một lịch làm việc thực tế với:
- ✅ Logic tính toán ngày tháng chính xác
- ✅ UI/UX đẹp và responsive
- ✅ Cấu trúc code clean và dễ mở rộng
- ✅ Type-safe với TypeScript

Bước tiếp theo là tích hợp với backend để lưu trữ và quản lý dữ liệu thực tế!
