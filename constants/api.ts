
export const API = {
    AUTH: {
        LOGIN: 'admin/auth/login',
        REGISTER: 'admin/auth/register',
        PROFILE: 'admin/auth/me',
    },
    STORE: {
        CHECK_STORE: '/admin/store/check',
        GET_DETAIL: (storeId: number) => `/admin/store/${storeId}`,
        UPDATE: '/admin/store',
        UPLOAD_LOGO: (storeId: number) => `/admin/store/${storeId}/logo`,
    },
    REGION: {
        GET_REGIONS: '/region/list',
    },
    CHANNEL: {
        GET_PUBLICATIONS: "/admin/publications",
        GET_LIST_CHANNEL: "/admin/channels",
        INSTALL_CHANNEL: "/admin/channels",
        REMOVE_CHANNEL: "/admin/channels/{channel_id}/disconnect",
    },
    PRODUCT: {
        GET_PRODUCTS: '/admin/products',
        CREATE_PRODUCT: '/admin/products',
        GET_PRODUCT_TYPE_LIST: '/admin/products/product-types/list',
        GET_VENDOR_LIST: '/admin/products/vendors/list',
        GET_TAGS_LIST: '/admin/products/tags/list',
        GET_PRODUCT_DETAIL: (id: number) => `/admin/products/detail/${id}`,
        UPDATE_PRODUCT: (id: number) => `/admin/products/${id}`,
    },
    COLLECTION: {
        GET_COLLECTIONS: '/admin/collections',
        GET_COLLECTION_DETAIL: (id: number) => `/admin/collections/detail/${id}`,
        UPDATE_COLLECTION: '/admin/collections',
        DELETE_COLLECTION: (id: number) => `/admin/collections/${id}`,
    },
    LOCATION: {
        LIST: '/admin/locations',
        GET_DETAIL: (id: number) => `/admin/locations/${id}`,
        CREATE: '/admin/locations',
        UPDATE: (id: number) => `/admin/locations/${id}`,
    },
    ATTACHMENT: {
        UPLOAD: '/admin/file/upload',
    },
    CUSTOMER: {
        GET_CUSTOMERS: '/admin/customers',
        CREATE_CUSTOMER: '/admin/customers',
        GET_CUSTOMER_DETAIL: (id: number) => `/admin/customers/${id}`,
        GET_CUSTOMER_ADDRESS_LIST: (id: number) => `/admin/customers/${id}/addresses`,
    },
    OLD_REGION: {
        GET_LIST: '/old-region/list',
    },
    ORDER: {
        GET_ORDERS: '/admin/orders',
        CREATE_ORDER: '/admin/orders',
        GET_ORDER_DETAIL: (id: number) => `/admin/orders/${id}`,
        GET_EVENTS: (id: number) => `/admin/orders/${id}/events`,
        GET_TRANSACTIONS: (id: number) => `/admin/orders/${id}/transactions`,
        UPDATE_ORDER: (id: number) => `/admin/orders/${id}`,
        UPDATE_ORDER_ITEMS: (id: number) => `/admin/orders/${id}/items`,
        CREATE_ORDER_PAYMENTS: (id: number) => `/admin/orders/${id}/payments`,
        GET_ORDER_PRINT: (id: number) => `/admin/orders/${id}/print`,
        CANCEL_ORDER: (id: number) => `/admin/orders/${id}/cancel`,
        GET_ORDER_QR_PAYMENT: (orderId: number) => `/admin/orders/${orderId}/qr-payment`,
    },
    VARIANT: {
        GET_VARIANTS: '/admin/variants',
        GET_VARIANT_DETAIL: (variantId: number) => `/admin/variants/detail/${variantId}`,
        UPDATE_VARIANT: (variantId: number) => `/admin/variants/${variantId}`,
        DELETE_VARIANT: (variantId: number) => `/admin/variants/${variantId}`,
    },
    PAYMENT_METHOD: {
        GET_PAYMENT_METHODS: '/admin/payment-methods',
        GET_DETAIL: (id: number) => `/admin/payment-methods/${id}`,
        CREATE: '/admin/payment-methods',
        UPDATE: '/admin/payment-methods',
        GET_PROVIDERS: '/admin/payment-methods/providers/list',
    },
    BENEFICIARY_ACCOUNT: {
        GET_LIST: '/admin/beneficiary-accounts',
        GET_DETAIL: (id: number) => `/admin/beneficiary-accounts/${id}`,
        CREATE: '/admin/beneficiary-accounts',
        UPDATE: '/admin/beneficiary-accounts',
        GET_BANKS: '/admin/beneficiary-accounts/banks',
    },
    CUSTOMER_ORDER: {
        GET_CUSTOMER_ORDERS: '/orders',
    },
    SOURCE: {
        GET_SOURCES: '/admin/sources',
    },
    USER: {
        GET_LIST_USERS: '/admin/users',
        GET_OWNER: '/admin/users/owner',
        GET_STAFFS: '/admin/users/staffs',
        CREATE_STAFF: '/admin/users/staffs',
        UPDATE_STAFF: (id: number) => `/admin/users/staffs/${id}`,
        GET_USER_SUMMARY: '/admin/users/summary',
    },
    NOTIFICATION_USER: {
        GET_LIST: '/admin/notifications/list',
        READ: (id: number) => `/admin/notifications/read/${id}`,
        GET_UNREAD_COUNT: '/admin/notifications/unread/count',
        MARK_AS_READ_ALL: '/admin/notifications/mark-as-read-all',
    },
    SHIPPING_RATE: {
        GET_LIST: '/admin/shipping/rates',
    },
    DELIVERY_PROVIDER: {
        GET_LIST: '/admin/delivery-providers',
        CREATE: '/admin/delivery-providers',
        UPDATE: (id: number) => `/admin/delivery-providers/${id}`,
    },
    EVENT: {
        GET_EVENTS: '/admin/events',
    },
    INVENTORY_LEVEL: {
        GET_LIST: '/admin/inventory-levels',
        UPDATE: '/admin/inventory-levels',
    },
    INVENTORY_ADJUSTMENT: {
        GET_LIST: '/admin/inventory-adjustments',
    },
    FULFILLMENT: {
        CREATE: '/admin/fulfillments',
        GET_LINE_ITEMS: (id: number) => `/admin/fulfillments/${id}/line-items`,
    },
    SHIPMENT: {
        GET_LIST: '/admin/shipments',
        GET_DETAIL: (id: number) => `/admin/shipments/${id}`,
        UPDATE_STATUS: (id: number) => `/admin/shipments/${id}/status`,
        MARK_AS_DELIVERED: (id: number) => `/admin/shipments/${id}/mark-as-delivered`,
        PRINT: (id: number) => `/admin/shipments/${id}/print`,
    },
    NOTIFICATION: {
        GET_TEMPLATES: '/admin/notifications/templates',
        GET_TEMPLATE_BY_ID: (id: number) => `/admin/notifications/templates/${id}`,
        UPDATE_TEMPLATE: '/admin/notifications/templates',
        AI: {
            GET_TRENDING: '/ai/trending',
            GET_TRENDING_PREDICTIONS: '/admin/ai/trending/predictions',
        },
    },

    AI: {
        GET_TRENDING: '/ai/trending',
        GET_TRENDING_PREDICTIONS: '/admin/ai/trending/predictions',
    },
    REPORT: {
        GET_REVENUE_BY_DATE: '/admin/revenue/by-date',
        GET_REVENUE_BY_LOCATION: '/admin/revenue/by-location',
        GET_REVENUE_BY_SOURCE: '/admin/revenue/by-source',
        GET_REVENUE_BY_CUSTOMER: '/admin/revenue/by-customer',
        GET_TOP_SELLING_PRODUCTS: '/admin/revenue/top-selling-products',
    },
};
