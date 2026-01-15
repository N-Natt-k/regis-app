import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { 
  loginStudent, 
  registerStudent, 
  getSystemConfig, 
  saveSystemConfig,
  getAnnouncements,
  addAnnouncement,
  getAllStudents,
  updateStudent,
  deleteStudent,
  bulkDeleteApplications,
  getSystemSettings,
  saveSystemSettings,
  getProjects,
  getProjectByRoom,
  addProject,
  updateProject,
  deleteProject,
  deleteAnnouncement
} from './services/dataService';
import { UserRole, GradeLevel, ROOM_OPTIONS, GRADE_OPTIONS, StudentData, SystemConfig, Announcement, SystemSettings, Project, AdminUser } from './types';
import { 
  LogOut, 
  User as UserIcon, 
  Menu, 
  X, 
  Users, 
  FileText, 
  Award, 
  ChevronRight,
  Settings,
  Trash2,
  Download,
  Filter,
  Edit3,
  Save,
  ChevronDown,
  UserCog,
  ArrowLeft,
  Calendar,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  LayoutDashboard,
  Megaphone,
  Link as LinkIcon,
  Search,
  ChevronLeft
} from 'lucide-react';
import * as d3 from 'd3'; 
// @ts-ignore
import html2canvas from 'html2canvas';

