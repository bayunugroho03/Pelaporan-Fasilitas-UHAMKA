import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Image, message } from 'antd';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout'; // 1. IMPORT LAYOUT

const HistoryReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);

    const axiosJWT = axios.create();
    axiosJWT.interceptors.request.use((config) => {
        config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
        return config;
    });

    useEffect(() => {
        getReports();
    }, []);

    const getReports = async () => {
        setLoading(true);
        try {
            const res = await axiosJWT.get(`${import.meta.env.VITE_API_URL}/api/reports`);
            
            // Filter: Hanya tampilkan laporan yang sudah SELESAI (accepted / rejected)
            const finishedReports = res.data.filter(r => r.status === 'accepted' || r.status === 'rejected');
            
            setReports(finishedReports);
        } catch (error) {
            console.error(error);
            message.error("Gagal mengambil data history.");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { 
            title: 'Pelapor', 
            dataIndex: ['user', 'name'], 
            key: 'user',
            render: (text) => <b>{text}</b>
        },
        { 
            title: 'Tanggal', 
            dataIndex: 'report_date', 
            key: 'date',
            width: 120
        },
        {
            title: 'Bukti',
            dataIndex: 'image',
            key: 'image',
            render: (url) => (
                <Image 
                    width={80} 
                    src={url} 
                    alt="Bukti"
                    placeholder={true}
                    style={{ borderRadius: 4, objectFit: 'cover' }}
                />
            )
        },
        { 
            title: 'Kerusakan', 
            dataIndex: 'description', 
            key: 'desc',
            width: 250
        },
        { 
            title: 'Status', 
            dataIndex: 'status', 
            key: 'status',
            render: (status) => {
                let color = status === 'accepted' ? 'green' : 'red';
                let text = status === 'accepted' ? 'DITERIMA' : 'DITOLAK';
                return <Tag color={color}>{text}</Tag>;
            }
        },
        { 
            title: 'Feedback Admin', 
            dataIndex: 'feedback', 
            key: 'feedback',
            render: (text) => <span style={{ fontStyle: 'italic', color: '#555' }}>"{text}"</span>
        },
    ];

    return (
        // 2. BUNGKUS DENGAN DASHBOARD LAYOUT (Role: Admin)
        <DashboardLayout role="admin">
            <Card title="Arsip Laporan Selesai" bordered={false}>
                <Table 
                    dataSource={reports} 
                    columns={columns} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                    locale={{ emptyText: 'Belum ada riwayat laporan selesai' }}
                />
            </Card>
        </DashboardLayout>
    );
};

export default HistoryReports;