"use client";

import authService from "@/services/auth";
import channelService from "@/services/channel";
import storeService from "@/services/store";
import storage from "@/storages/storage";
import { STORAGE_KEYS } from "@/storages/storage-key";
import { TUserResponse } from "@/types/response/auth";
import { TPublicationResponse } from "@/types/response/channel";
import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";

type GlobalContextType = {
    user: TUserResponse | null;
    setUser: (user: TUserResponse | null) => void;
    openSidebar: boolean;
    setOpenSidebar: (open: boolean) => void;
    settingOpen: boolean;
    setSettingOpen: (open: boolean) => void;
    existingStore: boolean;
    loading: boolean;
    publications: TPublicationResponse[];
    setPublications: (publications: TPublicationResponse[]) => void;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<TUserResponse | null>(null);
    const [openSidebar, setOpenSidebar] = useState<boolean>(false);
    const [settingOpen, setSettingOpen] = useState(true);
    const [existingStore, setExistingStore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [publications, setPublications] = useState<TPublicationResponse[]>([]);
    const [collapsed, setCollapsed] = useState(false)


    const fetchUser = async () => {
        setLoading(true);
        try {
            const savedToken = storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

            if (savedToken) {
                const [currentUser, storeResult, channelResult] = await Promise.all([
                    authService.getProfile(),
                    storeService.checkStore(),
                    channelService.getPublications(),
                ]);

                setPublications(channelResult);
                setUser(currentUser);
                setExistingStore(true);
            } else {
                await storeService.checkStore();
                setExistingStore(true);
                setUser(null);
            }
        } catch (error) {
            console.error("Error fetching user/store:", error);
            setUser(null);
            setExistingStore(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <GlobalContext.Provider
            value={{
                user,
                setUser,
                openSidebar,
                setOpenSidebar,
                settingOpen,
                setSettingOpen,
                existingStore,
                loading,
                publications,
                collapsed,
                setCollapsed,
                setPublications,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("useGlobalContext must be used inside GlobalProvider");
    }
    return context;
};
