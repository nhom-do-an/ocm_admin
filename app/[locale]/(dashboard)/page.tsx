'use client'
import { useGlobalContext } from '@/hooks/useGlobalContext';
import React from 'react'

const Home = () => {
    const { user } = useGlobalContext();
    return (
        <div className='text-[18px]'>
            <span className='text-gray-600'>Xin chào - </span>
            <span className='text-blue-600'>{user ? `${user.name}` : 'Xin chào khách'}</span>
        </div>
    )
}

export default Home