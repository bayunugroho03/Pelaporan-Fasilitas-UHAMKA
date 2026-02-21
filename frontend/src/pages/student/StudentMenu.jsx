import React from 'react';
import { Card, Typography, Row, Col, Button, Timeline, Divider } from 'antd';
import { 
    CameraOutlined, 
    UserOutlined, 
    SolutionOutlined, 
    ToolOutlined, 
    CheckOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import mahasiswaImg from '../../assets/mahasiswa.png';

const { Title, Paragraph, Text } = Typography;

const DashboardStudent = () => {
    const navigate = useNavigate();

    return (
        <DashboardLayout role="student">
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                
                {/* --- HERO SECTION: SELAMAT DATANG --- */}
                <Card 
                    style={{ 
                        marginBottom: 24, 
                        background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)', 
                        borderRadius: 12,
                        border: 'none',
                        color: 'white'
                    }}
                    bodyStyle={{ padding: '40px 30px' }}
                >
                    <Row align="middle" gutter={[24, 24]}>
                        <Col xs={24} md={16}>
                            <Title level={2} style={{ color: 'white', marginBottom: 8 }}>
                                Selamat Datang di Lapor UHAMKA!
                            </Title>
                            <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
                                Platform digital untuk mewujudkan fasilitas kampus yang lebih baik, nyaman, dan terawat.
                            </Paragraph>
                            <Button 
                                type="default" 
                                size="large" 
                                icon={<CameraOutlined />} 
                                onClick={() => navigate('/student/create')}
                                style={{ color: '#0050b3', fontWeight: 'bold', border: 'none' }}
                            >
                                Mulai Lapor Kerusakan
                            </Button>
                        </Col>
                        <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                            <img 
                                src={mahasiswaImg} 
                                alt="Ilustrasi Mahasiswa" 
                                style={{ width: '80%', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)' }}
                            />
                        </Col>
                    </Row>
                </Card>

                {/* --- CONTENT SECTION: PENJELASAN & ALUR --- */}
                <Row gutter={[24, 24]}>
                    {/* KIRI: Penjelasan Aplikasi */}
                    <Col xs={24} lg={14}>
                        <Card title="Tentang Aplikasi" bordered={false} style={{ height: '100%', borderRadius: 12 }}>
                            <Paragraph style={{ fontSize: 15, textAlign: 'justify', lineHeight: '1.8' }}>
                                <Text strong>Lapor UHAMKA</Text> adalah aplikasi resmi yang dirancang untuk memudahkan civitas akademika, 
                                khususnya mahasiswa, dalam melaporkan kondisi sarana dan prasarana di lingkungan Universitas 
                                Muhammadiyah Prof. DR. HAMKA.
                            </Paragraph>
                            <Paragraph style={{ fontSize: 15, textAlign: 'justify', lineHeight: '1.8' }}>
                                Laporan Anda sangat berharga bagi kami. Dengan melaporkan kerusakan fasilitas seperti AC mati, 
                                kursi rusak, atau proyektor bermasalah, Anda turut berkontribusi dalam menciptakan suasana 
                                belajar yang kondusif dan nyaman. Laporan Anda akan langsung diteruskan ke tim teknisi 
                                untuk segera ditindaklanjuti.
                            </Paragraph>
                            <Divider />
                            <Text type="secondary">
                                "Kebersihan dan kenyamanan kampus adalah tanggung jawab kita bersama."
                            </Text>
                        </Card>
                    </Col>

                    {/* KANAN: Cara Kerja (Timeline Alur Pelaporan) */}
                    <Col xs={24} lg={10}>
                        <Card title="Alur Pelaporan" bordered={false} style={{ height: '100%', borderRadius: 12 }}>
                            <Timeline>
                                <Timeline.Item dot={<UserOutlined style={{ fontSize: '20px', color: '#1890ff' }} />} color="blue">
                                    <Text strong>Mahasiswa Melapor</Text>
                                    <Paragraph style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>
                                        Anda mengisi form dan mengirim laporan kerusakan fasilitas melalui aplikasi.
                                    </Paragraph>
                                </Timeline.Item>
                                <Timeline.Item dot={<SolutionOutlined style={{ fontSize: '20px', color: '#faad14' }} />} color="gold">
                                    <Text strong>Admin Verifikasi</Text>
                                    <Paragraph style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>
                                        Admin menerima, memverifikasi kelengkapan, dan memvalidasi laporan Anda.
                                    </Paragraph>
                                </Timeline.Item>
                                <Timeline.Item dot={<ToolOutlined style={{ fontSize: '20px', color: '#faad14' }} />} color="gold">
                                    <Text strong>Penanganan Laporan</Text>
                                    <Paragraph style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>
                                        Laporan yang valid diteruskan ke pihak terkait (misal: teknisi) untuk ditangani.
                                    </Paragraph>
                                </Timeline.Item>
                                <Timeline.Item dot={<CheckOutlined style={{ fontSize: '20px', color: '#52c41a' }} />} color="green">
                                    <Text strong>Notifikasi & Selesai</Text>
                                    <Paragraph style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>
                                        Anda menerima notifikasi status akhir laporan (Diterima/Ditolak/Selesai).
                                    </Paragraph>
                                </Timeline.Item>
                            </Timeline>
                        </Card>
                    </Col>
                </Row>
            </div>
        </DashboardLayout>
    );
};

export default DashboardStudent;