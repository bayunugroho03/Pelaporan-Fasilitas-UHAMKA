import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const [step, setStep] = useState(1); // 1: Form, 2: Kuesioner, 3: Success
    const [date, setDate] = useState('');
    const [desc, setDesc] = useState('');
    const [saran, setSaran] = useState('');
    const [file, setFile] = useState('');
    const [reportId, setReportId] = useState(null);
    const [rating, setRating] = useState(5);
    const navigate = useNavigate();

    const axiosJWT = axios.create();
    axiosJWT.interceptors.request.use(async (config) => {
        const token = localStorage.getItem('token');
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    const loadFile = (e) => {
        const image = e.target.files[0];
        setFile(image);
    }

    const submitReport = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("date", date);
        formData.append("description", desc);
        formData.append("suggestion", saran);

        try {
            const res = await axiosJWT.post(`${import.meta.env.VITE_API_URL}/reports`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setReportId(res.data.reportId);
            setStep(2); // Pindah ke kuesioner
        } catch (error) {
            console.log(error);
        }
    }

    const submitQuestionnaire = async (e) => {
        e.preventDefault();
        try {
            await axiosJWT.post(`${import.meta.env.VITE_API_URL}/questionnaire`, {
                reportId: reportId,
                rating: rating
            });
            setStep(3); // Pindah ke success screen
        } catch (error) { console.log(error); }
    }

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/');
    }

    const resetForm = () => {
        setStep(1);
        setDate('');
        setDesc('');
        setSaran('');
        setFile('');
    }

    return (
        <div className="container mt-5">
            <div className="level">
                <div className="level-left"><h1 className="title">Lapor Fasilitas</h1></div>
                <div className="level-right"><button onClick={logout} className="button is-danger">Log Out</button></div>
            </div>

            {step === 1 && (
                <div className="box">
                    <h2 className="subtitle">Form Laporan</h2>
                    <form onSubmit={submitReport}>
                        <div className="field">
                            {/* <label className="label">Tanggal Bukti</label> */}
                            <div className="field">
                                <label className="label">Tanggal Bukti</label>
                                <div className="control">
                                    <input type="date" className="input" value={date} onChange={(e)=>setDate(e.target.value)}
                                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                    required/>
                                </div>
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Bukti Gambar</label>
                            <div className="control"><input type="file" className="input" onChange={loadFile} required /></div>
                        </div>
                        <div className="field">
                            <label className="label">Penjelasan Kerusakan</label>
                            <div className="control"><textarea className="textarea" value={desc} onChange={(e)=>setDesc(e.target.value)} required></textarea></div>
                        </div>
                        <div className="field">
                            <label className="label">Saran</label>
                            <div className="control"><textarea className="textarea" value={saran} onChange={(e)=>setSaran(e.target.value)} required></textarea></div>
                        </div>
                        <button className="button is-primary mt-3">Kirim Laporan</button>
                    </form>
                </div>
            )}

            {step === 2 && (
                <div className="box has-text-centered">
                    <h2 className="title is-4">Bagaimana kuliah mu hari ini?</h2>
                    <form onSubmit={submitQuestionnaire}>
                        <div className="control mb-5">
                            {[...Array(5)].map((_, i) => (
                                <label className="radio mr-3" key={i}>
                                    <input type="radio" name="rating" value={i+1} onChange={(e)=>setRating(e.target.value)} /> {i+1}
                                </label>
                            ))}
                        </div>
                        <button className="button is-info">Kirim Penilaian</button>
                    </form>
                </div>
            )}

            {step === 3 && (
                <div className="box has-text-centered">
                    <h1 className="title has-text-success">Terimakasih telah mengisi laporan hari ini!</h1>
                    <button onClick={resetForm} className="button is-primary mr-2">Isi Laporan Lagi</button>
                    <button onClick={logout} className="button is-danger">Log Out</button>
                </div>
            )}
        </div>
    )
}
export default StudentDashboard;