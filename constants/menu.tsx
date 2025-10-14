import { ReactNode } from 'react'
import { Home, BadgePercent, ClipboardList, Package, Truck, User, Warehouse } from 'lucide-react'
import { SCREEN } from './constant'

export interface AppMenuItem {
    key: string
    label: string
    icon?: ReactNode
    badgeKey?: string
    children?: AppMenuItem[]
}

export const menuItems: AppMenuItem[] = [
    {
        key: SCREEN.HOME.PATH,
        label: SCREEN.HOME.LABEL,
        icon: <Home size={20} />,
    },
    {
        key: "/order",
        label: 'order.label',
        icon: <ClipboardList size={20} />,
        children: [
            {
                key: SCREEN.ORDER_LIST.PATH,
                label: SCREEN.ORDER_LIST.LABEL,
            },
            {
                key: SCREEN.RETURN_ORDER_LIST.PATH,
                label: SCREEN.RETURN_ORDER_LIST.LABEL,
            },
        ],
    },
    {
        key: "/shipment",
        label: 'shipment.label',
        icon: <Truck size={20} />,
        children: [
            {
                key: SCREEN.SHIPMENT_LIST.PATH,
                label: SCREEN.SHIPMENT_LIST.LABEL,
            },
        ],
    },
    {
        key: "/product",
        label: 'product.label',
        icon: <Package size={20} />,
        children: [
            {
                key: SCREEN.PRODUCT_LIST.PATH,
                label: SCREEN.PRODUCT_LIST.LABEL,
            },

            {
                key: SCREEN.COLLECTION_LIST.PATH,
                label: SCREEN.COLLECTION_LIST.LABEL,
            },
            {
                key: SCREEN.CATALOG_LIST.PATH,
                label: SCREEN.CATALOG_LIST.LABEL,
            },
        ],
    },
    {
        key: "inventory",
        label: 'inventory.label',
        icon: <Warehouse size={20} />,
        children: [
            {
                key: SCREEN.INVENTORY_MANAGEMENT.PATH,
                label: SCREEN.INVENTORY_MANAGEMENT.LABEL,
            },

            {
                key: SCREEN.SUPPLIER_LIST.PATH,
                label: SCREEN.SUPPLIER_LIST.LABEL,
            },
        ],
    },
    {
        key: "/customer",
        label: 'customer.label',
        icon: <User size={20} />,
        children: [
            {
                key: SCREEN.CUSTOMER_LIST.PATH,
                label: SCREEN.CUSTOMER_LIST.LABEL,
            },

            {
                key: SCREEN.CUSTOMER_GROUP_LIST.PATH,
                label: SCREEN.CUSTOMER_GROUP_LIST.LABEL,
            }
        ],
    },
    {
        key: SCREEN.DISCOUNT_LIST.PATH,
        label: SCREEN.DISCOUNT_LIST.LABEL,
        icon: <BadgePercent size={20} />,
    },
]
