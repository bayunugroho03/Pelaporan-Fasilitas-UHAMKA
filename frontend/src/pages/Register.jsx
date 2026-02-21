import React from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const { Title } = Typography;

const Register = () => {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        // Validasi Frontend Email Uhamka
        if(!values.email.endsWith('@uhamka.ac.id')){
            return message.error("Wajib menggunakan email @uhamka.ac.id!");
        }
        if(values.password !== values.confPassword){
            return message.error("Password tidak cocok!");
        }

        try {
            await axios.post('http://localhost:5000/register', values);
            message.success("Registrasi Berhasil! Cek terminal backend untuk link verifikasi.");
            navigate('/');
        } catch (error) {
            message.error(error.response?.data?.msg || "Registrasi Gagal");
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <Card style={{ width: 450, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Title level={3}>Register Mahasiswa</Title>
                </div>
                <Form name="register" onFinish={onFinish} layout="vertical">
                    <Form.Item name="name" label="Nama Lengkap" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email (@uhamka.ac.id)" rules={[{ required: true, type: 'email' }]}>
                        <Input placeholder="contoh@uhamka.ac.id" />
                    </Form.Item>
                    <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item name="confPassword" label="Konfirmasi Password" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block size="large">Register</Button>
                </Form>
                <div style={{ textAlign: 'center', marginTop: 15 }}>
                    <Link to="/">Kembali ke Login</Link>
                </div>
            </Card>
        </div>
    );
};
export default Register;