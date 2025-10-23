'use client';

import { useGlobalContext } from '@/hooks/useGlobalContext';
import channelService from '@/services/channel';
import { TChannelResponse } from '@/types/response/channel';
import { useEffect, useState } from 'react';


const useChannel = () => {
    const { setPublications } = useGlobalContext();
    const [loading, setLoading] = useState(false);
    const [channels, setChannels] = useState<TChannelResponse[]>([]);
    const [installLoading, setInstallLoading] = useState(false);

    const getChannels = async () => {
        setLoading(true);
        try {
            const data = await channelService.getListChannel();
            setChannels(data);
        } catch (error) {
            console.error('Failed to fetch channels:', error);
        } finally {
            setLoading(false);
        }
    }

    const installChannel = async (channelId: number) => {
        setInstallLoading(true);
        try {
            const response = await Promise.all([channelService.installChannel(channelId), channelService.getPublications(), getChannels()]);
            setPublications(response[1]);
        } catch (error) {
            console.error('Failed to connect channel:', error);
        } finally {
            setInstallLoading(false);
        }
    }

    const removePublication = async (channelId: number) => {
        setInstallLoading(true);
        try {
            const response = await Promise.all([channelService.removePublication(channelId), channelService.getPublications(), getChannels()]);
            setPublications(response[1]);
        } catch (error) {
            console.error('Failed to remove channel:', error);
        } finally {
            setInstallLoading(false);
        }
    }

    useEffect(() => {
        getChannels();
    }, []);
    return {
        channels,
        loading,
        installChannel,
        installLoading,
        getChannels,
        removePublication
    };
};

export default useChannel;