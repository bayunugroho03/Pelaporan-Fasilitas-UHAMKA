import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Typography, theme } from 'antd';
import { 
    MenuFoldOutlined, 
    MenuUnfoldOutlined, 
    DashboardOutlined, 
    FormOutlined, 
    HistoryOutlined, 
    LogoutOutlined,
    InboxOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import logoUhamka from '../assets/logo.png'; 

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const DashboardLayout = ({ children, role }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // MENU MAHASISWA
    const studentItems = [
        {
            key: '/student',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/student/create',
            icon: <FormOutlined />,
            label: 'Buat Laporan',
        },
        {
            key: '/student/history',
            icon: <HistoryOutlined />,
            label: 'Riwayat Laporan',
        },
    ];

    // MENU ADMIN
    const adminItems = [
        {
            key: '/admin',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/admin/incoming',
            icon: <InboxOutlined />,
            label: 'Laporan Masuk',
        },
        {
            key: '/admin/history',
            icon: <HistoryOutlined />,
            label: 'History Laporan',
        },
    ];

    const handleMenuClick = ({ key }) => {
        navigate(key);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* SIDEBAR DIBUAT FIXED AGAR TIDAK IKUT SCROLL */}
            <Sider 
                trigger={null} 
                collapsible 
                collapsed={collapsed}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed', // KUNCI: Membuat sidebar diam di tempat
                    left: 0,
                    top: 0,
                    bottom: 0,
                    background: '#001529',
                    zIndex: 100
                }}
            >
                {/* LOGO AREA */}
                <div style={{ padding: '20px', textAlign: 'center', transition: 'all 0.2s' }}>
                    <Avatar src={logoUhamka} size={collapsed ? 40 : 80} style={{ backgroundColor: '#fff' }} />
                    {!collapsed && (
                        <div style={{ marginTop: 10 }}>
                            <Title level={5} style={{ color: 'white', margin: 0 }}>Lapor Fasilitas</Title>
                        </div>
                    )}
                </div>

                {/* MENU */}
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={[location.pathname]}
                    items={role === 'admin' ? adminItems : studentItems}
                    onClick={handleMenuClick}
                    style={{ marginBottom: 50 }} // Memberi jarak agar menu paling bawah tidak ketutup tombol logout
                />

                {/* TOMBOL LOGOUT FIXED DI BAWAH */}
                <div style={{ position: 'absolute', bottom: 0, width: '100%', padding: '10px', backgroundColor: '#001529' }}>
                     <Button 
                        type="primary" 
                        danger 
                        icon={<LogoutOutlined />} 
                        block={!collapsed} 
                        shape={collapsed ? "circle" : "default"}
                        onClick={handleLogout}
                    >
                        {!collapsed && "Log Out"}
                    </Button>
                </div>
            </Sider>

            {/* CONTENT AREA DIGESER AGAR TIDAK TERTUTUP SIDEBAR */}
            <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
                <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1, width: '100%' }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 64, height: 64 }}
                    />
                    <Title level={4} style={{ margin: 0 }}>
                        {role === 'admin' ? 'Administrator Panel' : 'Dashboard Mahasiswa'}
                    </Title>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default DashboardLayout;