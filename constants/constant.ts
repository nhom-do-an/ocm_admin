import { EProductStatus, EProductType } from "@/types/enums/enum"

export const SCREEN = {
    LOGIN: {
        NAME: "login.name",
        PATH: "/admin/login",
        LABEL: "login.label"
    },
    REGISTER: {
        NAME: "register.name",
        PATH: "/admin/register",
        LABEL: "register.label"
    },

    CUSTOMER_LIST: {
        NAME: "customer.list.name",
        PATH: "/admin/customer/list",
        LABEL: "customer.list.label"
    },
    CUSTOMER_GROUP_LIST: {
        NAME: "customer_group.list.name",
        PATH: "/admin/customer-group/list",
        LABEL: "customer_group.list.label"
    },
    ORDER_LIST: {
        NAME: "order.list.name",
        PATH: "/admin/order/list",
        LABEL: "order.list.label"
    },
    RETURN_ORDER_LIST: {
        NAME: "return_order.list.name",
        PATH: "/admin/return-order/list",
        LABEL: "return_order.list.label"
    },
    SHIPMENT_LIST: {
        NAME: "shipment.list.name",
        PATH: "/admin/shipment/list",
        LABEL: "shipment.list.label"
    },
    PRODUCT_LIST: {
        NAME: "product.list.name",
        PATH: "/admin/product/list",
        LABEL: "product.list.label"
    },
    COLLECTION_LIST: {
        NAME: "collection.list.name",
        PATH: "/admin/collection/list",
        LABEL: "collection.list.label"
    },
    CATALOG_LIST: {
        NAME: "catalog.list.name",
        PATH: "/admin/catalog/list",
        LABEL: "catalog.list.label"
    },
    DISCOUNT_LIST: {
        NAME: "discount.list.name",
        PATH: "/admin/discount/list",
        LABEL: "discount.list.label"
    },
    INVENTORY_MANAGEMENT: {
        NAME: "inventory.list.name",
        PATH: "/admin/inventory/list",
        LABEL: "inventory.list.label"
    },
    SUPPLIER_LIST: {
        NAME: "supplier.list.name",
        PATH: "/admin/supplier/list",
        LABEL: "supplier.list.label"
    },
    HOME: {
        NAME: "home.name",
        PATH: "/admin",
        LABEL: "home.label"
    },
    GENERAL_SETTING: {
        NAME: "general_setting.name",
        PATH: "/admin/settings",
        LABEL: "general_setting.label"
    },
    LOCATION_MANAGEMENT: {
        NAME: "location_management.name",
        PATH: "/admin/settings/location",
        LABEL: "location_management.label"
    },
    PAYMENT_METHOD_MANAGEMENT: {
        NAME: "payment_method_management.name",
        PATH: "/admin/settings/payment-method",
        LABEL: "payment_method_management.label"
    },
    CHECKOUT_MANAGEMENT: {
        NAME: "checkout_management.name",
        PATH: "/admin/settings/checkout",
        LABEL: "checkout_management.label"
    },
    TAX_MANAGEMENT: {
        NAME: "tax_management.name",
        PATH: "/admin/settings/tax",
        LABEL: "tax_management.label"
    },
    SHIPPING_PARTNER: {
        NAME: "shipping_partner.name",
        PATH: "/admin/settings/shipping-partner",
        LABEL: "shipping_partner.label"
    },
    SHIPPING_MANAGEMENT: {
        NAME: "shipping_management.name",
        PATH: "/admin/settings/shipping",
        LABEL: "shipping_management.label"
    },
    EMPLOYEE_MANAGEMENT: {
        NAME: "employee_management.name",
        PATH: "/admin/settings/employee",
        LABEL: "employee_management.label"
    },
    CHANNEL_MANAGEMENT: {
        NAME: "channel_management.name",
        PATH: "/admin/settings/channel",
        LABEL: "channel_management.label"
    },
    NOTIFICATION_MANAGEMENT: {
        NAME: "notification_management.name",
        PATH: "/admin/settings/notification",
        LABEL: "notification_management.label"
    },
    EVENT_MANAGEMENT: {
        NAME: "event_management.name",
        PATH: "/admin/settings/event",
        LABEL: "event_management.label"
    }
}

export const PTypeOptions = [
    { label: 'Sản phẩm thường', value: EProductType.Normal },
    { label: 'Sản phẩm combo', value: EProductType.Combo },
    { label: 'Sản phẩm có đơn vị quy đổi', value: EProductType.Packsize },
]

export const PStatusOptions = [
    { label: 'Đang bán', value: EProductStatus.ACTIVE },
    { label: 'Ngừng hoạt động', value: EProductStatus.INACTIVE },
]