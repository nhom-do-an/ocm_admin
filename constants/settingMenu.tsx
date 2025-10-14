
import { Bell, CreditCard, History, IdCard, MapPinned, ShoppingBag, SquarePercent, Store, Truck, TruckElectric, TvMinimalPlay } from 'lucide-react'
import { SCREEN } from './constant'
import { AppMenuItem } from './menu'


export const settingMenuItems: AppMenuItem[] = [
    {
        key: SCREEN.GENERAL_SETTING.PATH,
        label: SCREEN.GENERAL_SETTING.LABEL,
        icon: <Store size={20} />,
    },
    {
        key: SCREEN.LOCATION_MANAGEMENT.PATH,
        label: SCREEN.LOCATION_MANAGEMENT.LABEL,
        icon: <MapPinned size={20} />
    },
    {
        key: SCREEN.PAYMENT_METHOD_MANAGEMENT.PATH,
        label: SCREEN.PAYMENT_METHOD_MANAGEMENT.LABEL,
        icon: <CreditCard size={20} />
    },
    {
        key: SCREEN.CHECKOUT_MANAGEMENT.PATH,
        label: SCREEN.CHECKOUT_MANAGEMENT.LABEL,
        icon: <ShoppingBag size={20} />
    },
    {
        key: SCREEN.TAX_MANAGEMENT.PATH,
        label: SCREEN.TAX_MANAGEMENT.LABEL,
        icon: <SquarePercent size={20} />,
    },
    {
        key: SCREEN.SHIPPING_PARTNER.PATH,
        label: SCREEN.SHIPPING_PARTNER.LABEL,
        icon: <Truck size={20} />,
    },
    {
        key: SCREEN.SHIPPING_MANAGEMENT.PATH,
        label: SCREEN.SHIPPING_MANAGEMENT.LABEL,
        icon: <TruckElectric size={20} />,

    },
    {
        key: SCREEN.EMPLOYEE_MANAGEMENT.PATH,
        label: SCREEN.EMPLOYEE_MANAGEMENT.LABEL,
        icon: <IdCard size={20} />,
    },
    {
        key: SCREEN.CHANNEL_MANAGEMENT.PATH,
        label: SCREEN.CHANNEL_MANAGEMENT.LABEL,
        icon: <TvMinimalPlay size={20} />,
    },
    {
        key: SCREEN.NOTIFICATION_MANAGEMENT.PATH,
        label: SCREEN.NOTIFICATION_MANAGEMENT.LABEL,
        icon: <Bell size={20} />,
    },
    {
        key: SCREEN.EVENT_MANAGEMENT.PATH,
        label: SCREEN.EVENT_MANAGEMENT.LABEL,
        icon: <History size={20} />,
    },
]
