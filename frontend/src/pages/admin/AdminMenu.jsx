import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Statistic, List, Avatar } from 'antd'; // Button dihapus dari import jika tidak dipakai lagi
import { 
    InboxOutlined, 
    CheckCircleOutlined, 
    UserOutlined, 
    RightOutlined,
    HistoryOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout'; 

const { Title, Text } = Typography;

const AdminMenu = () => {
    const navigate = useNavigate();

    // --- 1. STATE UNTUK DATA REAL-TIME ---
    const [pendingCount, setPendingCount] = useState(0);
    const [finishedCount, setFinishedCount] = useState(0);
    const [studentCount, setStudentCount] = useState(0);

    const token = localStorage.getItem('token');

    // --- 2. AMBIL DATA DARI BACKEND ---
    useEffect(() => {
        getDashboardData();
    }, []);

    const getDashboardData = async () => {
        try {
            // Ambil Laporan
            const resReports = await axios.get(`/api/reports`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const reports = resReports.data;

            // Hitung Pending
            setPendingCount(reports.filter(r => r.status === 'pending').length);

            // Hitung Selesai (Accepted + Rejected)
            setFinishedCount(reports.filter(r => r.status === 'accepted' || r.status === 'rejected').length);

            // Ambil User
            const resUsers = await axios.get(`/api/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const users = resUsers.data;

            // Hitung Mahasiswa
            setStudentCount(users.filter(u => u.role === 'mahasiswa').length);

        } catch (error) {
            console.error("Gagal memuat data dashboard:", error);
        }
    };

    const guideData = [
        {
            title: 'Cek Laporan Masuk',
            description: 'Buka menu Laporan Masuk untuk memverifikasi laporan baru (Pending).',
            icon: <InboxOutlined />,
            color: '#faad14'
        },
        {
            title: 'Proses Laporan',
            description: 'Klik "Terima" untuk meneruskan ke teknisi, atau "Tolak" jika tidak valid.',
            icon: <CheckCircleOutlined />,
            color: '#52c41a'
        },
        {
            title: 'Arsip Laporan',
            description: 'Laporan yang sudah diproses akan otomatis masuk ke History Laporan.',
            icon: <HistoryOutlined />,
            color: '#1890ff'
        }
    ];

    return (
        <DashboardLayout role="admin">
            
            {/* --- HERO SECTION (TANPA TOMBOL PROFIL) --- */}
            <Card 
                style={{ 
                    marginBottom: 24, 
                    background: 'linear-gradient(to right, #001529, #003a8c)', 
                    borderRadius: 10,
                    border: 'none'
                }}
                bodyStyle={{ padding: '30px' }}
            >
                <Row align="middle">
                    <Col span={24}>
                        <Title level={3} style={{ color: 'white', margin: 0 }}>
                            Dashboard Administrator
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                            Pantau kinerja sistem dan kelola laporan fasilitas kampus dengan mudah.
                        </Text>
                    </Col>
                </Row>
            </Card>

            {/* --- STATISTIK CARDS (DATA REAL-TIME) --- */}
            <Row gutter={[16, 16]}>
                {/* Kartu 1: Laporan Masuk */}
                <Col xs={24} sm={8}>
                    <Card 
                        hoverable 
                        style={{ borderRadius: 10, borderTop: '4px solid #faad14', cursor: 'pointer' }}
                        onClick={() => navigate('/admin/incoming')}
                    >
                        <Statistic 
                            title="Laporan Menunggu (Pending)" 
                            value={pendingCount} 
                            valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
                            prefix={<InboxOutlined />}
                            suffix="Laporan"
                        />
                        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Perlu tindakan segera</Text>
                            <RightOutlined style={{ fontSize: 12, color: '#faad14' }} />
                        </div>
                    </Card>
                </Col>

                {/* Kartu 2: Laporan Selesai */}
                <Col xs={24} sm={8}>
                    <Card 
                        hoverable 
                        style={{ borderRadius: 10, borderTop: '4px solid #52c41a', cursor: 'pointer' }}
                        onClick={() => navigate('/admin/history')}
                    >
                        <Statistic 
                            title="Total Laporan Selesai" 
                            value={finishedCount} 
                            valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                            prefix={<CheckCircleOutlined />}
                        />
                        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Arsip bulan ini</Text>
                            <RightOutlined style={{ fontSize: 12, color: '#52c41a' }} />
                        </div>
                    </Card>
                </Col>

                {/* Kartu 3: User Aktif */}
                <Col xs={24} sm={8}>
                    <Card 
                        hoverable 
                        style={{ borderRadius: 10, borderTop: '4px solid #1890ff' }}
                    >
                        <Statistic 
                            title="Mahasiswa Terdaftar" 
                            value={studentCount} 
                            valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                            prefix={<UserOutlined />}
                        />
                        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Status Server: Online</Text>
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* --- PANDUAN ADMIN --- */}
            <Card title="Panduan Cepat Pengelolaan" bordered={false} style={{ marginTop: 24, borderRadius: 10 }}>
                <List
                    itemLayout="horizontal"
                    dataSource={guideData}
                    renderItem={item => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={
                                    <Avatar 
                                        icon={item.icon} 
                                        style={{ backgroundColor: item.color, verticalAlign: 'middle' }} 
                                    />
                                }
                                title={<a href="#">{item.title}</a>}
                                description={item.description}
                            />
                        </List.Item>
                    )}
                />
            </Card>

        </DashboardLayout>
    );
};

export default AdminMenu;