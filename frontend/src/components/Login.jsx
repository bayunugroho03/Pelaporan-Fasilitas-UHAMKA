import React from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd'; // <--- PASTIKAN 'message' ADA DISINI
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const { Title } = Typography;

const Login = () => {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            // Request Login
            const res = await axios.post(`/api/login`, values);
            
            // Simpan Token
            localStorage.setItem('token', res.data.accessToken);
            message.success("Login Berhasil!");
            
            // Cek Role & Redirect
            // Pastikan backend mengirim 'role', jika tidak ada default ke student
            if(res.data.role === 'admin'){
                navigate('/admin');
            } else {
                navigate('/student');
            }

        } catch (error) {
            // --- PERBAIKAN DISINI ---
            // Jangan panggil 'response' disini, tapi panggil 'error.response'
            console.log("Error Login:", error);

            if (error.response) {
                // Error dari Backend (Password salah / User tidak ada / Belum verif)
                message.error(error.response.data.msg);
            } else {
                // Error Jaringan (Backend mati)
                message.error("Server tidak merespon/Network Error");
            }
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Title level={3}>Lapor UHAMKA</Title>
                    <p>Silahkan login untuk melanjutkan</p>
                </div>
                <Form name="login" onFinish={onFinish} layout="vertical">
                    <Form.Item name="email" rules={[{ required: true, message: 'Masukkan Email!' }]}>
                        <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: 'Masukkan Password!' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large">Login</Button>
                    </Form.Item>
                </Form>
                <div style={{ textAlign: 'center' }}>
                    Belum punya akun? <Link to="/register">Register Mahasiswa</Link>
                </div>
            </Card>
        </div>
    );
};

export default Login;