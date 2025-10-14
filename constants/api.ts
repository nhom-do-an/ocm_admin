
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
    }
};