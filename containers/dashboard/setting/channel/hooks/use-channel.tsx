'use client';

import channelService from '@/services/channel';
import { TChannelResponse } from '@/types/response/channel';
import { useEffect, useState } from 'react';


const useChannel = () => {
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
            await channelService.installChannel(channelId);
            await getChannels();
        } catch (error) {
            console.error('Failed to connect channel:', error);
        } finally {
            setInstallLoading(false);
        }
    }

    const removePublication = async (channelId: number) => {
        setInstallLoading(true);
        try {
            await channelService.removePublication(channelId);
            await getChannels();
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