import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Card, Alert } from 'antd'; // Pastikan import Antd benar

const Register = () => {
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const onFinish = async (values) => {
        console.log("SAYA KLIK TOMBOL REGISTER - URL: ${import.meta.env.VITE_API_URL}/api/users");
        try {
            // PERHATIKAN: URL ke /users
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users`, {
                name: values.name,
                email: values.email,
                password: values.password,
                confPassword: values.confPassword
            });
            
            // Sukses
            alert(res.data.msg); // Muncul popup "Cek Email Anda"
            navigate("/");       // Pindah ke halaman Login

        } catch (error) {
            if (error.response) {
                setMsg(error.response.data.msg); // Tampilkan pesan error di Alert
            }
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '50px' }}>
            <Card title="Register Mahasiswa" style={{ width: 400 }}>
                {msg && <Alert message={msg} type="error" showIcon style={{ marginBottom: 20 }} />}
                
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item label="Nama" name="name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Email Kampus (@uhamka.ac.id)" name="email" rules={[{ required: true, type: 'email' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Password" name="password" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item label="Konfirmasi Password" name="confPassword" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>Register</Button>
                </Form>
            </Card>
        </div>
    );
};

export default Register;