// --- Components ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'gold' | 'success' }> = ({ className = '', variant = 'primary', ...props }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-700 to-blue-900 text-white hover:from-blue-800 hover:to-blue-950 shadow-md hover:shadow-lg',
    secondary: 'bg-white text-blue-900 border border-gray-200 hover:bg-gray-50',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
    outline: 'border-2 border-blue-700 text-blue-700 hover:bg-blue-50',
    gold: 'bg-gradient-to-r from-amber-400 to-amber-600 text-white hover:from-amber-500 hover:to-amber-700 shadow-md',
    success: 'bg-green-600 text-white hover:bg-green-700 shadow-md'
  };
  return (
    <button className={`px-4 py-2 rounded-full transition-all duration-300 font-medium ${variants[variant]} ${className}`} {...props} />
  );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all ${className}`} {...props} />
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

// --- Navbar with Dropdown ---

const Navbar = () => {
  const { currentUser, role, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <nav className="bg-white/95 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
              <div className="relative">
                 <img className="h-10 w-auto rounded-full shadow-md group-hover:scale-105 transition-transform duration-300" src="https://img5.pic.in.th/file/secure-sv1/IMG_25650953161d1c1bbdd8.jpeg" alt="Logo" />
                 <div className="absolute inset-0 rounded-full border border-black/5"></div>
              </div>
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-600 hidden md:block">
                SPT Moral School
              </span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                    {role === UserRole.STUDENT ? (currentUser as StudentData).firstName.charAt(0) : 'A'}
                  </div>
                  <span className="text-gray-700 text-sm font-medium">
                    {role === UserRole.STUDENT 
                      ? `${(currentUser as StudentData).firstName}` 
                      : 'Administrator'}
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    {role === UserRole.STUDENT && (
                      <Link 
                        to="/profile/edit" 
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <UserCog size={16} className="mr-3" />
                        แก้ไขข้อมูลส่วนตัว
                      </Link>
                    )}
                    <button 
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      className="w-full text-left flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} className="mr-3" />
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            ) : (
               <Link to="/login"><Button variant="primary" className="shadow-blue-500/30">เข้าสู่ระบบ</Button></Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
             <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition">
                {isOpen ? <X size={28} /> : <Menu size={28} />}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-2xl animate-in slide-in-from-top-5 duration-200 z-50">
           <div className="p-4 space-y-2">
             {currentUser ? (
               <>
                  <div className="px-4 py-3 bg-blue-50 rounded-xl mb-4 border border-blue-100">
                     <div className="font-bold text-blue-900 text-lg">
                        {role === UserRole.STUDENT ? `${(currentUser as StudentData).prefix} ${(currentUser as StudentData).firstName}` : 'Admin'}
                     </div>
                     <div className="text-sm text-blue-600/80 font-mono">
                        {role === UserRole.STUDENT ? `รหัส: ${(currentUser as StudentData).studentId}` : ''}
                     </div>
                  </div>
                  
                  {role === UserRole.STUDENT && (
                    <Link 
                      to="/profile/edit" 
                      onClick={() => setIsOpen(false)} 
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                    >
                        <UserCog size={20} className="mr-3 text-blue-600"/> แก้ไขข้อมูลส่วนตัว
                    </Link>
                  )}
                  
                  <button 
                    onClick={() => { logout(); setIsOpen(false); }} 
                    className="w-full text-left flex items-center px-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-lg transition"
                  >
                    <LogOut size={20} className="mr-3" /> ออกจากระบบ
                  </button>
               </>
             ) : (
               <Link 
                 to="/login" 
                 onClick={() => setIsOpen(false)}
                 className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 active:scale-95 transition"
               >
                 เข้าสู่ระบบ
               </Link>
             )}
           </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-slate-900 text-white pt-16 pb-8 mt-12 relative overflow-hidden">
    {/* Decorative Elements */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500"></div>
    <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
    <div className="absolute top-20 -left-20 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl"></div>

    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <img className="h-12 w-auto rounded-full border-2 border-white/20" src="https://img5.pic.in.th/file/secure-sv1/IMG_25650953161d1c1bbdd8.jpeg" alt="Logo" />
             <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">SPT Moral School</h3>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            โรงเรียนคุณธรรม สพฐ. โรงเรียนสตรีพัทลุง<br/>
            มุ่งเน้นพัฒนาเยาวชนไทยสู่ความเป็นเลิศด้านคุณธรรม จริยธรรม และความเป็นผู้นำในศตวรรษที่ 21
          </p>
        </div>
        
        <div className="md:pl-10">
          <h3 className="text-lg font-bold mb-6 text-amber-400">ลิงก์ที่สำคัญ</h3>
          <ul className="space-y-3 text-sm text-slate-300">
             <li><a href="https://spt-moral-school.github.io/#policy" className="hover:text-white transition duration-300 flex items-center gap-2 group"><ChevronRight size={12} className="text-amber-500 group-hover:translate-x-1 transition"/> นโยบายความเป็นส่วนตัว</a></li>
             <li><a href="https://spt-moral-school.github.io/#terms" className="hover:text-white transition duration-300 flex items-center gap-2 group"><ChevronRight size={12} className="text-amber-500 group-hover:translate-x-1 transition"/> ข้อกำหนดการใช้งาน</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-bold mb-6 text-amber-400">ข้อมูลติดต่อ</h3>
          <ul className="space-y-4 text-sm text-slate-300">
            <li className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-amber-400"><UserIcon size={16}/></div> <span>Email: sptmorral@spt.ac.th</span></li>
            <li className="flex gap-4 mt-6">
               <a href="https://www.facebook.com/sptmoralschool" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-500 hover:-translate-y-1 transition shadow-lg shadow-blue-900/50">FB</a>
               <a href="https://www.instagram.com/spt_moral_school/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center hover:bg-pink-500 hover:-translate-y-1 transition shadow-lg shadow-pink-900/50">IG</a>
               <a href="https://www.tiktok.com/@spt.moral.school" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-black border border-white/20 flex items-center justify-center hover:border-white/50 hover:-translate-y-1 transition shadow-lg">TT</a>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-slate-800 mt-12 pt-8 text-center">
        <p className="text-slate-500 text-xs">
          &copy; 2024 SPT Moral School - โรงเรียนคุณธรรม สพฐ. โรงเรียนสตรีพัทลุง | All Rights Reserved.
        </p>
      </div>
    </div>
  </footer>
);

// --- Pages ---

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [id, setId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginAsStudent } = useAuth();
  const navigate = useNavigateWithHash();

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const student = await loginStudent(id, phone);
      if (student) {
        loginAsStudent(student);
        navigate('/');
      } else {
        setError('ไม่พบข้อมูล หรือ เบอร์โทรศัพท์ไม่ถูกต้อง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Card className="w-full max-w-md p-10 shadow-2xl border-none relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-blue-400"></div>
        <h2 className="text-3xl font-extrabold text-center text-blue-900 mb-8 tracking-tight">เข้าสู่ระบบ</h2>
        
        <div className="flex bg-gray-100 rounded-full p-1.5 mb-8 shadow-inner">
          <button 
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition duration-300 ${activeTab === 'student' ? 'bg-white shadow-md text-blue-800' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setActiveTab('student'); setError(''); }}
          >
            นักเรียน
          </button>
          <button 
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition duration-300 ${activeTab === 'admin' ? 'bg-white shadow-md text-blue-800' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setActiveTab('admin'); setError(''); }}
          >
            ผู้ดูแลระบบ
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center border border-red-100 flex items-center justify-center gap-2"><AlertCircle size={16}/> {error}</div>}

        {activeTab === 'student' ? (
          <form onSubmit={handleStudentLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">เลขประจำตัวนักเรียน</label>
              <Input type="text" value={id} onChange={(e) => setId(e.target.value)} required placeholder="เช่น 12345" className="bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">เบอร์โทรศัพท์</label>
              <Input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="08XXXXXXXX" className="bg-gray-50" />
            </div>
            <Button type="submit" className="w-full mt-2 py-3.5 shadow-lg shadow-blue-500/20 text-lg">เข้าสู่ระบบ</Button>
            <div className="text-center mt-6 text-sm">
              ยังไม่มีบัญชี? <Link to="/register" className="text-blue-600 hover:underline font-bold">สมัครสมาชิก</Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">อีเมล</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">รหัสผ่าน</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-gray-50" />
            </div>
            <Button type="submit" className="w-full mt-2 py-3.5 shadow-lg shadow-blue-500/20 text-lg">เข้าสู่ระบบผู้ดูแล</Button>
          </form>
        )}
      </Card>
    </div>
  );
};

const RegisterPage = () => {
  const [form, setForm] = useState({
    studentId: '',
    prefix: 'นาย',
    firstName: '',
    lastName: '',
    grade: GradeLevel.M1,
    room: '1',
    phone: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigateWithHash();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerStudent(form);
      alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 bg-gray-50">
      <Card className="w-full max-w-2xl shadow-2xl border-none relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <h2 className="text-3xl font-extrabold text-center text-blue-900 mb-8">สมัครสมาชิก</h2>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-center border border-red-100">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Fields... (same as before but ensuring styling) */}
           <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">เลขประจำตัวนักเรียน</label>
            <Input required value={form.studentId} onChange={(e) => setForm({...form, studentId: e.target.value})} className="bg-gray-50"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คำนำหน้า</label>
            <div className="relative">
              <select 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 appearance-none"
                value={form.prefix}
                onChange={(e) => setForm({...form, prefix: e.target.value})}
              >
                <option>เด็กชาย</option>
                <option>เด็กหญิง</option>
                <option>นาย</option>
                <option>นางสาว</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown size={16}/>
              </div>
            </div>
          </div>
          <div></div> 
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
            <Input required value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} className="bg-gray-50"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
            <Input required value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} className="bg-gray-50"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ระดับชั้น</label>
            <div className="relative">
              <select 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 appearance-none"
                value={form.grade}
                onChange={(e) => setForm({...form, grade: e.target.value as GradeLevel})}
              >
                {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown size={16}/>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ห้อง</label>
            <div className="relative">
              <select 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 appearance-none"
                value={form.room}
                onChange={(e) => setForm({...form, room: e.target.value})}
              >
                {ROOM_OPTIONS.map(r => <option key={r} value={r}>ห้อง {r}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown size={16}/>
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
            <Input required value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="08XXXXXXXX" className="bg-gray-50"/>
          </div>
          <div className="md:col-span-2 pt-4">
             <Button type="submit" className="w-full py-3 shadow-lg shadow-blue-500/20">ลงทะเบียน</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const EditProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigateWithHash();
  const [form, setForm] = useState({
    prefix: '',
    firstName: '',
    lastName: '',
    grade: GradeLevel.M1,
    room: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [currentSysYear, setCurrentSysYear] = useState('');

  useEffect(() => {
    getSystemSettings().then(s => setCurrentSysYear(s.currentAcademicYear));
    if (currentUser && 'studentId' in currentUser) {
      const s = currentUser as StudentData;
      setForm({
        prefix: s.prefix,
        firstName: s.firstName,
        lastName: s.lastName,
        grade: s.grade,
        room: s.room,
        phone: s.phone
      });
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !(currentUser as StudentData).id) return;
    setLoading(true);
    try {
      const uid = (currentUser as StudentData).id!;
      const dataToUpdate = { ...form, academicYear: currentSysYear };
      await updateStudent(uid, dataToUpdate);
      updateProfile(dataToUpdate);
      alert('บันทึกข้อมูลเรียบร้อย');
      navigate('/');
    } catch (e) {
      alert('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const isOutdated = (currentUser as StudentData).academicYear !== currentSysYear;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {isOutdated && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r shadow-md animate-bounce">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 mr-2" />
            <p className="font-bold text-red-700">กรุณาอัปเดตข้อมูลให้เป็นปัจจุบันสำหรับปีการศึกษา {currentSysYear}</p>
          </div>
        </div>
      )}

      <Link to="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition">
        <ArrowLeft size={20} className="mr-2"/> กลับหน้าหลัก
      </Link>
      
      <Card className="shadow-2xl border-none overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 -m-6 mb-6 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-full backdrop-blur">
               <UserCog size={32} />
            </div>
            <div>
               <h2 className="text-2xl font-bold">แก้ไขข้อมูลส่วนตัว</h2>
               <p className="text-blue-200 text-sm">ปีการศึกษาปัจจุบัน: {currentSysYear || '...'}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
           {/* Form fields (Student ID read only, others editable) */}
           <div className="md:col-span-2">
             <label className="block text-sm font-medium text-gray-500 mb-1">รหัสนักเรียน (ไม่สามารถแก้ไขได้)</label>
             <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-500 font-mono">
               {(currentUser as StudentData).studentId}
             </div>
           </div>
           {/* ... Inputs for prefix, name, grade, room, phone ... */}
           {/* Simplified for brevity in this massive response, assuming content identical to previous Register fields but with state binding */}
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คำนำหน้า</label>
            <div className="relative">
              <select className="w-full px-4 py-2 rounded-lg border border-gray-300" value={form.prefix} onChange={(e) => setForm({...form, prefix: e.target.value})}>
                <option>เด็กชาย</option><option>เด็กหญิง</option><option>นาย</option><option>นางสาว</option>
              </select>
            </div>
          </div>
          <div></div> 
          <div><label className="block text-sm mb-1">ชื่อ</label><Input required value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} /></div>
          <div><label className="block text-sm mb-1">นามสกุล</label><Input required value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} /></div>
          <div>
            <label className="block text-sm mb-1">ระดับชั้น</label>
            <select className="w-full px-4 py-2 rounded-lg border border-gray-300" value={form.grade} onChange={(e) => setForm({...form, grade: e.target.value as GradeLevel})}>
                {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">ห้อง</label>
            <select className="w-full px-4 py-2 rounded-lg border border-gray-300" value={form.room} onChange={(e) => setForm({...form, room: e.target.value})}>
                {ROOM_OPTIONS.map(r => <option key={r} value={r}>ห้อง {r}</option>)}
            </select>
          </div>
          <div className="md:col-span-2"><label className="block text-sm mb-1">เบอร์โทรศัพท์</label><Input required value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></div>

          <div className="md:col-span-2 pt-6 flex gap-4">
             <Button type="button" variant="secondary" onClick={() => navigate('/')} className="flex-1">ยกเลิก</Button>
             <Button type="submit" disabled={loading} className="flex-1 flex justify-center items-center gap-2">
                <Save size={18} /> {loading ? 'กำลังบันทึก...' : 'ยืนยันข้อมูล'}
             </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const user = currentUser as StudentData;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-blue-600 mb-2">
            ยินดีต้อนรับ, {user.firstName}
          </h1>
          <p className="text-lg text-gray-600">สู่ระบบ SPT Moral School โรงเรียนคุณธรรม สพฐ.</p>
        </div>
        
        <Card className="flex items-center gap-6 py-4 px-6 bg-gradient-to-r from-white to-blue-50 border-l-4 border-blue-500 shadow-md">
           <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">ข้อมูลส่วนตัว</span>
              <span className="font-bold text-gray-800 text-lg">{user.prefix}{user.firstName} {user.lastName}</span>
              <span className="text-sm text-gray-600">{user.grade} ห้อง {user.room} | รหัส: {user.studentId}</span>
           </div>
           <Link to="/profile/edit">
             <Button variant="secondary" className="rounded-full w-12 h-12 flex items-center justify-center p-0 shadow-sm hover:scale-105">
                <Edit3 size={20} className="text-blue-600" />
             </Button>
           </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link to="/core-leader" className="group">
          <Card className="h-full hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center p-8 cursor-pointer relative overflow-hidden border-t-4 border-blue-500">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-150 duration-500">
               <Users size={120} />
            </div>
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-inner">
              <Users size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 z-10">นักเรียนแกนนำ<br/>ระดับห้องเรียน</h3>
            <p className="text-gray-500 text-sm mt-auto z-10 group-hover:text-blue-600 transition">สมัครและติดตามข่าวสารสำหรับตัวแทนห้องเรียน</p>
          </Card>
        </Link>

        <Link to="/committee" className="group">
          <Card className="h-full hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center p-8 cursor-pointer relative overflow-hidden border-t-4 border-indigo-500">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-150 duration-500">
               <Award size={120} />
            </div>
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-inner">
              <Award size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 z-10">คณะกรรมการนักเรียน<br/>ขับเคลื่อนโรงเรียนคุณธรรม</h3>
            <p className="text-gray-500 text-sm mt-auto z-10 group-hover:text-indigo-600 transition">สำหรับนักเรียนแกนนำที่ต้องการขับเคลื่อนระดับโรงเรียน</p>
          </Card>
        </Link>

        <Link to="/project" className="group">
          <Card className="h-full hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center p-8 cursor-pointer relative overflow-hidden border-t-4 border-teal-500">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-150 duration-500">
               <FileText size={120} />
            </div>
            <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-inner">
              <FileText size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 z-10">๑ ห้องเรียน<br/>๑ โครงงานคุณธรรม</h3>
            <p className="text-gray-500 text-sm mt-auto z-10 group-hover:text-teal-600 transition">ส่งโครงงานและติดตามผลการประกวด</p>
          </Card>
        </Link>
      </div>
    </div>
  );
};

const ActivityPage: React.FC<{ 
  type: 'CORE' | 'COMMITTEE', 
  title: string, 
  configKey: string, 
  isApplied: boolean,
  canApply?: boolean 
}> = ({ type, title, configKey, isApplied, canApply = true }) => {
  const { currentUser, updateProfile } = useAuth();
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [quotaFull, setQuotaFull] = useState(false);
  const user = currentUser as StudentData;

  useEffect(() => {
    const fetchData = async () => {
      const cfg = await getSystemConfig(configKey);
      setConfig(cfg);
      const ann = await getAnnouncements(type);
      setAnnouncements(ann);

      if (type === 'CORE' && cfg?.quotaPerRoom) {
         // Check quota
         const allStudents = await getAllStudents();
         const roomCount = allStudents.filter(s => s.grade === user.grade && s.room === user.room && s.isCoreLeader).length;
         if (roomCount >= cfg.quotaPerRoom) {
             setQuotaFull(true);
         }
      }
      setLoading(false);
    };
    fetchData();
  }, [configKey, type, user.grade, user.room]);

  const handleApply = async () => {
    if (!window.confirm('ยืนยันการสมัคร?')) return;
    try {
       const updateData = type === 'CORE' 
         ? { isCoreLeader: true, coreLeaderAppliedDate: new Date().toISOString() }
         : { isCommittee: true, committeeAppliedDate: new Date().toISOString() };
       
       await updateStudent(user.id!, updateData);
       updateProfile(updateData);
       alert('สมัครสำเร็จ!');
    } catch (e) {
       alert('เกิดข้อผิดพลาด');
    }
  };

  if (loading) return <div className="p-8 text-center">กำลังโหลด...</div>;

  const isOpen = config?.isOpen;
  const now = new Date();
  const isDateOpen = (!config?.openDate || new Date(config.openDate) <= now) && (!config?.closeDate || new Date(config.closeDate) >= now);
  const systemOpen = isOpen && isDateOpen;

  const gradeAllowed = type === 'COMMITTEE' && config?.allowedGrades ? config.allowedGrades.includes(user.grade) : true;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition">
        <ArrowLeft size={20} className="mr-2"/> กลับหน้าหลัก
      </Link>

      <div className="text-center mb-10">
         <h1 className="text-3xl font-bold text-blue-900 mb-2">{title}</h1>
         <p className="text-gray-600">ประจำปีการศึกษา {user.academicYear}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-2 space-y-6">
            <Card className="border-t-4 border-blue-500 shadow-lg">
               <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Megaphone className="text-blue-500"/> ประกาศและข่าวสาร</h2>
               <div className="space-y-4">
                  {announcements.length === 0 ? <p className="text-gray-400 text-center py-4">ยังไม่มีประกาศ</p> : 
                    announcements.map(a => (
                       <div key={a.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-md transition">
                          <h3 className="font-bold text-blue-900 text-lg mb-1">{a.title}</h3>
                          <p className="text-gray-600 text-sm mb-3 whitespace-pre-wrap">{a.content}</p>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                             <span>{new Date(a.date).toLocaleDateString()}</span>
                             {a.link && <a href={a.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline"><LinkIcon size={12}/> ลิงก์เพิ่มเติม</a>}
                          </div>
                       </div>
                    ))
                  }
               </div>
            </Card>
         </div>

         <div>
            <Card className={`text-center p-6 border-none shadow-xl ${isApplied ? 'bg-green-50' : 'bg-white'}`}>
               {isApplied ? (
                  <div className="py-6">
                     <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in">
                        <CheckCircle size={48} />
                     </div>
                     <h3 className="text-xl font-bold text-green-800 mb-2">สมัครเรียบร้อยแล้ว</h3>
                     <p className="text-green-600 text-sm">คุณได้ทำการลงทะเบียนในกิจกรรมนี้แล้ว</p>
                  </div>
               ) : (
                  <div className="space-y-4">
                     <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        {type === 'CORE' ? <Users size={32} /> : <Award size={32} />}
                     </div>
                     
                     <div className="text-left bg-slate-50 p-4 rounded-lg text-sm space-y-2 border border-slate-100">
                        <p className="flex justify-between"><span>สถานะระบบ:</span> <span className={`font-bold ${systemOpen ? 'text-green-600' : 'text-red-500'}`}>{systemOpen ? 'เปิดรับสมัคร' : 'ปิดรับสมัคร'}</span></p>
                        {config?.openDate && <p className="text-xs text-gray-400">เปิด: {new Date(config.openDate).toLocaleString()}</p>}
                        {config?.closeDate && <p className="text-xs text-gray-400">ปิด: {new Date(config.closeDate).toLocaleString()}</p>}
                     </div>

                     {!canApply && (
                        <div className="bg-orange-50 text-orange-600 p-3 rounded-lg text-sm border border-orange-100 flex items-start gap-2 text-left">
                           <AlertCircle size={16} className="shrink-0 mt-0.5" />
                           <span>ต้องเป็นนักเรียนแกนนำก่อน จึงจะสมัครกรรมการได้</span>
                        </div>
                     )}
                     
                     {quotaFull && !isApplied && type === 'CORE' && (
                         <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2 text-left">
                           <AlertCircle size={16} className="shrink-0 mt-0.5" />
                           <span>ห้องของคุณมีผู้สมัครครบจำนวนแล้ว ({config?.quotaPerRoom} คน)</span>
                        </div>
                     )}
                     
                     {!gradeAllowed && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2 text-left">
                           <AlertCircle size={16} className="shrink-0 mt-0.5" />
                           <span>เปิดรับสมัครเฉพาะระดับชั้น {config?.allowedGrades?.join(', ')}</span>
                        </div>
                     )}

                     <Button 
                       onClick={handleApply} 
                       disabled={!systemOpen || !canApply || quotaFull || !gradeAllowed} 
                       className="w-full py-3 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                     >
                        ลงทะเบียนสมัคร
                     </Button>
                  </div>
               )}
            </Card>
         </div>
      </div>
    </div>
  );
};

const ProjectPage = () => {
   const { currentUser } = useAuth();
   const user = currentUser as StudentData;
   const [config, setConfig] = useState<SystemConfig | null>(null);
   const [project, setProject] = useState<Project | null>(null);
   const [announcements, setAnnouncements] = useState<Announcement[]>([]);
   const [loading, setLoading] = useState(true);

   // Form state
   const [form, setForm] = useState({
      name: '',
      moralPrinciple: '',
      advisors: '',
      members: '',
      imageLink: '',
      docLink: ''
   });

   useEffect(() => {
      const fetchData = async () => {
         const cfg = await getSystemConfig('project');
         setConfig(cfg);
         const ann = await getAnnouncements('PROJECT');
         setAnnouncements(ann);
         
         const exist = await getProjectByRoom(user.academicYear!, user.grade, user.room);
         setProject(exist);
         if(exist) {
             setForm({
                 name: exist.name,
                 moralPrinciple: exist.moralPrinciple,
                 advisors: exist.advisors,
                 members: exist.members,
                 imageLink: exist.imageLink || '',
                 docLink: exist.docLink || ''
             });
         }
         setLoading(false);
      };
      if (user.academicYear) fetchData();
   }, [user]);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!window.confirm("ยืนยันการส่งข้อมูลโครงงาน?")) return;
      try {
         const data: Project = {
             ...form,
             academicYear: user.academicYear!,
             grade: user.grade,
             room: user.room,
             status: project ? project.status : 'PENDING',
             submissionDate: new Date().toISOString()
         };

         if(project && project.id) {
             await updateProject(project.id, data);
         } else {
             await addProject(data);
         }
         alert("บันทึกข้อมูลเรียบร้อย");
         window.location.reload();
      } catch (e) {
         alert("เกิดข้อผิดพลาด");
      }
   };

   if (loading) return <div className="p-8 text-center">กำลังโหลด...</div>;
   const isOpen = config?.isOpen;

   return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition">
            <ArrowLeft size={20} className="mr-2"/> กลับหน้าหลัก
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
           <div>
              <h1 className="text-3xl font-bold text-teal-900 mb-2">๑ ห้องเรียน ๑ โครงงานคุณธรรม</h1>
              <p className="text-teal-700">ชั้นมัธยมศึกษาปีที่ {user.grade.replace('ม.', '')} ห้อง {user.room}</p>
           </div>
           {config?.externalLink && (
              <a href={config.externalLink} target="_blank" rel="noreferrer">
                 <Button variant="gold" className="flex items-center gap-2"><LinkIcon size={18}/> ไปยังแบบฟอร์มภายนอก</Button>
              </a>
           )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                {project && (
                    <Card className={`border-l-4 ${project.status === 'APPROVED' ? 'border-green-500 bg-green-50' : 'border-yellow-400 bg-yellow-50'}`}>
                       <div className="flex items-start gap-4">
                          {project.status === 'APPROVED' ? <CheckCircle className="text-green-600 mt-1"/> : <AlertCircle className="text-yellow-600 mt-1"/>}
                          <div>
                             <h3 className={`font-bold text-lg ${project.status === 'APPROVED' ? 'text-green-800' : 'text-yellow-800'}`}>
                                {project.status === 'APPROVED' ? 'โครงงานได้รับการอนุมัติแล้ว' : 'รอการตรวจสอบ / แก้ไข'}
                             </h3>
                             <p className="text-sm opacity-80">ส่งเมื่อ: {new Date(project.submissionDate).toLocaleDateString()}</p>
                          </div>
                       </div>
                    </Card>
                )}
                
                <Card className="shadow-xl">
                   <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4"><Edit3 className="text-teal-600"/> ข้อมูลโครงงาน</h2>
                   <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อโครงงานคุณธรรม</label>
                         <Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} disabled={!isOpen} />
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">คุณธรรมอัตลักษณ์ (ที่สอดคล้อง)</label>
                         <Input required value={form.moralPrinciple} onChange={e => setForm({...form, moralPrinciple: e.target.value})} placeholder="เช่น ความรับผิดชอบ, ความซื่อสัตย์" disabled={!isOpen} />
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">ครูที่ปรึกษาโครงงาน</label>
                         <Input required value={form.advisors} onChange={e => setForm({...form, advisors: e.target.value})} disabled={!isOpen} />
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">รายชื่อสมาชิก (ใส่ชื่อ-สกุล เลขที่)</label>
                         <textarea required className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 outline-none" rows={4} value={form.members} onChange={e => setForm({...form, members: e.target.value})} disabled={!isOpen} ></textarea>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">ลิงก์รูปภาพกิจกรรม (Google Drive)</label>
                            <Input type="url" value={form.imageLink} onChange={e => setForm({...form, imageLink: e.target.value})} placeholder="https://..." disabled={!isOpen} />
                         </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">ลิงก์เล่มโครงงาน (PDF/Doc)</label>
                            <Input type="url" value={form.docLink} onChange={e => setForm({...form, docLink: e.target.value})} placeholder="https://..." disabled={!isOpen} />
                         </div>
                      </div>

                      {isOpen ? (
                          <Button type="submit" variant="success" className="w-full py-3 mt-4 text-lg shadow-lg">บันทึกข้อมูลโครงงาน</Button>
                      ) : (
                          <div className="text-center py-4 bg-gray-100 rounded-lg text-gray-500 font-bold">ระบบปิดรับข้อมูลแล้ว</div>
                      )}
                   </form>
                </Card>
            </div>

            <div className="space-y-6">
               <Card className="border-t-4 border-teal-500 shadow-lg">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Megaphone className="text-teal-500"/> ประกาศ</h2>
                  <div className="space-y-4">
                     {announcements.length === 0 ? <p className="text-gray-400 text-center py-4 text-sm">ยังไม่มีประกาศ</p> : 
                        announcements.map(a => (
                           <div key={a.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <h3 className="font-bold text-teal-900 text-sm mb-1">{a.title}</h3>
                              <p className="text-gray-600 text-xs mb-2 whitespace-pre-wrap">{a.content}</p>
                              {a.link && <a href={a.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-teal-600 hover:underline text-xs"><LinkIcon size={10}/> Link</a>}
                           </div>
                        ))
                     }
                  </div>
               </Card>
            </div>
        </div>
      </div>
   );
};

// --- Admin ---

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total: 0, core: 0, committee: 0 });
  const [yearInput, setYearInput] = useState('');

  useEffect(() => {
    getAllStudents().then(data => {
      setStats({
        total: data.length,
        core: data.filter(s => s.isCoreLeader).length,
        committee: data.filter(s => s.isCommittee).length
      });
    });
    getSystemSettings().then(s => {
       setYearInput(s.currentAcademicYear);
    });
  }, []);

  const handleUpdateYear = async () => {
     if(!window.confirm(`ยืนยันการเปลี่ยนปีการศึกษาเป็น ${yearInput}? (ระบบจะทำการรีโหลดหน้าเว็บ)`)) return;
     try {
       await saveSystemSettings({ currentAcademicYear: yearInput });
       alert("บันทึกปีการศึกษาเรียบร้อย");
       window.location.reload(); // Force reload to apply settings globally
     } catch (e) {
       alert("เกิดข้อผิดพลาดในการบันทึก");
     }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">ภาพรวมระบบ</h1>
      
      {/* Settings Card */}
      <Card className="border-l-4 border-blue-500 bg-gradient-to-r from-white to-blue-50">
         <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-blue-800"><Settings size={20}/> ตั้งค่าทั่วไป</h3>
         <div className="flex items-end gap-4">
            <div className="flex-1 max-w-xs">
               <label className="block text-sm font-medium text-gray-700 mb-1">ปีการศึกษาปัจจุบัน</label>
               <Input value={yearInput} onChange={e => setYearInput(e.target.value)} placeholder="เช่น 2567" />
            </div>
            <Button onClick={handleUpdateYear} variant="primary">บันทึก</Button>
         </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-lg shadow-blue-500/30 transform hover:-translate-y-1 transition">
           <h3 className="text-lg opacity-80 flex items-center gap-2"><Users size={20}/> นักเรียนทั้งหมด</h3>
           <p className="text-5xl font-bold mt-2">{stats.total}</p>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none shadow-lg shadow-indigo-500/30 transform hover:-translate-y-1 transition">
           <h3 className="text-lg opacity-80 flex items-center gap-2"><Award size={20}/> สมัครแกนนำ</h3>
           <p className="text-5xl font-bold mt-2">{stats.core}</p>
        </Card>
        <Card className="bg-gradient-to-br from-teal-600 to-teal-800 text-white border-none shadow-lg shadow-teal-500/30 transform hover:-translate-y-1 transition">
           <h3 className="text-lg opacity-80 flex items-center gap-2"><ShieldCheck size={20}/> สมัครกรรมการ</h3>
           <p className="text-5xl font-bold mt-2">{stats.committee}</p>
        </Card>
      </div>
    </div>
  );
};

const AdminManageModule: React.FC<{ type: 'CORE' | 'COMMITTEE'; configKey: string; title: string }> = ({ type, configKey, title }) => {
  const [config, setConfig] = useState<SystemConfig>({ key: configKey, isOpen: false });
  const [students, setStudents] = useState<StudentData[]>([]);
  const [filterGrade, setFilterGrade] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnounce, setNewAnnounce] = useState({ title: '', link: '', content: '' });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 40;

  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    getAnnouncements(type).then(setAnnouncements);
  }, [type, configKey]);

  const loadData = async () => {
    const cfg = await getSystemConfig(configKey);
    if (cfg) setConfig(cfg);
    const allSt = await getAllStudents();
    setStudents(allSt.filter(s => type === 'CORE' ? s.isCoreLeader : s.isCommittee));
  };

  const handleConfigSave = async () => {
    await saveSystemConfig(configKey, config);
    alert('บันทึกตั้งค่าเรียบร้อย');
  };

  const toggleAllowedGrade = (grade: GradeLevel) => {
    const current = config.allowedGrades || [];
    const updated = current.includes(grade) ? current.filter(g => g !== grade) : [...current, grade];
    setConfig({...config, allowedGrades: updated});
  };

  const handleDeleteApp = async (id: string) => {
    if(!window.confirm("ลบข้อมูลการสมัครนี้? (ข้อมูลนักเรียนจะไม่หาย)")) return;
    const field = type === 'CORE' ? { isCoreLeader: false, coreLeaderAppliedDate: null } : { isCommittee: false, committeeAppliedDate: null };
    // @ts-ignore
    await updateStudent(id, field);
    loadData();
  };

  const handleAddAnnounce = async () => {
    if(!newAnnounce.title) return;
    await addAnnouncement({ ...newAnnounce, category: type, date: new Date().toISOString() });
    setNewAnnounce({ title: '', link: '', content: '' });
    getAnnouncements(type).then(setAnnouncements);
  };

  const handleDeleteAnnounce = async (id: string) => {
    if(!window.confirm("ลบประกาศนี้?")) return;
    await deleteAnnouncement(id);
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  const exportImage = async () => {
     if(statsRef.current) {
        // Clone element to ensure full width capture regardless of overflow
        const element = statsRef.current;
        const clone = element.cloneNode(true) as HTMLElement;
        
        // Reset styles on clone to ensure full expansion and no scrollbars
        clone.style.position = 'fixed';
        clone.style.top = '-10000px';
        clone.style.left = '0';
        clone.style.width = 'max-content'; // Ensure full width
        clone.style.height = 'auto';
        clone.style.overflow = 'visible'; // Show all content
        clone.style.zIndex = '-1000';
        clone.style.background = 'white'; // Ensure background is white
        
        document.body.appendChild(clone);

        try {
            const canvas = await html2canvas(clone, { 
                scale: 2, // High resolution
                useCORS: true, // Allow cross-origin images
                windowWidth: clone.scrollWidth + 100, // Ensure ample width in virtual window
                windowHeight: clone.scrollHeight + 100,
            });
            
            const link = document.createElement('a');
            link.download = `statistics-${type}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Export failed", err);
            alert("บันทึกรูปภาพล้มเหลว");
        } finally {
            document.body.removeChild(clone);
        }
     }
  };

  const exportCSV = () => {
    const BOM = "\uFEFF";
    const header = "ID,Prefix,FirstName,LastName,Grade,Room,Date\n";
    const rows = students.map(s => {
      const date = type === 'CORE' ? s.coreLeaderAppliedDate : s.committeeAppliedDate;
      const formattedDate = date ? new Date(date).toLocaleDateString() : '-';
      return `${s.studentId},${s.prefix},${s.firstName},${s.lastName},${s.grade},${s.room},${formattedDate}`;
    }).join("\n");
    const csvContent = BOM + header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `export_${type.toLowerCase()}.csv`;
    link.click();
  };

  const filteredStudents = students.filter(s => 
    (!filterGrade || s.grade === filterGrade) &&
    (!filterRoom || s.room === filterRoom)
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  const renderStats = () => {
    const stats: Record<string, Record<string, number>> = {};
    students.forEach(s => {
       if(!stats[s.grade]) stats[s.grade] = {};
       if(!stats[s.grade][s.room]) stats[s.grade][s.room] = 0;
       stats[s.grade][s.room]++;
    });

    return (
      <Card className="mt-8 border-none shadow-lg">
        <div className="flex justify-between items-center mb-6">
           <h3 className="font-bold text-xl text-slate-800">สถิติการสมัครรายห้อง</h3>
           <div className="flex gap-2">
              <Button variant="outline" onClick={exportImage} className="flex items-center gap-2 text-sm"><ImageIcon size={16}/> ส่งออกรูปภาพ (เต็ม)</Button>
           </div>
        </div>
        
        {/* Wrapper for Capture */}
        <div className="overflow-x-auto bg-white p-8 rounded-xl border border-gray-100" ref={statsRef}>
          {/* Print Header */}
          <div className="mb-8 text-center border-b pb-4">
             <div className="flex items-center justify-center gap-4 mb-2">
                <img src="https://img5.pic.in.th/file/secure-sv1/IMG_25650953161d1c1bbdd8.jpeg" className="h-16 w-16 rounded-full" alt="Logo" />
                <div className="text-left">
                   <h2 className="text-2xl font-bold text-blue-900">โรงเรียนสตรีพัทลุง</h2>
                   <h3 className="text-lg text-gray-600">SPT Moral School System</h3>
                </div>
             </div>
             <h4 className="font-bold text-xl text-slate-800 mt-4">สรุปยอดผู้สมัคร: {title}</h4>
             <p className="text-sm text-gray-500">ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric'})}</p>
          </div>

          <table className="min-w-full text-sm text-left border-collapse border border-gray-300">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-3 border border-gray-300 text-slate-800 font-bold text-center w-20">ระดับชั้น</th>
                {ROOM_OPTIONS.map((r) => <th key={r} className="p-3 border border-gray-300 text-center text-slate-800 font-bold">ห้อง {r}</th>)}
                <th className="p-3 border border-gray-300 text-center text-slate-800 font-bold bg-slate-200">รวม</th>
              </tr>
            </thead>
            <tbody>
              {GRADE_OPTIONS.map(g => {
                let rowTotal = 0;
                return (
                  <tr key={g}>
                    <td className="p-3 font-bold bg-slate-50 border border-gray-300 text-slate-800 text-center">{g}</td>
                    {ROOM_OPTIONS.map(r => {
                      const count = stats[g]?.[r] || 0;
                      rowTotal += count;
                      const isFull = type === 'CORE' && config.quotaPerRoom && count >= config.quotaPerRoom;
                      return (
                        <td key={r} className={`p-3 text-center border border-gray-300 font-medium ${isFull ? 'text-green-700 bg-green-50' : 'text-slate-600'}`}>
                          {count}
                        </td>
                      );
                    })}
                    <td className="p-3 text-center border border-gray-300 font-bold bg-slate-100 text-blue-900">{rowTotal}</td>
                  </tr>
                )
              })}
              <tr className="bg-slate-800 text-white font-bold">
                 <td className="p-3 text-center border border-slate-700">รวมทั้งหมด</td>
                 <td colSpan={13} className="p-3 text-center border border-slate-700">{students.length} คน</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 text-xs text-right text-gray-400">สร้างโดยระบบสารสนเทศ โรงเรียนคุณธรรม สพฐ.</div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
      
      {/* Config & Announcement Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Config Card */}
        <Card className="border-none shadow-lg bg-gradient-to-r from-white to-slate-50 h-full">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-700"><Settings size={20}/> ตั้งค่าการรับสมัคร</h3>
          <div className="space-y-4">
              {type === 'CORE' && (
                <div>
                  <label className="block text-sm mb-1 text-slate-600 font-medium">โควต้าต่อห้อง (คน)</label>
                  <Input type="number" value={config.quotaPerRoom || 0} onChange={e => setConfig({...config, quotaPerRoom: parseInt(e.target.value)})} />
                </div>
              )}
              {type === 'COMMITTEE' && (
                <div>
                    <label className="block text-sm mb-2 text-slate-600 font-medium">ระดับชั้นที่สามารถสมัครได้</label>
                    <div className="flex flex-wrap gap-2">
                      {GRADE_OPTIONS.map(g => (
                          <button 
                            key={g}
                            onClick={() => toggleAllowedGrade(g)}
                            className={`px-3 py-1 rounded-full text-sm border transition ${config.allowedGrades?.includes(g) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}
                          >
                            {g}
                          </button>
                      ))}
                    </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <input type="checkbox" className="w-5 h-5 accent-blue-600" checked={config.isOpen} onChange={e => setConfig({...config, isOpen: e.target.checked})} />
                  <label className="font-medium text-slate-700">เปิดระบบรับสมัคร</label>
              </div>

               {/* Auto Dates */}
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-slate-600 font-medium">เปิดอัตโนมัติ</label>
                    <Input type="datetime-local" className="text-xs" value={config.openDate || ''} onChange={e => setConfig({...config, openDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-slate-600 font-medium">ปิดอัตโนมัติ</label>
                    <Input type="datetime-local" className="text-xs" value={config.closeDate || ''} onChange={e => setConfig({...config, closeDate: e.target.value})} />
                  </div>
              </div>

              <Button onClick={handleConfigSave} className="w-full">บันทึกการตั้งค่า</Button>
          </div>
        </Card>

        {/* Announcements Card */}
        <Card className="border-none shadow-lg h-full flex flex-col">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-700"><Megaphone size={20}/> เพิ่มประกาศ</h3>
            <div className="space-y-3 mb-4">
              <Input placeholder="หัวข้อประกาศ" value={newAnnounce.title} onChange={e => setNewAnnounce({...newAnnounce, title: e.target.value})} />
              <Input placeholder="ลิงก์เพิ่มเติม (ถ้ามี)" value={newAnnounce.link} onChange={e => setNewAnnounce({...newAnnounce, link: e.target.value})} />
              <textarea className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="รายละเอียด" value={newAnnounce.content} onChange={e => setNewAnnounce({...newAnnounce, content: e.target.value})} />
              <Button onClick={handleAddAnnounce} variant="secondary" className="w-full">โพสต์ประกาศ</Button>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-48 space-y-2 pr-2">
                {announcements.length === 0 ? <p className="text-gray-400 text-sm text-center py-4">ยังไม่มีประกาศ</p> : 
                  announcements.map(a => (
                      <div key={a.id} className="flex justify-between items-start p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">{a.title}</h4>
                            <p className="text-xs text-slate-500">{new Date(a.date).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => handleDeleteAnnounce(a.id!)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                      </div>
                  ))
                }
            </div>
        </Card>
      </div>

      <Card className="border-none shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
             <h3 className="font-bold text-xl text-slate-800">รายชื่อผู้สมัคร ({filteredStudents.length})</h3>
             <Button variant="outline" onClick={exportCSV} className="flex items-center gap-2 text-xs py-1 px-3 h-8"><Download size={14}/> Export CSV</Button>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <select className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none flex-1 md:flex-none" value={filterGrade} onChange={e => setFilterGrade(e.target.value)}>
                <option value="">ทุกระดับชั้น</option>
                {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none flex-1 md:flex-none" value={filterRoom} onChange={e => setFilterRoom(e.target.value)}>
                <option value="">ทุกห้อง</option>
                {ROOM_OPTIONS.map(r => <option key={r} value={r}>ห้อง {r}</option>)}
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10">
               <tr>
                 <th className="p-4 text-left font-bold text-slate-600 rounded-tl-lg">ชื่อ-สกุล</th>
                 <th className="p-4 text-left font-bold text-slate-600">ชั้น/ห้อง</th>
                 <th className="p-4 text-left font-bold text-slate-600 rounded-tr-lg">จัดการ</th>
               </tr>
            </thead>
            <tbody>
              {paginatedStudents.map(s => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-blue-50/50 transition">
                  <td className="p-4 text-slate-700 font-medium">{s.prefix}{s.firstName} {s.lastName}</td>
                  <td className="p-4 text-slate-600">{s.grade}/{s.room}</td>
                  <td className="p-4">
                    <button onClick={() => handleDeleteApp(s.id!)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
              {paginatedStudents.length === 0 && (
                <tr><td colSpan={3} className="p-6 text-center text-gray-500">ไม่มีข้อมูลผู้สมัคร</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
           <div className="flex justify-between items-center mt-6 border-t pt-4">
              <span className="text-sm text-gray-500">
                 แสดงหน้า {currentPage} จาก {totalPages} ({filteredStudents.length} รายการ)
              </span>
              <div className="flex gap-2">
                 <Button 
                   variant="outline" 
                   disabled={currentPage === 1} 
                   onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                   className="px-3 py-1 text-sm disabled:opacity-50"
                 >
                    <ChevronLeft size={16} /> ก่อนหน้า
                 </Button>
                 <Button 
                   variant="outline" 
                   disabled={currentPage === totalPages} 
                   onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                   className="px-3 py-1 text-sm disabled:opacity-50"
                 >
                    ถัดไป <ChevronRight size={16} />
                 </Button>
              </div>
           </div>
        )}
      </Card>
      {renderStats()}
    </div>
  );
};

const AdminStudents = () => {
   const [students, setStudents] = useState<StudentData[]>([]);
   const [searchTerm, setSearchTerm] = useState('');
   
   // Filters
   const [filterYear, setFilterYear] = useState('');
   const [filterGrade, setFilterGrade] = useState('');
   const [filterRoom, setFilterRoom] = useState('');

   // Edit Modal State
   const [editingStudent, setEditingStudent] = useState<StudentData | null>(null);

   useEffect(() => { 
     getAllStudents().then(setStudents); 
   }, []);
   
   const handleDeleteUser = async (id: string) => {
      if(!window.confirm("ยืนยันการลบผู้ใช้งานนี้? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;
      try {
        await deleteStudent(id);
        setStudents(students.filter(s => s.id !== id));
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการลบผู้ใช้งาน");
      }
   };

   const handleEditClick = (student: StudentData) => {
      setEditingStudent({ ...student });
   };

   const handleEditSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingStudent || !editingStudent.id) return;
      
      try {
        const { id, ...data } = editingStudent;
        // @ts-ignore - passing full object but updateStudent expects Partial
        await updateStudent(id, data);
        
        // Update local state
        setStudents(students.map(s => s.id === id ? editingStudent : s));
        setEditingStudent(null);
        alert("บันทึกข้อมูลเรียบร้อย");
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการแก้ไข");
      }
   };

   const filtered = students.filter(s => {
      const matchesSearch = (s.firstName + s.lastName).includes(searchTerm) || s.studentId.includes(searchTerm);
      const matchesYear = !filterYear || s.academicYear === filterYear;
      const matchesGrade = !filterGrade || s.grade === filterGrade;
      const matchesRoom = !filterRoom || s.room === filterRoom;
      return matchesSearch && matchesYear && matchesGrade && matchesRoom;
   });

   // Get unique academic years for filter
   const academicYears = Array.from(new Set(students.map(s => s.academicYear).filter(Boolean)));

   return (
     <div className="space-y-6">
       <div className="flex flex-col gap-4">
         <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-slate-800">ข้อมูลนักเรียน</h1>
         </div>
         
         {/* Filters Bar */}
         <Card className="border-none shadow-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="relative">
                 <Search className="absolute left-3 top-3 text-gray-400" size={18}/>
                 <Input placeholder="ค้นหา ชื่อ หรือ รหัส..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
               </div>
               <select className="border border-gray-300 rounded-lg px-3 py-2 bg-white" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                  <option value="">ทุกปีการศึกษา</option>
                  {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
               </select>
               <select className="border border-gray-300 rounded-lg px-3 py-2 bg-white" value={filterGrade} onChange={e => setFilterGrade(e.target.value)}>
                  <option value="">ทุกระดับชั้น</option>
                  {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
               </select>
               <select className="border border-gray-300 rounded-lg px-3 py-2 bg-white" value={filterRoom} onChange={e => setFilterRoom(e.target.value)}>
                  <option value="">ทุกห้อง</option>
                  {ROOM_OPTIONS.map(r => <option key={r} value={r}>ห้อง {r}</option>)}
               </select>
            </div>
         </Card>
       </div>

       <Card className="border-none shadow-lg">
         <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                   <th className="p-4 text-left font-bold text-slate-600 rounded-tl-lg">ID</th>
                   <th className="p-4 text-left font-bold text-slate-600">ชื่อ-สกุล</th>
                   <th className="p-4 text-left font-bold text-slate-600">ชั้น</th>
                   <th className="p-4 text-left font-bold text-slate-600">ปีการศึกษา</th>
                   <th className="p-4 text-left font-bold text-slate-600 rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="p-4 font-mono text-slate-600">{s.studentId}</td>
                    <td className="p-4 font-medium text-slate-700">{s.prefix}{s.firstName} {s.lastName}</td>
                    <td className="p-4 text-slate-600">{s.grade}/{s.room}</td>
                    <td className="p-4 text-slate-500">{s.academicYear || '-'}</td>
                    <td className="p-4 flex gap-2">
                       <button onClick={() => handleEditClick(s)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"><Edit3 size={18}/></button>
                       <button onClick={() => handleDeleteUser(s.id!)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-lg transition"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">ไม่พบข้อมูลนักเรียน</td></tr>}
              </tbody>
            </table>
         </div>
       </Card>

       {/* Edit Modal */}
       {editingStudent && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
               <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><UserCog/> แก้ไขข้อมูลนักเรียน</h2>
               <form onSubmit={handleEditSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">คำนำหน้า</label>
                        <Input value={editingStudent.prefix} onChange={e => setEditingStudent({...editingStudent, prefix: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">รหัสนักเรียน</label>
                        <Input disabled value={editingStudent.studentId} className="bg-gray-100" />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">ชื่อ</label>
                        <Input value={editingStudent.firstName} onChange={e => setEditingStudent({...editingStudent, firstName: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">นามสกุล</label>
                        <Input value={editingStudent.lastName} onChange={e => setEditingStudent({...editingStudent, lastName: e.target.value})} />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">ระดับชั้น</label>
                        <select className="w-full px-4 py-2 rounded-lg border border-gray-300" value={editingStudent.grade} onChange={(e) => setEditingStudent({...editingStudent, grade: e.target.value as GradeLevel})}>
                           {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">ห้อง</label>
                        <select className="w-full px-4 py-2 rounded-lg border border-gray-300" value={editingStudent.room} onChange={(e) => setEditingStudent({...editingStudent, room: e.target.value})}>
                           {ROOM_OPTIONS.map(r => <option key={r} value={r}>ห้อง {r}</option>)}
                        </select>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">เบอร์โทรศัพท์</label>
                        <Input value={editingStudent.phone} onChange={e => setEditingStudent({...editingStudent, phone: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">ปีการศึกษา</label>
                        <Input value={editingStudent.academicYear || ''} onChange={e => setEditingStudent({...editingStudent, academicYear: e.target.value})} placeholder="2567" />
                     </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                     <Button type="button" variant="secondary" onClick={() => setEditingStudent(null)} className="flex-1">ยกเลิก</Button>
                     <Button type="submit" className="flex-1">บันทึก</Button>
                  </div>
               </form>
            </Card>
         </div>
       )}
     </div>
   );
};

const AdminProject = () => {
   const [projects, setProjects] = useState<Project[]>([]);
   const [sysSettings, setSysSettings] = useState<SystemSettings>({ currentAcademicYear: '2567' });
   const [config, setConfig] = useState<SystemConfig>({ key: 'project', isOpen: false, externalLink: '' });
   const [announcements, setAnnouncements] = useState<Announcement[]>([]);
   const [newAnnounce, setNewAnnounce] = useState({ title: '', link: '', content: '' });

   useEffect(() => {
      getSystemSettings().then(s => {
         setSysSettings(s);
         getProjects(s.currentAcademicYear).then(setProjects);
      });
      getSystemConfig('project').then(c => c && setConfig(c));
      getAnnouncements('PROJECT').then(setAnnouncements);
   }, []);

   const handleDeleteProject = async (id: string) => {
      if(!window.confirm("ลบโครงงานนี้?")) return;
      await deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
   };

   const handleConfigSave = async () => {
      await saveSystemConfig('project', config);
      alert('บันทึกตั้งค่าโครงงานเรียบร้อย');
   };

   const handleAddAnnounce = async () => {
      if(!newAnnounce.title) return;
      await addAnnouncement({ ...newAnnounce, category: 'PROJECT', date: new Date().toISOString() });
      setNewAnnounce({ title: '', link: '', content: '' });
      getAnnouncements('PROJECT').then(setAnnouncements);
   };

   const handleDeleteAnnounce = async (id: string) => {
      if(!window.confirm("ลบประกาศนี้?")) return;
      await deleteAnnouncement(id);
      setAnnouncements(announcements.filter(a => a.id !== id));
   };

   return (
      <div className="space-y-8">
         <h1 className="text-3xl font-bold text-slate-800">จัดการโครงงาน (ปี {sysSettings.currentAcademicYear})</h1>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Settings Card */}
            <Card className="border-none shadow-lg h-full">
               <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-700"><Settings size={20}/> ตั้งค่าระบบ</h3>
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm mb-1 text-slate-600 font-medium">ลิงก์รับสมัครภายนอก (Google Form ฯลฯ)</label>
                     <Input placeholder="https://..." value={config.externalLink || ''} onChange={e => setConfig({...config, externalLink: e.target.value})} />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                     <input type="checkbox" className="w-5 h-5 accent-teal-600" checked={config.isOpen} onChange={e => setConfig({...config, isOpen: e.target.checked})} />
                     <label className="font-medium text-slate-700">เปิดรับสมัคร</label>
                  </div>
                  <Button onClick={handleConfigSave} className="w-full bg-teal-600 hover:bg-teal-700">บันทึกตั้งค่า</Button>
               </div>
            </Card>

            {/* Announcements Card */}
            <Card className="border-none shadow-lg h-full">
               <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-700"><Megaphone size={20}/> เพิ่มประกาศ</h3>
               <div className="space-y-3">
                  <Input placeholder="หัวข้อประกาศ" value={newAnnounce.title} onChange={e => setNewAnnounce({...newAnnounce, title: e.target.value})} />
                  <Input placeholder="ลิงก์เพิ่มเติม (ถ้ามี)" value={newAnnounce.link} onChange={e => setNewAnnounce({...newAnnounce, link: e.target.value})} />
                  <textarea className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" rows={2} placeholder="รายละเอียด" value={newAnnounce.content} onChange={e => setNewAnnounce({...newAnnounce, content: e.target.value})} />
                  <Button onClick={handleAddAnnounce} variant="secondary" className="w-full">โพสต์ประกาศ</Button>
               </div>
            </Card>
         </div>

         {/* Announcements List */}
         <Card className="border-none shadow-lg">
            <h3 className="font-bold text-lg mb-4 text-slate-700">ประกาศปัจจุบัน</h3>
            <div className="space-y-3">
               {announcements.length === 0 ? <p className="text-gray-400 text-sm">ยังไม่มีประกาศ</p> : 
                  announcements.map(a => (
                     <div key={a.id} className="flex justify-between items-start p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                           <h4 className="font-bold text-slate-800">{a.title}</h4>
                           <p className="text-xs text-slate-500">{new Date(a.date).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => handleDeleteAnnounce(a.id!)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                     </div>
                  ))
               }
            </div>
         </Card>

         <Card className="border-none shadow-lg">
            <h3 className="font-bold text-lg mb-4 text-slate-700">รายการโครงงานที่ส่งเข้ามา</h3>
            <div className="overflow-x-auto">
               <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                     <tr>
                        <th className="p-4 text-left font-bold text-slate-600 rounded-tl-lg">ห้อง</th>
                        <th className="p-4 text-left font-bold text-slate-600">ชื่อโครงงาน</th>
                        <th className="p-4 text-left font-bold text-slate-600">คุณธรรม</th>
                        <th className="p-4 text-left font-bold text-slate-600">สถานะ</th>
                        <th className="p-4 text-left font-bold text-slate-600 rounded-tr-lg">Action</th>
                     </tr>
                  </thead>
                  <tbody>
                     {projects.map(p => (
                        <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                           <td className="p-4 text-slate-700 font-bold">{p.grade}/{p.room}</td>
                           <td className="p-4 font-medium">{p.name}</td>
                           <td className="p-4 text-slate-600">{p.moralPrinciple}</td>
                           <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {p.status}
                              </span>
                           </td>
                           <td className="p-4">
                              <button onClick={() => handleDeleteProject(p.id!)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={18}/></button>
                           </td>
                        </tr>
                     ))}
                     {projects.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500">ไม่มีข้อมูลโครงงาน</td></tr>}
                  </tbody>
               </table>
            </div>
         </Card>
      </div>
   );
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/admin', label: 'ภาพรวมระบบ', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/core', label: 'จัดการแกนนำ', icon: <Users size={20} /> },
    { path: '/admin/committee', label: 'จัดการกรรมการ', icon: <Award size={20} /> },
    { path: '/admin/students', label: 'ข้อมูลนักเรียน', icon: <UserIcon size={20} /> },
    { path: '/admin/project', label: 'โครงงานคุณธรรม', icon: <FileText size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 h-screen w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-50 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
           <img className="h-10 w-auto rounded-full" src="https://img5.pic.in.th/file/secure-sv1/IMG_25650953161d1c1bbdd8.jpeg" alt="Logo" />
           <div>
             <h2 className="text-lg font-bold leading-tight">Admin Panel</h2>
             <p className="text-slate-400 text-xs">SPT Moral School</p>
           </div>
           <button className="md:hidden ml-auto text-slate-400" onClick={() => setSidebarOpen(false)}><X size={24}/></button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
           {menuItems.map(item => (
             <Link 
               key={item.path} 
               to={item.path}
               onClick={() => setSidebarOpen(false)}
               className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${location.pathname === item.path ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
             >
               {item.icon}
               <span className="font-medium">{item.label}</span>
               {location.pathname === item.path && <ChevronRight size={16} className="ml-auto opacity-50"/>}
             </Link>
           ))}
        </nav>
        
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur">
           <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-white hover:bg-red-500/20 w-full rounded-xl transition-colors">
             <LogOut size={20} />
             <span className="font-medium">ออกจากระบบ</span>
           </button>
        </div>
      </aside>
      
      <div className="flex-1 flex flex-col min-w-0">
         {/* Mobile Header */}
         <div className="md:hidden bg-white border-b p-4 flex justify-between items-center shadow-sm sticky top-0 z-30">
             <div className="flex items-center gap-2">
               <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg"><Menu size={24} className="text-slate-700"/></button>
               <span className="font-bold text-slate-800">Admin Panel</span>
             </div>
             <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-200">A</div>
         </div>
         
        <main className="flex-1 p-4 md:p-8 overflow-auto">
           {children}
        </main>
      </div>
    </div>
  );
};

// --- Routing Helper ---
function useNavigateWithHash() {
  const navigate = React.useMemo(() => {
    return (path: string) => {
      window.location.hash = path;
    };
  }, []);
  return navigate;
}

const ForceProfileUpdate = ({ 
  children, 
  currentUser, 
  role, 
  sysSettings 
}: { 
  children: React.ReactNode; 
  currentUser: StudentData | AdminUser | null; 
  role: UserRole | null; 
  sysSettings: SystemSettings 
}) => {
   if (role === UserRole.STUDENT && currentUser) {
      const s = currentUser as StudentData;
      if (s.academicYear !== sysSettings.currentAcademicYear) {
         return <Navigate to="/profile/edit" />;
      }
   }
   return <>{children}</>;
};

// --- Main App ---

const App = () => {
  const { currentUser, role, isLoading } = useAuth();
  const [sysSettings, setSysSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
     getSystemSettings().then(setSysSettings);
  }, []);

  if (isLoading || !sysSettings) return <div className="h-screen flex items-center justify-center text-blue-900 font-bold text-xl flex-col gap-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      กำลังโหลดข้อมูล...
    </div>;

  return (
    <HashRouter>
       <Routes>
         {/* Admin Routes */}
         {role === UserRole.ADMIN ? (
           <Route path="*" element={
             <AdminLayout>
               <Routes>
                 <Route path="/" element={<Navigate to="/admin" />} />
                 <Route path="/admin" element={<AdminDashboard />} />
                 <Route path="/admin/core" element={<AdminManageModule type="CORE" configKey="core_leader" title="จัดการนักเรียนแกนนำ" />} />
                 <Route path="/admin/committee" element={<AdminManageModule type="COMMITTEE" configKey="committee" title="จัดการคณะกรรมการนักเรียน" />} />
                 <Route path="/admin/students" element={<AdminStudents />} />
                 <Route path="/admin/project" element={<AdminProject />} />
               </Routes>
             </AdminLayout>
           } />
         ) : (
           /* Student/Public Routes */
           <Route path="*" element={
             <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
               <Navbar />
               <main className="flex-1">
                 <Routes>
                   <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/" />} />
                   <Route path="/register" element={!currentUser ? <RegisterPage /> : <Navigate to="/" />} />
                   
                   <Route path="/" element={currentUser ? <ForceProfileUpdate currentUser={currentUser} role={role} sysSettings={sysSettings}><StudentDashboard /></ForceProfileUpdate> : <Navigate to="/login" />} />
                   
                   {/* Profile Edit Route - Not wrapped in ForceProfileUpdate to allow access */}
                   <Route path="/profile/edit" element={currentUser ? <EditProfilePage /> : <Navigate to="/login" />} />
                   
                   <Route path="/core-leader" element={
                     currentUser ? 
                     <ForceProfileUpdate currentUser={currentUser} role={role} sysSettings={sysSettings}>
                        <ActivityPage 
                           type="CORE" 
                           title="นักเรียนแกนนำระดับห้องเรียน" 
                           configKey="core_leader" 
                           isApplied={(currentUser as StudentData).isCoreLeader}
                        /> 
                     </ForceProfileUpdate> : <Navigate to="/login" />
                   } />
                   
                   <Route path="/committee" element={
                     currentUser ? 
                     <ForceProfileUpdate currentUser={currentUser} role={role} sysSettings={sysSettings}>
                        <ActivityPage 
                           type="COMMITTEE" 
                           title="คณะกรรมการนักเรียนขับเคลื่อนโรงเรียนคุณธรรม" 
                           configKey="committee" 
                           isApplied={(currentUser as StudentData).isCommittee}
                           canApply={(currentUser as StudentData).isCoreLeader} 
                        />
                     </ForceProfileUpdate> : <Navigate to="/login" />
                   } />

                   <Route path="/project" element={currentUser ? <ForceProfileUpdate currentUser={currentUser} role={role} sysSettings={sysSettings}><ProjectPage /></ForceProfileUpdate> : <Navigate to="/login" />} />
                 </Routes>
               </main>
               <Footer />
             </div>
           } />
         )}
       </Routes>
    </HashRouter>
  );
};

export default App;