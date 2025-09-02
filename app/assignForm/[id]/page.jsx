import DivisionForm from '@/components/DivisionForm';
import ProtectedRoute from '@/components/ProtectedRoutes';
import React from 'react'

const getInternDataById = async (id) => {
    try {
        const res = await fetch(`http://localhost:3000/api/intern/${id}`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error("Failde to fecth information");
        }

        return res.json();
    } catch (error) {
        console.log(error);
    }
};

export default async function AssignForm({ params }) {
    const { id } = params;
    const { intern } = await getInternDataById(id);
    const { nama, divisi } = intern;

    return (
        <ProtectedRoute>
            <DivisionForm id={id} nama={nama} divisi={divisi} />
        </ProtectedRoute>
    )
}
