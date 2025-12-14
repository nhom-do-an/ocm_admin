# OCM Frontend - Hệ thống quản trị OCM

## Tổng quan

Ứng dụng web quản trị cho hệ thống OCM (Omni Channel Management), được xây dựng với Next.js 15, React 19, và TypeScript. Hệ thống cung cấp giao diện quản lý toàn diện cho các hoạt động thương mại điện tử.

## Chức năng chính

- **Quản lý sản phẩm**: Tạo, chỉnh sửa, quản lý sản phẩm và biến thể
- **Quản lý danh mục**: Tổ chức sản phẩm theo collections
- **Quản lý kênh bán hàng**: Tích hợp và quản lý các kênh bán hàng
- **Quản lý đơn hàng**: Xử lý đơn hàng, thanh toán, và vận chuyển
- **Quản lý khách hàng**: Quản lý thông tin khách hàng và nhóm khách hàng
- **Quản lý kho**: Theo dõi tồn kho, điều chỉnh tồn kho
- **Quản lý chi nhánh**: Quản lý các địa điểm và kho hàng
- **Thống kê doanh thu**: Báo cáo và phân tích doanh thu
- **Quản lý vận chuyển**: Theo dõi và quản lý đơn vận chuyển
- **Cài đặt hệ thống**: Cấu hình thanh toán, vận chuyển, thông báo, v.v.

## Kiến trúc hệ thống

### Công nghệ sử dụng

- **Framework**: Next.js 15.5.2 (App Router)
- **UI Library**: React 19.1.0
- **Language**: TypeScript 5
- **UI Components**: Ant Design 5.27.3
- **State Management**: Redux Toolkit 2.9.0
- **Form Management**: Formik 2.4.6 + Yup 1.7.1
- **HTTP Client**: Axios 1.12.2
- **Internationalization**: next-intl 4.3.6
- **Styling**: Tailwind CSS 4.1.13
- **Rich Text Editor**: TinyMCE React 6.3.0
- **PDF Generation**: jsPDF 3.0.4 + html2pdf.js 0.12.1

### Kiến trúc thư mục

```
ocm_fe/
├── app/                          # Next.js App Router
│   ├── [locale]/                # Internationalization routes
│   │   ├── (auth)/              # Authentication routes (login, register)
│   │   └── (dashboard)/         # Dashboard routes (protected)
│   │       ├── catalog/         # Catalog management
│   │       ├── collection/      # Collection management
│   │       ├── customer/        # Customer management
│   │       ├── order/           # Order management
│   │       ├── product/         # Product management
│   │       ├── inventory/       # Inventory management
│   │       ├── shipment/        # Shipment management
│   │       └── settings/        # System settings
│   ├── layout.tsx               # Root layout
│   ├── providers.tsx            # Global providers (Redux, Ant Design, etc.)
│   └── globals.css              # Global styles
├── components/                   # Reusable React components
│   ├── common/                  # Common components
│   └── layout/                  # Layout components (Header, Sidebar)
├── containers/                   # Container components (business logic)
├── services/                     # API service layer
│   ├── axios.ts                 # Axios instance with interceptors
│   ├── auth.ts                  # Authentication services
│   ├── product.ts               # Product services
│   ├── order.ts                 # Order services
│   └── ...                      # Other API services
├── hooks/                        # Custom React hooks
│   ├── useGlobalContext.tsx     # Global context hook
│   ├── useNotification.tsx      # Notification hook
│   └── useGlobalLoader.tsx      # Loading state hook
├── lib/                          # Library configurations
│   ├── store.ts                 # Redux store configuration
│   ├── i18n.ts                  # i18n configuration
│   └── suppress-warnings.ts     # Warning suppression
├── constants/                    # Application constants
│   ├── api.ts                   # API endpoint definitions
│   ├── menu.tsx                 # Menu configuration
│   └── constant.ts              # General constants
├── types/                        # TypeScript type definitions
│   ├── interface.ts             # General interfaces
│   ├── request/                 # Request type definitions
│   └── response/                # Response type definitions
├── storages/                     # Local storage utilities
├── utils/                        # Utility functions
├── messages/                     # i18n translation files
│   ├── en.json                  # English translations
│   └── vi.json                  # Vietnamese translations
├── public/                       # Static assets
└── middleware.ts                 # Next.js middleware (i18n routing)
```

### Luồng dữ liệu

1. **API Layer**:

   - Tất cả API calls được định nghĩa trong `constants/api.ts`
   - Services trong `services/` sử dụng Axios instance với interceptors
   - Axios tự động thêm Bearer token vào headers từ localStorage

2. **State Management**:

   - Redux Toolkit cho global state
   - React Context cho UI state (notifications, loading, theme)
   - Local component state cho UI-specific state

