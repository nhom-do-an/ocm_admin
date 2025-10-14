import { LocalePrefix, Pathnames } from "next-intl/routing"

export const locales = ['vi', 'en'] as const
export type Locale = typeof locales[number]
export type Locales = typeof locales
export const defaultLocale: Locale = 'vi'

export const pathnames: Pathnames<Locales> = {
    "/": "/", '/pathnames': '/pathnames'
}

export const localePrefix: LocalePrefix<Locales> = "always"