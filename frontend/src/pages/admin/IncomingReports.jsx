import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Modal, Input, message, Image, Tag, Space } from 'antd';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout'; 

const IncomingReports = () => {
    const [reports, setReports] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentReport, setCurrentReport] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);

    // 1. AMBIL TOKEN SECARA MANUAL
    const token = localStorage.getItem('token');

    useEffect(() => {
        getReports();
    }, []);

    const getReports = async () => {
        setLoading(true);
        try {
            // 2. GUNAKAN AXIOS BIASA + HEADER AUTHORIZATION
            const res = await axios.get('http://localhost:5000/reports', {
                headers: {
                    Authorization: `Bearer ${token}` 
                }
            });
            // Filter laporan status 'pending'
            const pendingReports = res.data.filter(r => r.status === 'pending');
            setReports(pendingReports);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (report, action) => {
        setCurrentReport({ ...report, actionType: action });
        setIsModalOpen(true);
    };

    const submitResponse = async () => {
        if(!feedback) return message.warning("Harap isi feedback/alasan!");
        
        try {
            // Status sesuai ENUM di ReportModel: 'pending', 'accepted', 'rejected'
            const statusKeputusan = currentReport.actionType === 'accepted' ? 'accepted' : 'rejected';

            // 3. PERBAIKI ENDPOINT & PAYLOAD
            // Gunakan PATCH ke endpoint /respond
            await axios.patch(`http://localhost:5000/reports/${currentReport.id}/respond`, {
                status: statusKeputusan,
                feedback: feedback // Field di database adalah 'feedback'
            }, {
                headers: {
                    Authorization: `Bearer ${token}` // Wajib Header Token
                }
            });

            message.success(`Laporan berhasil ${currentReport.actionType === 'accepted' ? 'diterima' : 'ditolak'}!`);
            
            // Reset
            setIsModalOpen(false);
            setFeedback('');
            getReports(); // Refresh data tabel

        } catch (error) {
            console.error(error);
            if(error.response) {
                message.error(error.response.data.msg);
            } else {
                message.error("Gagal mengirim keputusan.");
            }
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
                    placeholder={true}
                    style={{ borderRadius: 4 }}
                />
            )
        },
        { 
            title: 'Deskripsi Kerusakan', 
            dataIndex: 'description', 
            key: 'desc' 
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button 
                        type="primary" 
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} 
                        onClick={() => handleAction(record, 'accepted')}
                    >
                        Terima
                    </Button>
                    <Button 
                        type="primary" 
                        danger 
                        onClick={() => handleAction(record, 'rejected')}
                    >
                        Tolak
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <DashboardLayout role="admin">
            <Card title="Laporan Masuk (Menunggu Verifikasi)" bordered={false}>
                <Table 
                    dataSource={reports} 
                    columns={columns} 
                    rowKey="id" 
                    loading={loading}
                    locale={{ emptyText: 'Tidak ada laporan baru' }}
                />
            </Card>

            <Modal 
                title={`Konfirmasi ${currentReport?.actionType === 'accepted' ? 'Terima' : 'Tolak'} Laporan`} 
                open={isModalOpen} 
                onOk={submitResponse} 
                onCancel={() => setIsModalOpen(false)}
                okText="Kirim Keputusan"
                cancelText="Batal"
            >
                <p>Berikan tanggapan atau alasan kepada mahasiswa:</p>
                <Input.TextArea 
                    rows={4} 
                    value={feedback} 
                    onChange={(e) => setFeedback(e.target.value)} 
                    placeholder={currentReport?.actionType === 'accepted' 
                        ? "Contoh: Laporan diterima, teknisi akan segera meluncur." 
                        : "Contoh: Mohon maaf, laporan ditolak karena gambar tidak jelas."} 
                />
            </Modal>
        </DashboardLayout>
    );
};

export default IncomingReports;