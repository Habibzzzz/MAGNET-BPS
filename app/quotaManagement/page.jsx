"use client";

import React, { useState, useEffect } from 'react';
import { Users, Calendar, TrendingUp, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import {
    PieChart, Pie, Cell,
    ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import NavbarGeneral from '@/components/NavbarGeneral';
import ProtectedRoute from '@/components/ProtectedRoutes';

export default function QuotaManagement() {
    const DAILY_QUOTA = 15;
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const MONTHLY_TARGET = DAILY_QUOTA * daysInMonth;


    const [isLoading, setIsLoading] = useState(true);
    const [interns, setInterns] = useState([]);

    useEffect(() => {
        async function fetchInterns() {
            try {
                const res = await fetch("/api/intern");
                const data = await res.json();

                // Debug: Log the response
                console.log("API Response:", data);

                if (data.interns && data.interns.length > 0) {
                    const internsWithDate = data.interns.map(intern => ({
                        ...intern,
                        tanggalMulai: new Date(intern.tanggalMulai),
                    }));
                    setInterns(internsWithDate);
                } else {
                    // Jika tidak ada data dari API, gunakan data sample untuk testing
                    console.log("No data from API, using sample data");
                    const sampleData = generateSampleData();
                    setInterns(sampleData);
                }
            } catch (error) {
                console.error("Failed to fetch interns:", error);
                // Gunakan sample data jika API gagal
                const sampleData = generateSampleData();
                setInterns(sampleData);
            } finally {
                setIsLoading(false);
            }
        }

        fetchInterns();
    }, []);

    // Function to generate sample data for testing
    function generateSampleData() {
        const statuses = ['aktif', 'selesai', 'pending', 'dikeluarkan'];
        const sampleInterns = [];

        for (let i = 0; i < 50; i++) {
            const randomDaysAgo = Math.floor(Math.random() * 30); // Random date within last 30 days
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - randomDaysAgo);

            sampleInterns.push({
                id: i + 1,
                nama: `Intern ${i + 1}`,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                tanggalMulai: startDate,
                universitas: `Universitas ${i + 1}`,
                divisi: `Divisi ${Math.floor(i / 10) + 1}`
            });
        }

        return sampleInterns;
    }

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayInterns = interns.filter(i =>
        new Date(i.tanggalMulai).toDateString() === today
    ).length;

    const weeklyInterns = interns.filter(i =>
        new Date(i.tanggalMulai) >= thisWeekStart &&
        new Date(i.tanggalMulai) <= now
    ).length;

    const monthlyTotal = interns.length;
    const statusCounts = {
        aktif: interns.filter(i => i.status === "aktif").length,
        selesai: interns.filter(i => i.status === "selesai").length,
        pending: interns.filter(i => i.status === "pending").length,
        dikeluarkan: interns.filter(i => i.status === "dikeluarkan").length,
    };

    const dailyRemaining = DAILY_QUOTA - todayInterns;

    const dailyProgress = (todayInterns / DAILY_QUOTA) * 100;

    const monthlyProgress = (monthlyTotal / MONTHLY_TARGET) * 100;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Data untuk Pie Chart (status)
    const pieData = [
        { name: 'Aktif', value: statusCounts.aktif, color: '#16a34a' },
        { name: 'Selesai', value: statusCounts.selesai, color: '#2563eb' },
        { name: 'Pending', value: statusCounts.pending, color: '#ca8a04' },
        { name: 'Dikeluarkan', value: statusCounts.dikeluarkan, color: '#dc2626' },
    ].filter(item => item.value > 0);

    // Data untuk Bar Chart (7 hari terakhir) - FIXED
    const barData = [...Array(7)].map((_, i) => {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - (6 - i));
        const targetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

        const count = interns.filter(intern => {
            const internDate = new Date(intern.tanggalMulai);
            const internDay = new Date(internDate.getFullYear(), internDate.getMonth(), internDate.getDate());
            return internDay.getTime() === targetDay.getTime();
        }).length;

        return {
            day: targetDate.toLocaleDateString('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            }),
            jumlah: count,
            fullDate: targetDate.toLocaleDateString('id-ID')
        };
    });

    // Alternative Bar Chart - Monthly breakdown if daily data is sparse
    const monthlyBarData = [...Array(6)].map((_, i) => {
        const targetMonth = new Date();
        targetMonth.setMonth(targetMonth.getMonth() - (5 - i));
        const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
        const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

        const count = interns.filter(intern => {
            const internDate = new Date(intern.tanggalMulai);
            return internDate >= monthStart && internDate <= monthEnd;
        }).length;

        return {
            month: targetMonth.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
            jumlah: count
        };
    });

    const hasRecentData = barData.some(item => item.jumlah > 0);
    const displayBarData = hasRecentData ? barData : monthlyBarData;
    const barChartTitle = hasRecentData ? "Pendaftar Magang 7 Hari Terakhir" : "Pendaftar Magang 6 Bulan Terakhir";

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <NavbarGeneral title="Dashboard Kuota Magang" subTitle="Pantau dan kelola kuota anak magang secara real-time" />

                    {/* Main Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
                        <StatCard
                            title="Kuota Harian"
                            icon={<Users />}
                            content={`${monthlyTotal}/${DAILY_QUOTA}`}
                            progress={monthlyProgress}
                            suffix={`${DAILY_QUOTA - monthlyTotal} slot tersisa`}
                        />
                        <StatCard
                            title="Kuota Bulan Ini"
                            icon={<Clock />}
                            content={`${monthlyTotal}/${MONTHLY_TARGET}`}
                            progress={monthlyProgress}
                            suffix={`${MONTHLY_TARGET - monthlyTotal} slot tersisa bulan ini`}
                        />
                    </div>

                    {/* Status Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Status Aktif"
                            icon={<CheckCircle className="text-green-600" />}
                            content={statusCounts.aktif}
                            suffix="Sedang magang"
                        />

                        <StatCard
                            title="Selesai"
                            icon={<Clock className="text-blue-600" />}
                            content={statusCounts.selesai}
                            suffix="Magang selesai"
                        />

                        <StatCard
                            title="Pending"
                            icon={<AlertCircle className="text-yellow-600" />}
                            content={statusCounts.pending}
                            suffix="Menunggu mulai"
                        />

                        <StatCard
                            title="Dikeluarkan"
                            icon={<XCircle className="text-red-600" />}
                            content={statusCounts.dikeluarkan}
                            suffix="Magang dibatalkan"
                        />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pie Chart Status */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Komposisi Status</h3>
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {pieData.map((entry, idx) => (
                                                <Cell key={`cell-${idx}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [value, 'Jumlah']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-64 text-gray-500">
                                    <p>Tidak ada data untuk ditampilkan</p>
                                </div>
                            )}
                        </div>

                        {/* Bar Chart */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">{barChartTitle}</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={displayBarData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey={hasRecentData ? "day" : "month"}
                                        fontSize={12}
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value) => [value, 'Jumlah Intern']}
                                        labelFormatter={(label) => `${hasRecentData ? 'Tanggal' : 'Bulan'}: ${label}`}
                                    />
                                    <Bar dataKey="jumlah" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

function StatCard({ title, icon, content, progress, suffix }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">{icon}</div>
                <div>
                    <p className="text-sm text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-800">{content}</p>
                </div>
            </div>
            {typeof progress === 'number' && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
            )}
            <p className="text-sm text-gray-600">{suffix}</p>
        </div>
    );
}