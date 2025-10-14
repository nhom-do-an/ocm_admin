import { Locale, locales } from '@/lib/i18n';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
    console.log('Locale::', locale);
    if (!locale || !locales.includes(locale as Locale)) {
        return {
            locale: 'vi' as Locale,
            messages: (await import(`../messages/vi.json`)).default
        };
    }



    return {
        locale: locale as Locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