3. **Routing**:

   - Next.js App Router với route groups `(auth)` và `(dashboard)`
   - Internationalization với next-intl (vi, en)
   - Middleware xử lý locale detection và routing

4. **Authentication**:
   - JWT token được lưu trong localStorage
   - Axios interceptor tự động thêm token vào requests
   - Protected routes được bảo vệ bởi layout components

## Hướng dẫn cài đặt và chạy

### Yêu cầu hệ thống

- Node.js >= 20.16.0
- npm hoặc yarn
- Docker và Docker Compose (nếu chạy bằng Docker)

### Cài đặt dependencies

```bash
# Sử dụng npm
npm install

# Hoặc sử dụng yarn
yarn install
```

### Cấu hình môi trường

Tạo file `.env.local` trong thư mục gốc với các biến môi trường sau:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# Application Paths
NEXT_PUBLIC_WEB_PATH=http://localhost:3001
NEXT_PUBLIC_POS_PATH=http://localhost:3002

# TinyMCE API Key (cho rich text editor)
NEXT_PUBLIC_TINYMCE_API_KEY=your_tinymce_api_key

# Service Port (cho Docker)
SERVICE_PORT=5000
```

### Chạy ở môi trường Development

```bash
# Chạy development server trên port 3001
npm run dev
# hoặc
yarn dev
```

Ứng dụng sẽ chạy tại: `http://localhost:3001`

### Build cho Production

```bash
# Build ứng dụng
npm run build
# hoặc
yarn build

# Chạy production server
npm start
# hoặc
yarn start
```

### Chạy bằng Docker

#### Build và chạy với Docker Compose

1. Đảm bảo file `.env` đã được cấu hình đúng
2. Chạy lệnh:

```bash
docker-compose up -d
```

#### Build Docker image thủ công

```bash
# Build image
docker build \
  --build-arg SERVICE_PORT=5000 \
  --build-arg NEXT_PUBLIC_API_BASE_URL=http://your-api-url \
  --build-arg NEXT_PUBLIC_WEB_PATH=http://localhost:3001 \
  --build-arg NEXT_PUBLIC_POS_PATH=http://localhost:3002 \
  --build-arg NEXT_PUBLIC_TINYMCE_API_KEY=your_key \
  -t ocm-fe:latest .

# Chạy container
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  ocm-fe:latest
```

### Linting

```bash
npm run lint
# hoặc
yarn lint
```

## Cấu trúc API

Tất cả API endpoints được định nghĩa tập trung trong `constants/api.ts`. Các service functions trong thư mục `services/` sử dụng các endpoints này để giao tiếp với backend.

Ví dụ:

- Authentication: `/admin/auth/login`, `/admin/auth/register`
- Products: `/admin/products`, `/admin/products/{id}`
- Orders: `/admin/orders`, `/admin/orders/{id}`
- Customers: `/admin/customers`, `/admin/customers/{id}`

## Internationalization (i18n)

Hệ thống hỗ trợ đa ngôn ngữ với next-intl:

- Ngôn ngữ mặc định: Tiếng Việt (vi)
- Ngôn ngữ hỗ trợ: Tiếng Việt (vi), Tiếng Anh (en)
- Translation files: `messages/vi.json`, `messages/en.json`

## Tính năng nổi bật

- ✅ Server-Side Rendering (SSR) với Next.js
- ✅ Type-safe với TypeScript
- ✅ Responsive design với Ant Design và Tailwind CSS
- ✅ Đa ngôn ngữ (i18n)
- ✅ State management với Redux Toolkit
- ✅ Form validation với Formik + Yup
- ✅ Rich text editor với TinyMCE
- ✅ PDF export functionality
- ✅ Real-time notifications
- ✅ Protected routes và authentication
- ✅ Docker support

## Scripts có sẵn

- `npm run dev`: Chạy development server (port 3001)
- `npm run build`: Build ứng dụng cho production
- `npm start`: Chạy production server
- `npm run lint`: Chạy ESLint để kiểm tra code

## Lưu ý

- Đảm bảo backend API đang chạy và có thể truy cập được từ frontend
- Token authentication được lưu trong localStorage
- Cần cấu hình đúng `NEXT_PUBLIC_API_BASE_URL` để kết nối với backend
- TinyMCE API key cần được cấu hình để sử dụng rich text editor

## Troubleshooting

### Lỗi kết nối API

- Kiểm tra `NEXT_PUBLIC_API_BASE_URL` trong file `.env.local`
- Đảm bảo backend đang chạy và có thể truy cập được

### Lỗi build

- Xóa thư mục `.next` và `node_modules`, sau đó cài đặt lại dependencies
- Kiểm tra version Node.js (yêu cầu >= 20.16.0)

### Lỗi Docker

- Đảm bảo Docker network `backend` đã được tạo: `docker network create backend`
- Kiểm tra các biến môi trường trong file `.env`

## License

Private project - All rights reserved
