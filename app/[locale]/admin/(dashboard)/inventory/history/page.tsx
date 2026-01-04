import InventoryHistoryView from '@/containers/dashboard/inventory/inventory-history-view'

interface InventoryHistoryPageProps {
    searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const parseNumberParam = (value?: string | string[]) => {
    const raw = Array.isArray(value) ? value[0] : value
    if (!raw) return undefined
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : undefined
}

const InventoryHistoryPage = async ({ searchParams }: InventoryHistoryPageProps) => {
    const resolvedParams = await searchParams
    const variantId = parseNumberParam(resolvedParams?.variant_id)
    const locationId = parseNumberParam(resolvedParams?.location_id)

    return (
        <InventoryHistoryView
            initialVariantId={variantId}
            initialLocationId={locationId}
        />
    )
}

export default InventoryHistoryPage




