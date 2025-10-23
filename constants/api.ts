
export const API = {
    AUTH: {
        LOGIN: 'admin/auth/login',
        REGISTER: 'admin/auth/register',
        PROFILE: 'admin/auth/me',
    },
    STORE: {
        CHECK_STORE: '/admin/store/check',
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
    },
    LOCATION: {
        LIST: '/admin/locations',
    },
    ATTACHMENT: {
        UPLOAD: '/admin/file/upload',
    },

};