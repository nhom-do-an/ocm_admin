'use client'
import { useGlobalContext } from '@/hooks/useGlobalContext';
import React from 'react'
import TrendingSection from '@/components/TrendingSection'

const Home = () => {
    const { user } = useGlobalContext();
    return (
        <div className='space-y-6'>
            <div className='text-[18px] mb-6'>
                <span className='text-gray-600'>Xin chào - </span>
                <span className='text-blue-600'>{user ? `${user.name}` : 'Xin chào khách'}</span>
            </div>
            <TrendingSection limit={10} />
        </div>
    )
}

export default Home