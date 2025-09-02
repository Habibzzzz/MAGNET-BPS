import MentorTable from './../../components/MentorTable'
import React from 'react'
import ProtectedRoute from '@/components/ProtectedRoutes'
import NavbarGeneral from '@/components/NavbarGeneral'

export default function page() {
    return (
        <ProtectedRoute>
            <div>
                <div className='p-6 max-w-full md:max-w-8xl mx-auto'>
                    <NavbarGeneral title="Data Pembimbing Magang" subTitle="Monitoring dan kelola data pembimbing" />
                    <MentorTable />
                </div>
            </div>
        </ProtectedRoute>
    )
}
