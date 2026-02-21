import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, Upload, Card, message, Row, Col, Radio } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';

const CreateReport = () => {
    const navigate = useNavigate();
    
    // State UI
    const [fileList, setFileList] = useState([]);
    const [step, setStep] = useState(1);
    const [reportId, setReportId] = useState(null);
    const [loading, setLoading] = useState(false);

    // --- LOGIKA BARU (SIMPEL TANPA INTERCEPTOR) ---
    const token = localStorage.getItem('token'); // 1. Ambil token dari penyimpanan

    // Fungsi Saat Form Laporan Dikirim
    const onFinishForm = async (values) => {
        if(!token) {
            message.error("Sesi habis, silakan login ulang");
            return navigate("/");
        }
        if(fileList.length === 0) return message.error("Harap upload bukti gambar!");
        
        const formData = new FormData();
        formData.append("date", values.date.format('YYYY-MM-DD'));
        formData.append("file", fileList[0].originFileObj);
        formData.append("description", values.description);
        formData.append("suggestion", values.suggestion);

        try {
            setLoading(true);
            
            // 2. KIRIM DATA PAKAI TOKEN BIASA (Lebih Cepat & Tidak Lag)
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/reports`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Tempel token manual disini
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            setReportId(res.data.reportId);
            setLoading(false);
            setStep(2); 
            message.success("Laporan terkirim, mohon isi kuesioner singkat.");

        } catch (error) {
            setLoading(false);
            console.error(error);
            // Jika token ditolak backend (403), suruh login lagi
            if(error.response && (error.response.status === 401 || error.response.status === 403)){
                navigate("/");
            } else {
                message.error("Gagal mengirim laporan. Pastikan Server Nyala.");
            }
        }
    };

    // Fungsi Saat Kuesioner Dikirim
    const onFinishKuesioner = async (values) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/questionnaire`, {
                reportId: reportId,
                rating: values.rating
            }, {
                headers: { 'Authorization': `Bearer ${token}` } // Pakai token lagi
            });

            message.success("Terimakasih telah mengisi laporan hari ini!");
            navigate('/student'); 
        } catch (error) {
            console.error(error);
            message.error("Gagal mengirim penilaian.");
        }
    }

    return (
        <DashboardLayout role="student">
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <Card 
                    title={step === 1 ? "Form Laporan Kerusakan" : "Kuesioner Harian"}
                    bordered={false}
                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                >
                    {step === 1 ? (
                        /* --- STEP 1: FORM LAPORAN --- */
                        <Form layout="vertical" onFinish={onFinishForm}>
                            <Row gutter={24}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="date" label="Tanggal Bukti" rules={[{ required: true, message: 'Pilih tanggal!' }]}>
                                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item label="Bukti Gambar" required tooltip="Format: jpg/png, Max 5MB">
                                        <Upload 
                                            listType="picture"
                                            maxCount={1}
                                            beforeUpload={() => false} 
                                            onChange={({ fileList }) => setFileList(fileList)}
                                            fileList={fileList}
                                        >
                                            <Button icon={<UploadOutlined />}>Pilih Gambar</Button>
                                        </Upload>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="description" label="Penjelasan Kerusakan" rules={[{ required: true, message: 'Deskripsi kerusakan wajib diisi!' }]}>
                                <Input.TextArea rows={4} placeholder="Contoh: AC di ruang 404 meneteskan air..." />
                            </Form.Item>

                            <Form.Item name="suggestion" label="Saran Perbaikan" rules={[{ required: true, message: 'Saran wajib diisi!' }]}>
                                <Input.TextArea rows={3} placeholder="Contoh: Mohon segera diservice..." />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading} block size="large">
                                    Kirim Laporan
                                </Button>
                            </Form.Item>
                        </Form>
                    ) : (
                        /* --- STEP 2: KUESIONER --- */
                        <Form onFinish={onFinishKuesioner} layout="vertical" style={{ textAlign: 'center', padding: '20px 0' }}>
                            <h3 style={{ marginBottom: 20 }}>Bagaimana kuliah mu hari ini?</h3>
                            <p style={{ color: 'gray', marginBottom: 30 }}>Berikan penilaian dari 1 (Buruk) sampai 5 (Sangat Baik)</p>
                            
                            <Form.Item name="rating" rules={[{ required: true, message: 'Harap pilih nilai!' }]}>
                                <Radio.Group buttonStyle="solid" size="large">
                                    {[...Array(5)].map((_, i) => (
                                        <Radio.Button key={i} value={i + 1} style={{ width: 45, textAlign: 'center' }}>
                                            {i + 1}
                                        </Radio.Button>
                                    ))}
                                </Radio.Group>
                            </Form.Item>
                            
                            <Button type="primary" htmlType="submit" size="large" style={{ marginTop: 20, width: 200 }}>
                                Kirim Penilaian
                            </Button>
                        </Form>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default CreateReport;