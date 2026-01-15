import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
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
  bulkDeleteApplications
} from './services/dataService';
import { UserRole, GradeLevel, ROOM_OPTIONS, GRADE_OPTIONS, StudentData, SystemConfig, Announcement } from './types';
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
  Filter
} from 'lucide-react';
import * as d3 from 'd3'; 

// --- Components ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'outline' }> = ({ className = '', variant = 'primary', ...props }) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg',
    secondary: 'bg-white text-blue-900 border border-gray-200 hover:bg-gray-50',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  };
  return (
    <button className={`px-4 py-2 rounded-full transition-all duration-300 font-medium ${variants[variant]} ${className}`} {...props} />
  );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm transition-all ${className}`} {...props} />
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

const Navbar = () => {
  const { currentUser, role, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <img className="h-10 w-auto rounded-full" src="https://img5.pic.in.th/file/secure-sv1/IMG_25650953161d1c1bbdd8.jpeg" alt="Logo" />
              <span className="font-bold text-xl text-blue-900 hidden md:block">SPT Moral School</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <>
                <span className="text-gray-600 text-sm">
                  {role === UserRole.STUDENT 
                    ? `สวัสดี, ${(currentUser as StudentData).firstName}` 
                    : 'Administrator'}
                </span>
                <Button variant="secondary" onClick={logout} className="flex items-center gap-2 text-sm py-1">
                  <LogOut size={16} /> ออกจากระบบ
                </Button>
              </>
            ) : (
               <Link to="/login"><Button variant="primary">เข้าสู่ระบบ</Button></Link>
            )}
          </div>
          <div className="md:hidden flex items-center">
             <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-blue-600">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-2">
           {currentUser ? (
             <button onClick={logout} className="w-full text-left px-4 py-2 text-red-600 font-medium">ออกจากระบบ</button>
           ) : (
             <Link to="/login" className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg">เข้าสู่ระบบ</Link>
           )}
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-blue-900 text-white pt-10 pb-6 mt-12">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="text-lg font-bold mb-4">SPT Moral School</h3>
        <p className="text-blue-200 text-sm">
          โรงเรียนคุณธรรม สพฐ. โรงเรียนสตรีพัทลุง<br/>
          มุ่งเน้นพัฒนาเยาวชนไทยสู่ความเป็นเลิศด้านคุณธรรม
        </p>
      </div>
      <div>
        <h3 className="text-lg font-bold mb-4">ลิงก์ที่สำคัญ</h3>
        <ul className="space-y-2 text-sm text-blue-200">
           <li><a href="https://spt-moral-school.github.io/#policy" className="hover:text-white transition">นโยบายความเป็นส่วนตัว</a></li>
           <li><a href="https://spt-moral-school.github.io/#terms" className="hover:text-white transition">ข้อกำหนดการใช้งาน</a></li>
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-bold mb-4">ข้อมูลติดต่อ</h3>
        <ul className="space-y-2 text-sm text-blue-200">
          <li>Email: sptmorral@spt.ac.th</li>
          <li className="flex gap-4 mt-4">
             <a href="https://www.facebook.com/sptmoralschool" target="_blank" rel="noreferrer">FB</a>
             <a href="https://www.instagram.com/spt_moral_school/" target="_blank" rel="noreferrer">IG</a>
             <a href="https://www.tiktok.com/@spt.moral.school" target="_blank" rel="noreferrer">TikTok</a>
          </li>
        </ul>
      </div>
    </div>
    <div className="border-t border-blue-800 mt-8 pt-6 text-center text-blue-300 text-xs">
      &copy; 2024 SPT Moral School - โรงเรียนคุณธรรม สพฐ. โรงเรียนสตรีพัทลุง | All Rights Reserved.
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
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">เข้าสู่ระบบ</h2>
        
        <div className="flex bg-gray-100 rounded-full p-1 mb-8">
          <button 
            className={`flex-1 py-2 rounded-full text-sm font-medium transition ${activeTab === 'student' ? 'bg-white shadow text-blue-900' : 'text-gray-500'}`}
            onClick={() => { setActiveTab('student'); setError(''); }}
          >
            นักเรียน
          </button>
          <button 
            className={`flex-1 py-2 rounded-full text-sm font-medium transition ${activeTab === 'admin' ? 'bg-white shadow text-blue-900' : 'text-gray-500'}`}
            onClick={() => { setActiveTab('admin'); setError(''); }}
          >
            ผู้ดูแลระบบ
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}

        {activeTab === 'student' ? (
          <form onSubmit={handleStudentLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เลขประจำตัวนักเรียน</label>
              <Input type="text" value={id} onChange={(e) => setId(e.target.value)} required placeholder="เช่น 12345" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
              <Input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="08XXXXXXXX" />
            </div>
            <Button type="submit" className="w-full mt-2">เข้าสู่ระบบ</Button>
            <div className="text-center mt-4 text-sm">
              ยังไม่มีบัญชี? <Link to="/register" className="text-blue-600 hover:underline">สมัครสมาชิก</Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full mt-2">เข้าสู่ระบบผู้ดูแล</Button>
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
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-8">สมัครสมาชิก</h2>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">เลขประจำตัวนักเรียน</label>
            <Input required value={form.studentId} onChange={(e) => setForm({...form, studentId: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คำนำหน้า</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={form.prefix}
              onChange={(e) => setForm({...form, prefix: e.target.value})}
            >
              <option>เด็กชาย</option>
              <option>เด็กหญิง</option>
              <option>นาย</option>
              <option>นางสาว</option>
            </select>
          </div>
          
          <div></div> 

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
            <Input required value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
            <Input required value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ระดับชั้น</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={form.grade}
              onChange={(e) => setForm({...form, grade: e.target.value as GradeLevel})}
            >
              {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ห้อง</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={form.room}
              onChange={(e) => setForm({...form, room: e.target.value})}
            >
              {ROOM_OPTIONS.map(r => <option key={r} value={r}>ห้อง {r}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ (ใช้สำหรับเข้าสู่ระบบ)</label>
            <Input required value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="08XXXXXXXX" />
          </div>

          <div className="md:col-span-2 pt-4">
             <Button type="submit" className="w-full">ลงทะเบียน</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const StudentDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-4">ยินดีต้อนรับสู่ระบบ SPT Moral School</h1>
        <p className="text-lg text-gray-600">เลือกเมนูที่ต้องการใช้งาน</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link to="/core-leader">
          <Card className="h-full hover:shadow-2xl transition duration-300 flex flex-col items-center text-center p-8 group cursor-pointer border-t-4 border-blue-500">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">นักเรียนแกนนำ<br/>ระดับห้องเรียน</h3>
            <p className="text-gray-500 text-sm mt-auto">สมัครและติดตามข่าวสารสำหรับตัวแทนห้องเรียน</p>
          </Card>
        </Link>

        <Link to="/committee">
          <Card className="h-full hover:shadow-2xl transition duration-300 flex flex-col items-center text-center p-8 group cursor-pointer border-t-4 border-indigo-500">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <Award size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">คณะกรรมการนักเรียน<br/>ขับเคลื่อนโรงเรียนคุณธรรม</h3>
            <p className="text-gray-500 text-sm mt-auto">สำหรับนักเรียนแกนนำที่ต้องการขับเคลื่อนระดับโรงเรียน</p>
          </Card>
        </Link>

        <Link to="/project">
          <Card className="h-full hover:shadow-2xl transition duration-300 flex flex-col items-center text-center p-8 group cursor-pointer border-t-4 border-teal-500">
            <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">๑ ห้องเรียน<br/>๑ โครงงานคุณธรรม</h3>
            <p className="text-gray-500 text-sm mt-auto">ส่งโครงงานและติดตามผลการประกวด</p>
          </Card>
        </Link>
      </div>
    </div>
  );
};

// Generic Page for Core Leader / Committee
const ActivityPage: React.FC<{
  type: 'CORE' | 'COMMITTEE';
  title: string;
  configKey: string;
  isApplied: boolean;
  canApply?: boolean;
}> = ({ type, title, configKey, isApplied, canApply = true }) => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const { currentUser, loginAsStudent } = useAuth(); // Need loginAsStudent to refresh context
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSystemConfig(configKey).then(setConfig);
    getAnnouncements(type).then(setAnnouncements);
  }, [configKey, type]);

  const handleApply = async () => {
    if (!window.confirm("ยืนยันการสมัคร?")) return;
    setLoading(true);
    try {
      if (currentUser?.id) {
        // Validation for Core Leader Quota
        if (type === 'CORE' && config?.quotaPerRoom) {
          const allStudents = await getAllStudents();
          const currentCount = allStudents.filter(s => 
            s.isCoreLeader && 
            s.grade === (currentUser as StudentData).grade && 
            s.room === (currentUser as StudentData).room
          ).length;
          
          if (currentCount >= config.quotaPerRoom) {
            alert('ห้องเรียนนี้สมัครเต็มจำนวนแล้ว');
            setLoading(false);
            return;
          }
        }

        const field = type === 'CORE' ? { isCoreLeader: true, coreLeaderAppliedDate: new Date().toISOString() } : { isCommittee: true, committeeAppliedDate: new Date().toISOString() };
        await updateStudent(currentUser.id, field);
        // Refresh local user data
        loginAsStudent({ ...currentUser as StudentData, ...field });
        alert("สมัครสำเร็จ!");
      }
    } catch (e) {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const isSystemOpen = () => {
    if (!config?.isOpen) return false;
    if (config.openDate && config.closeDate) {
      const now = new Date();
      return now >= new Date(config.openDate) && now <= new Date(config.closeDate);
    }
    return true;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
             <div className="relative z-10">
               <h1 className="text-3xl font-bold mb-2">{title}</h1>
               <p className="opacity-90">ติดตามข่าวสารและสมัครเข้าร่วมกิจกรรม</p>
             </div>
             <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-12"></div>
          </div>

          <div className="space-y-4">
             <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
               <span className="w-1 h-6 bg-blue-600 rounded-full"></span> ประกาศ
             </h3>
             {announcements.length === 0 ? <p className="text-gray-500">ไม่มีประกาศขณะนี้</p> : (
               announcements.map(a => (
                 <Card key={a.id} className="p-4 hover:bg-gray-50 transition border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg text-blue-900">{a.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{new Date(a.date).toLocaleDateString('th-TH')}</p>
                        {a.content && <p className="mt-2 text-gray-700">{a.content}</p>}
                      </div>
                      {a.link && (
                        <a href={a.link} target="_blank" rel="noreferrer">
                          <Button variant="outline" className="text-sm">ดูรายละเอียด</Button>
                        </a>
                      )}
                    </div>
                 </Card>
               ))
             )}
          </div>
        </div>

        <div className="md:w-1/3">
          <Card className="sticky top-24">
            <h3 className="text-xl font-bold mb-4">สถานะการสมัคร</h3>
            
            <div className="space-y-4">
              {isApplied ? (
                <div className="bg-green-100 text-green-700 p-4 rounded-lg text-center font-bold">
                   คุณสมัครเรียบร้อยแล้ว
                </div>
              ) : (
                 <>
                   {!canApply ? (
                      <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg text-center text-sm">
                        คุณไม่มีสิทธิ์สมัคร (เฉพาะนักเรียนแกนนำเท่านั้น หรือเงื่อนไขไม่ผ่าน)
                      </div>
                   ) : (
                     isSystemOpen() ? (
                        <Button onClick={handleApply} disabled={loading} className="w-full py-3 text-lg">
                          {loading ? 'กำลังบันทึก...' : 'สมัครเข้าร่วม'}
                        </Button>
                     ) : (
                        <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
                          ระบบปิดรับสมัคร
                        </div>
                     )
                   )}
                 </>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t">
               <h4 className="font-bold text-sm text-gray-500 mb-2">กำหนดการ</h4>
               {config?.openDate && (
                 <p className="text-sm text-gray-600">เปิด: {new Date(config.openDate).toLocaleString('th-TH')}</p>
               )}
               {config?.closeDate && (
                 <p className="text-sm text-gray-600">ปิด: {new Date(config.closeDate).toLocaleString('th-TH')}</p>
               )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ProjectPage = () => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    getSystemConfig('project').then(setConfig);
    getAnnouncements('PROJECT').then(setAnnouncements);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-teal-700 rounded-2xl p-8 text-white shadow-xl mb-8">
         <h1 className="text-3xl font-bold mb-2">๑ ห้องเรียน ๑ โครงงานคุณธรรม</h1>
         <p className="opacity-90">ส่งเสริมคุณธรรม จริยธรรม ผ่านโครงงานระดับห้องเรียน</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
           <h3 className="text-xl font-bold text-gray-800">ประกาศและผลการคัดเลือก</h3>
           {announcements.length === 0 ? <p className="text-gray-500">ไม่มีประกาศ</p> : 
             announcements.map(a => (
                <Card key={a.id} className="p-4 border-l-4 border-l-teal-500">
                  <h4 className="font-bold text-lg">{a.title}</h4>
                  <p className="text-sm text-gray-500">{new Date(a.date).toLocaleDateString('th-TH')}</p>
                  {a.link && <a href={a.link} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline mt-2 block">คลิกเพื่อดูรายละเอียด</a>}
                </Card>
             ))
           }
        </div>
        <div>
           <Card>
              <h3 className="font-bold mb-4">เมนูสมัคร</h3>
              {config?.externalLink ? (
                <a href={config.externalLink} target="_blank" rel="noreferrer">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700">ไปยังระบบรับสมัครโครงงาน</Button>
                </a>
              ) : (
                <div className="text-center text-gray-500 p-4 bg-gray-100 rounded">ยังไม่เปิดรับสมัคร</div>
              )}
           </Card>
        </div>
      </div>
    </div>
  );
};

// --- Admin Section ---

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth();
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-blue-900 text-white hidden md:flex flex-col">
        <div className="p-6 font-bold text-xl border-b border-blue-800">Admin Panel</div>
        <nav className="flex-1 p-4 space-y-2">
           <Link to="/admin" className="block px-4 py-2 hover:bg-blue-800 rounded">หน้าหลัก</Link>
           <Link to="/admin/students" className="block px-4 py-2 hover:bg-blue-800 rounded">ข้อมูลนักเรียน</Link>
           <Link to="/admin/core" className="block px-4 py-2 hover:bg-blue-800 rounded">จัดการ นร. แกนนำ</Link>
           <Link to="/admin/committee" className="block px-4 py-2 hover:bg-blue-800 rounded">จัดการ กก. นักเรียน</Link>
           <Link to="/admin/project" className="block px-4 py-2 hover:bg-blue-800 rounded">จัดการ โครงงาน</Link>
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button onClick={logout} className="flex items-center gap-2 text-red-200 hover:text-white">
            <LogOut size={16} /> ออกจากระบบ
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">
         {children}
      </main>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total: 0, core: 0, committee: 0 });
  useEffect(() => {
    getAllStudents().then(data => {
      setStats({
        total: data.length,
        core: data.filter(s => s.isCoreLeader).length,
        committee: data.filter(s => s.isCommittee).length
      });
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">ภาพรวมระบบ</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-500 text-white border-none">
           <h3 className="text-lg opacity-90">นักเรียนทั้งหมด</h3>
           <p className="text-4xl font-bold mt-2">{stats.total}</p>
        </Card>
        <Card className="bg-indigo-500 text-white border-none">
           <h3 className="text-lg opacity-90">สมัครแกนนำแล้ว</h3>
           <p className="text-4xl font-bold mt-2">{stats.core}</p>
        </Card>
        <Card className="bg-teal-500 text-white border-none">
           <h3 className="text-lg opacity-90">สมัครกรรมการแล้ว</h3>
           <p className="text-4xl font-bold mt-2">{stats.committee}</p>
        </Card>
      </div>
    </div>
  );
};

const AdminManageModule: React.FC<{
  type: 'CORE' | 'COMMITTEE';
  configKey: string;
  title: string;
}> = ({ type, configKey, title }) => {
  const [config, setConfig] = useState<SystemConfig>({ key: configKey, isOpen: false });
  const [students, setStudents] = useState<StudentData[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnounce, setNewAnnounce] = useState({ title: '', link: '', content: '' });

  // Filter states
  const [filterGrade, setFilterGrade] = useState('');
  
  useEffect(() => {
    loadData();
  }, [type, configKey]);

  const loadData = async () => {
    const cfg = await getSystemConfig(configKey);
    if (cfg) setConfig(cfg);
    
    const allSt = await getAllStudents();
    setStudents(allSt.filter(s => type === 'CORE' ? s.isCoreLeader : s.isCommittee));
    
    const anns = await getAnnouncements(type);
    setAnnouncements(anns);
  };

  const handleConfigSave = async () => {
    await saveSystemConfig(configKey, config);
    alert('บันทึกตั้งค่าเรียบร้อย');
  };

  const handleAddAnnounce = async () => {
    if(!newAnnounce.title) return;
    await addAnnouncement({ ...newAnnounce, category: type, date: new Date().toISOString() });
    setNewAnnounce({ title: '', link: '', content: '' });
    loadData();
  };

  const handleDeleteApp = async (id: string) => {
    if(!window.confirm("ลบข้อมูลการสมัครนี้? (ข้อมูลนักเรียนจะไม่หาย)")) return;
    const field = type === 'CORE' ? { isCoreLeader: false, coreLeaderAppliedDate: null } : { isCommittee: false, committeeAppliedDate: null };
    // @ts-ignore
    await updateStudent(id, field);
    loadData();
  };

  const handleBulkDelete = async () => {
     if(!window.confirm(`ต้องการลบข้อมูลการสมัคร ${title} ทั้งหมดหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`)) return;
     const field = type === 'CORE' ? 'isCoreLeader' : 'isCommittee';
     await bulkDeleteApplications(field);
     loadData();
     alert("ลบข้อมูลทั้งหมดเรียบร้อย");
  };

  // Stats for Core Leader (Per Room)
  const renderCoreStats = () => {
    if (type !== 'CORE') return null;
    // Group by Grade -> Room
    const stats: Record<string, Record<string, number>> = {};
    students.forEach(s => {
       if(!stats[s.grade]) stats[s.grade] = {};
       if(!stats[s.grade][s.room]) stats[s.grade][s.room] = 0;
       stats[s.grade][s.room]++;
    });

    return (
      <Card className="mt-8">
        <h3 className="font-bold text-lg mb-4">สถิติการสมัครรายห้อง (โควต้า: {config.quotaPerRoom || '-'})</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">ระดับชั้น</th>
                {ROOM_OPTIONS.map(r => <th key={r} className="p-2">ห้อง {r}</th>)}
              </tr>
            </thead>
            <tbody>
              {GRADE_OPTIONS.map(g => (
                <tr key={g} className="border-b">
                   <td className="p-2 font-bold">{g}</td>
                   {ROOM_OPTIONS.map(r => {
                     const count = stats[g]?.[r] || 0;
                     const missing = (config.quotaPerRoom || 0) - count;
                     return (
                       <td key={r} className={`p-2 ${missing > 0 ? 'text-red-500' : 'text-green-600'}`}>
                         {count} {missing > 0 ? `(ขาด ${missing})` : '✓'}
                       </td>
                     );
                   })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  const filteredStudents = students.filter(s => !filterGrade || s.grade === filterGrade);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{title}</h1>
      
      {/* Config Section */}
      <Card>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Settings size={20}/> ตั้งค่าระบบ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <input type="checkbox" className="w-5 h-5" checked={config.isOpen} onChange={e => setConfig({...config, isOpen: e.target.checked})} />
                <label className="font-medium">เปิดรับสมัครทันที</label>
             </div>
             <div>
               <label className="block text-sm mb-1">เปิดอัตโนมัติเมื่อ</label>
               <Input type="datetime-local" value={config.openDate || ''} onChange={e => setConfig({...config, openDate: e.target.value})} />
             </div>
             <div>
               <label className="block text-sm mb-1">ปิดอัตโนมัติเมื่อ</label>
               <Input type="datetime-local" value={config.closeDate || ''} onChange={e => setConfig({...config, closeDate: e.target.value})} />
             </div>
          </div>
          <div className="space-y-4">
            {type === 'CORE' && (
              <div>
                 <label className="block text-sm mb-1">โควต้าต่อห้อง (คน)</label>
                 <Input type="number" value={config.quotaPerRoom || 0} onChange={e => setConfig({...config, quotaPerRoom: parseInt(e.target.value)})} />
              </div>
            )}
            <Button onClick={handleConfigSave}>บันทึกตั้งค่า</Button>
          </div>
        </div>
      </Card>

      {/* Announcements */}
      <Card>
        <h3 className="font-bold text-lg mb-4">ประกาศ</h3>
        <div className="grid gap-4 mb-4">
           <Input placeholder="หัวข้อประกาศ" value={newAnnounce.title} onChange={e => setNewAnnounce({...newAnnounce, title: e.target.value})} />
           <Input placeholder="ลิงก์ (ถ้ามี)" value={newAnnounce.link} onChange={e => setNewAnnounce({...newAnnounce, link: e.target.value})} />
           <textarea className="w-full border rounded p-2" rows={3} placeholder="รายละเอียด" value={newAnnounce.content} onChange={e => setNewAnnounce({...newAnnounce, content: e.target.value})} />
           <Button onClick={handleAddAnnounce} variant="secondary">เพิ่มประกาศ</Button>
        </div>
      </Card>

      {/* List */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">รายชื่อผู้สมัคร ({students.length})</h3>
          <div className="flex gap-2">
             <select className="border rounded px-2" value={filterGrade} onChange={e => setFilterGrade(e.target.value)}>
                <option value="">ทุกระดับชั้น</option>
                {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
             </select>
             <Button variant="danger" className="text-sm px-2" onClick={handleBulkDelete}><Trash2 size={16}/> ล้างทั้งหมด</Button>
          </div>
        </div>
        
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
               <tr>
                 <th className="p-3 text-left">ID</th>
                 <th className="p-3 text-left">ชื่อ-สกุล</th>
                 <th className="p-3 text-left">ชั้น/ห้อง</th>
                 <th className="p-3 text-left">วันที่สมัคร</th>
                 <th className="p-3 text-left">Action</th>
               </tr>
            </thead>
            <tbody>
              {filteredStudents.map(s => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{s.studentId}</td>
                  <td className="p-3">{s.prefix} {s.firstName} {s.lastName}</td>
                  <td className="p-3">{s.grade}/{s.room}</td>
                  <td className="p-3">{new Date(type === 'CORE' ? s.coreLeaderAppliedDate! : s.committeeAppliedDate!).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button onClick={() => handleDeleteApp(s.id!)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {renderCoreStats()}
    </div>
  );
};

const AdminStudents = () => {
   const [students, setStudents] = useState<StudentData[]>([]);
   useEffect(() => { getAllStudents().then(setStudents); }, []);
   
   // Simple manual add would go here, omitting for brevity in favor of "Handful of files" constraint
   // Logic is similar to Register page.

   return (
     <div className="space-y-6">
       <h1 className="text-2xl font-bold">ข้อมูลนักเรียนทั้งหมด</h1>
       <Card>
         <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                   <th className="p-2 text-left">ID</th>
                   <th className="p-2 text-left">ชื่อ-สกุล</th>
                   <th className="p-2 text-left">ชั้น</th>
                   <th className="p-2 text-left">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-b">
                    <td className="p-2">{s.studentId}</td>
                    <td className="p-2">{s.prefix} {s.firstName} {s.lastName}</td>
                    <td className="p-2">{s.grade}/{s.room}</td>
                    <td className="p-2 space-x-1">
                      {s.isCoreLeader && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">แกนนำ</span>}
                      {s.isCommittee && <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">กก.</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>
       </Card>
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

// --- Main App ---

const App = () => {
  const { currentUser, role, isLoading } = useAuth();

  if (isLoading) return <div className="h-screen flex items-center justify-center text-blue-600">Loading...</div>;

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
                 {/* Project management simplified reuse or specific component */}
                 <Route path="/admin/project" element={<div className="p-4">จัดการโครงงาน (ใช้ logic เดียวกับประกาศ)</div>} />
               </Routes>
             </AdminLayout>
           } />
         ) : (
           /* Student/Public Routes */
           <Route path="*" element={
             <div className="min-h-screen flex flex-col">
               <Navbar />
               <main className="flex-1">
                 <Routes>
                   <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/" />} />
                   <Route path="/register" element={!currentUser ? <RegisterPage /> : <Navigate to="/" />} />
                   
                   <Route path="/" element={currentUser ? <StudentDashboard /> : <Navigate to="/login" />} />
                   
                   <Route path="/core-leader" element={
                     currentUser ? 
                     <ActivityPage 
                        type="CORE" 
                        title="นักเรียนแกนนำระดับห้องเรียน" 
                        configKey="core_leader" 
                        isApplied={(currentUser as StudentData).isCoreLeader}
                     /> : <Navigate to="/login" />
                   } />
                   
                   <Route path="/committee" element={
                     currentUser ? 
                     <ActivityPage 
                        type="COMMITTEE" 
                        title="คณะกรรมการนักเรียนขับเคลื่อนโรงเรียนคุณธรรม" 
                        configKey="committee" 
                        isApplied={(currentUser as StudentData).isCommittee}
                        canApply={(currentUser as StudentData).isCoreLeader} 
                     /> : <Navigate to="/login" />
                   } />

                   <Route path="/project" element={currentUser ? <ProjectPage /> : <Navigate to="/login" />} />
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