import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [reports, setReports] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        getReports();
    }, []);

    const axiosJWT = axios.create();
    axiosJWT.interceptors.request.use(async (config) => {
        const token = localStorage.getItem('token');
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    const getReports = async () => {
        const response = await axiosJWT.get(`/api/reports`);
        setReports(response.data);
    }

    const deleteReport = async (id) => {
        try {
            await axiosJWT.delete(`/api/reports/${id}`);
            getReports();
        } catch (error) { console.log(error); }
    }

    const acceptReport = async (id) => {
        try {
            await axiosJWT.patch(`/api/reports/${id}/accept`);
            alert("Laporan diterima, Email notifikasi terkirim (Cek Console Backend)");
            getReports();
        } catch (error) { console.log(error); }
    }

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/');
    }

    return (
        <div className="container mt-5">
            <div className="level">
                <div className="level-left"><h1 className="title">Dashboard Admin</h1></div>
                <div className="level-right"><button onClick={logout} className="button is-danger">Log Out</button></div>
            </div>
            <table className="table is-striped is-fullwidth">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Mahasiswa</th>
                        <th>Tanggal</th>
                        <th>Bukti</th>
                        <th>Kerusakan</th>
                        <th>Saran</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map((report, index) => (
                        <tr key={report.id}>
                            <td>{index + 1}</td>
                            <td>{report.user.name} ({report.user.email})</td>
                            <td>{report.report_date}</td>
                            <td><a href={report.image} target="_blank">Lihat Gambar</a></td>
                            <td>{report.description}</td>
                            <td>{report.suggestion}</td>
                            <td>{report.status}</td>
                            <td>
                                <button onClick={()=>acceptReport(report.id)} className="button is-small is-info mr-2">Terima</button>
                                <button onClick={()=>deleteReport(report.id)} className="button is-small is-danger">Hapus</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
export default AdminDashboard;