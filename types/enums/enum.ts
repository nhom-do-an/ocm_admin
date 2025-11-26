export enum EProductStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}

export enum EProductType {
    Normal = 'normal',
    Packsize = 'packsize',
    Combo = 'combo',
}

export enum ELocationStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}
export enum ECollectionType {
    MANUAL = 'manual',
    SMART = 'smart',
}

// Trạng thái khách hàng
export enum ECustomerStatus {
    ENABLED = 'enabled', // Đã kích hoạt
    DISABLED = 'disabled', // Chưa có tài khoản
}

// Trạng thái đơn hàng
export enum EOrderStatus {
    ORDERED = 'open', // Đặt hàng
    CONFIRMED = 'confirmed', // Đang giao dịch
    COMPLETED = 'completed', // Đã hoàn thành
    CANCELLED = 'cancelled', // Đã hủy
}

// Trạng thái xử lý
export enum EFulfillmentOrderStatus {
    PENDING = 'pending', // Chưa xử lý
    FULFILLED = 'fulfilled', // Đã xử lý
    PARTIALLY_FULFILLED = 'partial_fulfilled', // Xử lý 1 phần
}

// Trạng thái giao hàng
export enum EFulfillmentShipmentStatus {
    PENDING = 'pending', // Chưa giao hàng
    PICKED_UP = 'picked_up', // Đã lấy hàng
    DELIVERING = 'delivering', // Đang vận chuyển
    RETRY_DELIVERY = 'retry_delivery', // Chờ giao lại
    RETURNING = 'returning', // Đang trả hàng
    WAIT_TO_CONFIRM = 'wait_to_confirm', // Chờ xác nhận hoàn hàng
    DELIVERED = 'delivered', // Đã giao hàng
    RETURNED = 'returned', // Đã trả hàng
    CANCELLED = 'cancelled', // Đã hủy
}

// Trạng thái thanh toán
export enum EFinancialStatus {
    UNPAID = 'unpaid', // Chưa thanh toán
    PARTIALLY_PAID = 'partial_paid', // Thanh toán 1 phần
    PAID = 'paid', // Đã thanh toán
    PARTIALLY_REFUNDED = 'partially_refunded', // Hoàn tiền 1 phần
    REFUNDED = 'refunded', // Đã hoàn tiền
}

// Trạng thái đóng gói
export enum EFulfillmentStatus {
    SUCCESS = 'success', // Đã đóng gói
}

// Hình thức vận chuyển
export enum EDeliveryMethod {
    NONE = 'none',  // Không yêu cầu vận chuyển 
    PICKUP = 'pickup',  // Lấy hàng tại cửa hàng
    EXTERNAL_SHIPPER = 'external_shipper',  // Vận chuyển bởi đối tác vận chuyển tự liên hệ
}

// Trạng thái vận chuyển
export enum EDeliveryStatus {
    PENDING = 'pending',  // Chờ lấy hàng
    PICKED_UP = 'picked_up',  // Đã lấy hàng
    DELIVERING = 'delivering',  // Đang vận chuyển
    RETRY_DELIVERY = 'retry_delivery',  // Chờ giao lại
    RETURNING = 'returning',  // Đang trả hàng
    WAIT_TO_CONFIRM = 'wait_to_confirm',  // Chờ xác nhận hoàn hàng
    DELIVERED = 'delivered',  // Đã giao hàng
    RETURNED = 'returned',  // Đã trả hàng
    CANCELLED = 'cancelled',  // Đã hủy
}

export enum EOrderReturnStatus {
    NoReturn = 'no_return',
    Returned = 'returned',
    PartiallyReturned = 'partially_returned',
}

export enum ETransactionStatus {
    Pending = 1,
    Success = 2,
}

export enum DeliveryProviderType {
    ExternalShipper = 'external_shipper',
    InternalShipper = 'internal_shipper',
}

export enum DeliveryProviderStatus {
    Active = 'active',
    Inactive = 'inactive',
}

export enum ShippingLineType {
    Custom = 'custom',
    Standard = 'standard',
}

export enum EShippingRequirement {
    ViewAndTry = 1, // cho xem hàng, cho thử
    ViewOnly = 2, // cho xem hàng, không cho thử
    NoViewNoTry = 3, // không cho xem hàng

}

export enum EFreightPayerType {
    Buyer = 'buyer',
    Seller = 'seller',
}

export enum EAuthorType {
    User = 'user',
    System = 'system',
}

export enum ESubjectType {
    Order = 'order',
    Product = 'product',
    Variant = 'variant',
    Category = 'category',
    Brand = 'brand',
    Customer = 'customer',
    Shipment = 'shipment',
    User = 'user',
    Collection = 'collection',
}

export enum EEventVerb {
    CreatedOrder = 'created_order',
    UpdatedOrder = 'updated_order',
    DeletedOrder = 'deleted_order',
    CreatedProduct = 'created_product',
    UpdatedProduct = 'updated_product',
    DeletedProduct = 'deleted_product',
}

export enum ETransactionCauseType {
    Customer = 'customer',
    Admin = 'admin',
}

export enum ETransactionKind {
    Deposit = 'deposit',
    Sale = 'sale',
}

export enum EReferenceType {
    Order = 'order',
    Product = 'product',
    Variant = 'variant',
    Category = 'category',
    Brand = 'brand',
    Customer = 'customer',
}