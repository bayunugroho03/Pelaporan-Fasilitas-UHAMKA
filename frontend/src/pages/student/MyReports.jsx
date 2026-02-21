import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Image, message } from 'antd'; // Pastikan import Image ada
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout'; // 1. IMPORT LAYOUT

const MyReports = () => {
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
            const res = await axiosJWT.get('http://localhost:5000/reports');
            setReports(res.data); 
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { 
            title: 'Tanggal', 
            dataIndex: 'report_date', 
            key: 'report_date',
            width: 120,
            render: (text) => text || "-"
        },
        { 
            title: 'Kerusakan', 
            dataIndex: 'description', 
            key: 'description' 
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
            title: 'Status', 
            dataIndex: 'status', 
            key: 'status',
            render: (status) => {
                let color = status === 'pending' ? 'gold' : status === 'accepted' ? 'green' : 'red';
                return <Tag color={color}>{status ? status.toUpperCase() : 'UNKNOWN'}</Tag>;
            }
        },
        { 
            title: 'Feedback Admin', 
            dataIndex: 'feedback', 
            key: 'feedback',
            render: (text) => text || <span style={{color: '#ccc'}}>(Belum ada tanggapan)</span>
        },
    ];

    return (
        // 2. BUNGKUS DENGAN DASHBOARD LAYOUT (Role: Student)
        <DashboardLayout role="student">
             <Card title="Riwayat Laporan Saya" bordered={false}>
                 <Table 
                    dataSource={reports} 
                    columns={columns} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                 />
             </Card>
        </DashboardLayout>
    );
};
export default MyReports;