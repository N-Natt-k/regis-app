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
  getStudentByStdId,
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
  ChevronLeft,
  PlusCircle,
  Upload
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
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setIsOpen(false);
    navigate('/login');
  };

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
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    {role === UserRole.STUDENT && (
                      <>
                        <Link to="/core-leader" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors" onClick={() => setDropdownOpen(false)}>
                           <Users size={16} className="mr-3"/> นักเรียนแกนนำ
                        </Link>
                        <Link to="/committee" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors" onClick={() => setDropdownOpen(false)}>
                           <Award size={16} className="mr-3"/> คณะกรรมการนักเรียน
                        </Link>
                        <Link to="/project" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors" onClick={() => setDropdownOpen(false)}>
                           <FileText size={16} className="mr-3"/> โครงงานคุณธรรม
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <Link 
                          to="/profile/edit" 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <UserCog size={16} className="mr-3" />
                          แก้ไขข้อมูลส่วนตัว
                        </Link>
                      </>
                    )}
                    <button 
                      onClick={handleLogout}
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
                    <>
                      <Link to="/core-leader" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"><Users size={20} className="mr-3 text-blue-600"/> นักเรียนแกนนำ</Link>
                      <Link to="/committee" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"><Award size={20} className="mr-3 text-indigo-600"/> คณะกรรมการนักเรียน</Link>
                      <Link to="/project" onClick={() => setIsOpen(false)} className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"><FileText size={20} className="mr-3 text-teal-600"/> โครงงานคุณธรรม</Link>
                      <div className="border-t border-gray-100 my-2"></div>
                      <Link 
                        to="/profile/edit" 
                        onClick={() => setIsOpen(false)} 
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                      >
                          <UserCog size={20} className="mr-3 text-blue-600"/> แก้ไขข้อมูลส่วนตัว
                      </Link>
                    </>
                  )}
                  
                  <button 
                    onClick={handleLogout} 
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
  <footer className="bg-white border-t border-gray-200 py-8 mt-12">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <p className="text-gray-500 text-sm">© {new Date().getFullYear()} SPT Moral School. All rights reserved.</p>
      <p className="text-gray-400 text-xs mt-2">โรงเรียนสตรีพัทลุง</p>
    </div>
  </footer>
);

// --- Auth Pages ---

const LoginPage = () => {
  const { loginAsStudent } = useAuth();
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const student = await loginStudent(studentId, phone);
      if (student) {
        loginAsStudent(student);
      } else {
        setError('ไม่พบข้อมูล หรือ เบอร์โทรศัพท์ไม่ถูกต้อง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <Card className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">เข้าสู่ระบบ</h2>
          <p className="mt-2 text-sm text-gray-600">ระบบสารสนเทศโรงเรียนคุณธรรม</p>
        </div>
        
        <div className="flex border-b border-gray-200">
           <button onClick={() => {setActiveTab('student'); setError('');}} className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'student' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>นักเรียน</button>
           <button onClick={() => {setActiveTab('admin'); setError('');}} className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'admin' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>ผู้ดูแลระบบ</button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">{error}</div>}

        {activeTab === 'student' ? (
          <form className="mt-8 space-y-6" onSubmit={handleStudentLogin}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">รหัสนักเรียน</label>
                <Input required value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="กรอกรหัสนักเรียน" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">เบอร์โทรศัพท์ (ที่ลงทะเบียน)</label>
                <Input required value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="กรอกเบอร์โทรศัพท์" />
              </div>
            </div>
            <Button type="submit" className="w-full">เข้าสู่ระบบ</Button>
            <div className="text-center text-sm">
               ยังไม่มีบัญชี? <Link to="/register" className="text-blue-600 font-medium hover:underline">ลงทะเบียน</Link>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleAdminLogin}>
             <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input required value={email} onChange={e => setEmail(e.target.value)} type="email" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Input required value={password} onChange={e => setPassword(e.target.value)} type="password" />
              </div>
            </div>
            <Button type="submit" className="w-full">Admin Login</Button>
          </form>
        )}
      </Card>
    </div>
  );
};

const RegisterPage = () => {
  const { loginAsStudent } = useAuth();
  const [formData, setFormData] = useState({
    studentId: '', prefix: 'ด.ช.', firstName: '', lastName: '', grade: GradeLevel.M1, room: '1', phone: ''
  });
  const [sysSettings, setSysSettings] = useState<SystemSettings | null>(null);

  useEffect(() => { getSystemSettings().then(setSysSettings); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sysSettings) return;
    try {
      await registerStudent({ ...formData, academicYear: sysSettings.currentAcademicYear });
      const user = await loginStudent(formData.studentId, formData.phone);
      if (user) loginAsStudent(user);
    } catch (err: any) {
      alert(err.message || 'ลงทะเบียนไม่สำเร็จ');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] py-12 px-4 bg-slate-50 flex justify-center items-center">
       <Card className="max-w-lg w-full p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">ลงทะเบียนนักเรียนใหม่</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold mb-1">รหัสนักเรียน</label><Input required value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} /></div>
                <div>
                   <label className="block text-sm font-bold mb-1">คำนำหน้า</label>
                   <select className="w-full px-4 py-2 rounded-lg border border-gray-300" value={formData.prefix} onChange={e => setFormData({...formData, prefix: e.target.value})}>
                      <option value="ด.ช.">ด.ช.</option><option value="ด.ญ.">ด.ญ.</option><option value="นาย">นาย</option><option value="นางสาว">นางสาว</option>
                   </select>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold mb-1">ชื่อ</label><Input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} /></div>
                <div><label className="block text-sm font-bold mb-1">นามสกุล</label><Input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} /></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-bold mb-1">ชั้น</label>
                   <select className="w-full px-4 py-2 rounded-lg border border-gray-300" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value as GradeLevel})}>
                      {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-bold mb-1">ห้อง</label>
                   <select className="w-full px-4 py-2 rounded-lg border border-gray-300" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})}>
                      {ROOM_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                   </select>
                </div>
             </div>
             <div><label className="block text-sm font-bold mb-1">เบอร์โทรศัพท์</label><Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
             
             <Button type="submit" className="w-full mt-4">ลงทะเบียน</Button>
             <div className="text-center text-sm mt-4">
               มีบัญชีแล้ว? <Link to="/login" className="text-blue-600 font-medium hover:underline">เข้าสู่ระบบ</Link>
            </div>
          </form>
       </Card>
    </div>
  );
};

const EditProfilePage = () => {
   const { currentUser, updateProfile } = useAuth();
   const [form, setForm] = useState<Partial<StudentData>>({});
   const [sysSettings, setSysSettings] = useState<SystemSettings | null>(null);

   useEffect(() => {
      if(currentUser && 'studentId' in currentUser) {
         setForm(currentUser);
      }
      getSystemSettings().then(setSysSettings);
   }, [currentUser]);

   const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!currentUser || !('id' in currentUser)) return;
      try {
         await updateStudent(currentUser.id!, form);
         updateProfile(form);
         alert("บันทึกข้อมูลสำเร็จ");
      } catch(err) {
         alert("เกิดข้อผิดพลาด");
      }
   };

   if(!currentUser) return null;

   return (
      <div className="max-w-2xl mx-auto py-12 px-4">
         <Card>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><UserCog/> แก้ไขข้อมูลส่วนตัว</h2>
            
            {sysSettings && 'academicYear' in currentUser && currentUser.academicYear !== sysSettings.currentAcademicYear && (
               <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 flex items-start gap-3">
                  <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={20}/>
                  <div>
                     <h4 className="font-bold text-yellow-800">กรุณาอัปเดตข้อมูลปีการศึกษา</h4>
                     <p className="text-sm text-yellow-700">ปีการศึกษาปัจจุบันคือ {sysSettings.currentAcademicYear} กรุณาตรวจสอบระดับชั้นและห้องเรียนของท่านให้เป็นปัจจุบัน</p>
                  </div>
               </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-bold mb-1">คำนำหน้า</label>
                     <Input value={form.prefix} onChange={e => setForm({...form, prefix: e.target.value})} />
                  </div>
                  <div>
                     <label className="block text-sm font-bold mb-1">รหัสนักเรียน (แก้ไขไม่ได้)</label>
                     <Input disabled value={(currentUser as StudentData).studentId} className="bg-gray-100" />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold mb-1">ชื่อ</label><Input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} /></div>
                  <div><label className="block text-sm font-bold mb-1">นามสกุล</label><Input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-bold mb-1">ชั้น</label>
                     <select className="w-full px-4 py-2 rounded-lg border border-gray-300" value={form.grade} onChange={e => setForm({...form, grade: e.target.value as GradeLevel})}>
                        {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-bold mb-1">ห้อง</label>
                     <select className="w-full px-4 py-2 rounded-lg border border-gray-300" value={form.room} onChange={e => setForm({...form, room: e.target.value})}>
                        {ROOM_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                     </select>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold mb-1">เบอร์โทรศัพท์</label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                  <div>
                     <label className="block text-sm font-bold mb-1">ปีการศึกษา</label>
                     <Input value={form.academicYear || ''} onChange={e => setForm({...form, academicYear: e.target.value})} />
                  </div>
               </div>
               <Button type="submit" className="w-full mt-4">บันทึกการเปลี่ยนแปลง</Button>
            </form>
         </Card>
      </div>
   );
};

// --- Student Pages ---

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const student = currentUser as StudentData;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
       <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10">
             <h1 className="text-3xl font-bold mb-2">สวัสดี, {student.prefix}{student.firstName} {student.lastName}</h1>
             <p className="text-blue-100 text-lg">ยินดีต้อนรับสู่ระบบสารสนเทศโรงเรียนคุณธรรม</p>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/core-leader" className="group">
             <Card className="h-full border-t-4 border-t-blue-500 hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors"><Users size={32} className="text-blue-600 group-hover:text-white"/></div>
                   {student.isCoreLeader ? <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">สมัครแล้ว</span> : <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">ยังไม่สมัคร</span>}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">นักเรียนแกนนำ</h3>
                <p className="text-gray-500 text-sm">สมัครเป็นแกนนำห้องเรียนเพื่อขับเคลื่อนกิจกรรม</p>
             </Card>
          </Link>
          <Link to="/committee" className="group">
             <Card className="h-full border-t-4 border-t-indigo-500 hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Award size={32} className="text-indigo-600 group-hover:text-white"/></div>
                   {student.isCommittee ? <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">สมัครแล้ว</span> : <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">ยังไม่สมัคร</span>}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">คณะกรรมการนักเรียน</h3>
                <p className="text-gray-500 text-sm">สมัครเพื่อเป็นผู้นำในการขับเคลื่อนระดับโรงเรียน</p>
             </Card>
          </Link>
          <Link to="/project" className="group">
             <Card className="h-full border-t-4 border-t-teal-500 hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-teal-50 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-colors"><FileText size={32} className="text-teal-600 group-hover:text-white"/></div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">โครงงานคุณธรรม</h3>
                <p className="text-gray-500 text-sm">ส่งและติดตามสถานะโครงงานห้องเรียน</p>
             </Card>
          </Link>
       </div>
    </div>
  );
};

const ActivityPage: React.FC<{ type: 'CORE' | 'COMMITTEE'; title: string; configKey: string; isApplied: boolean; canApply?: boolean }> = ({ type, title, configKey, isApplied, canApply = true }) => {
   const { currentUser, updateProfile } = useAuth();
   const [config, setConfig] = useState<SystemConfig | null>(null);
   const [announcements, setAnnouncements] = useState<Announcement[]>([]);
   const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
      getSystemConfig(configKey).then(setConfig);
      getAnnouncements(type).then(setAnnouncements);
   }, [configKey, type]);

   const handleApply = async () => {
      if(!currentUser || !('id' in currentUser) || !config || !config.isOpen) return;
      if(!canApply && type === 'COMMITTEE') {
         alert("เฉพาะนักเรียนแกนนำเท่านั้นที่สามารถสมัครได้");
         return;
      }
      setIsLoading(true);
      try {
         const updates = type === 'CORE' 
            ? { isCoreLeader: true, coreLeaderAppliedDate: new Date().toISOString() } 
            : { isCommittee: true, committeeAppliedDate: new Date().toISOString() };
         
         await updateStudent(currentUser.id!, updates);
         updateProfile(updates);
         alert("สมัครสำเร็จ!");
      } catch(err) {
         alert("เกิดข้อผิดพลาด");
      } finally {
         setIsLoading(false);
      }
   };

   const handleCancel = async () => {
      if(!currentUser || !('id' in currentUser)) return;
      if(!confirm("ต้องการยกเลิกการสมัครใช่หรือไม่?")) return;
      setIsLoading(true);
      try {
         const updates = type === 'CORE' 
            ? { isCoreLeader: false, coreLeaderAppliedDate: null } 
            : { isCommittee: false, committeeAppliedDate: null };
         
         await updateStudent(currentUser.id!, updates);
         updateProfile(updates as any); // Type assertion for null
         alert("ยกเลิกการสมัครแล้ว");
      } catch(err) {
         alert("เกิดข้อผิดพลาด");
      } finally {
         setIsLoading(false);
      }
   };

   if(!config) return <div className="p-8 text-center">Loading...</div>;

   return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
         <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">{title}</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">ร่วมเป็นส่วนหนึ่งในการขับเคลื่อนโรงเรียนคุณธรรม สพฐ. สร้างสังคมแห่งความดี</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
               <Card>
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-slate-800"><Megaphone size={20}/> ประกาศและข่าวสาร</h3>
                  <div className="space-y-4">
                     {announcements.length === 0 ? <p className="text-gray-500 text-center py-4">ไม่มีประกาศในขณะนี้</p> : 
                        announcements.map(a => (
                           <div key={a.id} className="border-l-4 border-blue-500 bg-blue-50/50 p-4 rounded-r-lg">
                              <h4 className="font-bold text-slate-800">{a.title}</h4>
                              <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{a.content}</p>
                              {a.link && <a href={a.link} target="_blank" rel="noreferrer" className="text-blue-600 text-sm mt-2 inline-flex items-center gap-1 hover:underline"><LinkIcon size={14}/> รายละเอียดเพิ่มเติม</a>}
                              <div className="text-xs text-gray-400 mt-2">{new Date(a.date).toLocaleDateString('th-TH')}</div>
                           </div>
                        ))
                     }
                  </div>
               </Card>
            </div>

            <div className="md:col-span-1">
               <Card className="sticky top-24 text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isApplied ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                     {isApplied ? <CheckCircle size={32}/> : <UserIcon size={32}/>}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{isApplied ? 'สมัครเรียบร้อยแล้ว' : 'สถานะการสมัคร'}</h3>
                  
                  {isApplied ? (
                     <div className="space-y-4">
                        <div className="text-green-600 text-sm bg-green-50 py-2 rounded-lg font-medium">ได้รับการบันทึกในระบบ</div>
                        {config.isOpen && <Button variant="outline" onClick={handleCancel} disabled={isLoading} className="w-full text-red-500 border-red-500 hover:bg-red-50">ยกเลิกการสมัคร</Button>}
                     </div>
                  ) : (
                     <div className="space-y-4">
                        {config.isOpen ? (
                           <>
                              <p className="text-sm text-gray-500 mb-4">ระบบเปิดรับสมัคร</p>
                              {(!canApply && type === 'COMMITTEE') ? (
                                 <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">ต้องเป็นนักเรียนแกนนำก่อนจึงจะสมัครได้</div>
                              ) : (
                                 <Button onClick={handleApply} disabled={isLoading} className="w-full shadow-lg shadow-blue-500/30">ลงชื่อสมัครทันที</Button>
                              )}
                           </>
                        ) : (
                           <div className="bg-gray-100 text-gray-500 py-3 rounded-lg font-medium text-sm">ระบบปิดรับสมัคร</div>
                        )}
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
   const student = currentUser as StudentData;
   const [project, setProject] = useState<Project | null>(null);
   const [isEditing, setIsEditing] = useState(false);
   const [form, setForm] = useState<Partial<Project>>({});
   const [sysSettings, setSysSettings] = useState<SystemSettings | null>(null);

   useEffect(() => {
      const load = async () => {
         const settings = await getSystemSettings();
         setSysSettings(settings);
         const p = await getProjectByRoom(settings.currentAcademicYear, student.grade, student.room);
         if(p) {
            setProject(p);
            setForm(p);
         } else {
            setForm({ 
               academicYear: settings.currentAcademicYear, 
               grade: student.grade, 
               room: student.room,
               name: '', moralPrinciple: '', advisors: '', members: '', status: 'PENDING'
            });
            setIsEditing(true); // Auto edit mode if no project
         }
      };
      load();
   }, [student]);

   const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!sysSettings) return;
      try {
         const data = { ...form, submissionDate: new Date().toISOString() } as Project;
         if(project && project.id) {
            await updateProject(project.id, data);
            setProject({ ...project, ...data });
         } else {
            await addProject(data);
            const newP = await getProjectByRoom(sysSettings.currentAcademicYear, student.grade, student.room);
            setProject(newP);
         }
         setIsEditing(false);
         alert("บันทึกโครงงานเรียบร้อย");
      } catch(err) {
         alert("เกิดข้อผิดพลาด");
      }
   };

   return (
      <div className="max-w-4xl mx-auto py-12 px-4">
         <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">โครงงานคุณธรรมห้องเรียน</h1>
            {project && !isEditing && (
               <Button onClick={() => setIsEditing(true)} variant="secondary" className="flex items-center gap-2"><Edit3 size={16}/> แก้ไขข้อมูล</Button>
            )}
         </div>

         {isEditing ? (
            <Card>
               <h3 className="font-bold text-xl mb-4 border-b pb-2">แบบฟอร์มส่งโครงงาน</h3>
               <form onSubmit={handleSave} className="space-y-4">
                  <div><label className="block text-sm font-bold mb-1">ชื่อโครงงาน</label><Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                  <div>
                     <label className="block text-sm font-bold mb-1">หลักธรรมที่นำมาใช้ (เช่น อริยสัจ 4, สังคหวัตถุ 4)</label>
                     <Input required value={form.moralPrinciple} onChange={e => setForm({...form, moralPrinciple: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div><label className="block text-sm font-bold mb-1">ครูที่ปรึกษา</label><Input required value={form.advisors} onChange={e => setForm({...form, advisors: e.target.value})} placeholder="ระบุชื่อครู" /></div>
                  </div>
                  <div>
                     <label className="block text-sm font-bold mb-1">รายชื่อสมาชิก (ใส่ชื่อและเลขที่ เว้นบรรทัด)</label>
                     <textarea className="w-full border rounded-lg p-3 text-sm h-32" value={form.members} onChange={e => setForm({...form, members: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div><label className="block text-sm font-bold mb-1">ลิงก์รูปภาพ (Google Drive/Photos)</label><Input value={form.imageLink || ''} onChange={e => setForm({...form, imageLink: e.target.value})} placeholder="https://..." /></div>
                     <div><label className="block text-sm font-bold mb-1">ลิงก์เอกสารรูปเล่ม (ถ้ามี)</label><Input value={form.docLink || ''} onChange={e => setForm({...form, docLink: e.target.value})} placeholder="https://..." /></div>
                  </div>
                  <div className="flex gap-4 pt-4">
                     {project && <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>ยกเลิก</Button>}
                     <Button type="submit">บันทึกโครงงาน</Button>
                  </div>
               </form>
            </Card>
         ) : project ? (
            <Card>
               <div className="flex justify-between items-start mb-6">
                  <div>
                     <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${project.status === 'APPROVED' ? 'bg-green-100 text-green-700' : project.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {project.status === 'APPROVED' ? 'อนุมัติแล้ว' : project.status === 'REJECTED' ? 'ปรับปรุงแก้ไข' : 'รอการตรวจสอบ'}
                     </span>
                     <h2 className="text-2xl font-bold text-slate-800">{project.name}</h2>
                     <p className="text-gray-600 text-sm mt-1">ห้อง {project.grade}/{project.room} • ปีการศึกษา {project.academicYear}</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <div>
                        <h4 className="font-bold text-gray-700 mb-1">หลักธรรม</h4>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{project.moralPrinciple}</p>
                     </div>
                     <div>
                        <h4 className="font-bold text-gray-700 mb-1">ครูที่ปรึกษา</h4>
                        <p className="text-gray-600">{project.advisors}</p>
                     </div>
                     <div>
                        <h4 className="font-bold text-gray-700 mb-1">ลิงก์แนบ</h4>
                        <div className="flex gap-2">
                           {project.imageLink && <a href={project.imageLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1"><ImageIcon size={16}/> รูปภาพ</a>}
                           {project.docLink && <a href={project.docLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1"><FileText size={16}/> เอกสาร</a>}
                        </div>
                     </div>
                  </div>
                  <div>
                     <h4 className="font-bold text-gray-700 mb-2">สมาชิกในกลุ่ม</h4>
                     <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {project.members}
                     </div>
                  </div>
               </div>
            </Card>
         ) : null}
      </div>
   );
};

// --- Admin Manage Module (Updated for Manual Add) ---

const AdminManageModule: React.FC<{ type: 'CORE' | 'COMMITTEE'; configKey: string; title: string }> = ({ type, configKey, title }) => {
  const [config, setConfig] = useState<SystemConfig>({ key: configKey, isOpen: false });
  const [students, setStudents] = useState<StudentData[]>([]);
  const [filterGrade, setFilterGrade] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnounce, setNewAnnounce] = useState({ title: '', link: '', content: '' });
  
  // Manual Add State
  const [manualAddId, setManualAddId] = useState('');
  const [manualAddLoading, setManualAddLoading] = useState(false);

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

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAddId) return;
    setManualAddLoading(true);
    try {
      const student = await getStudentByStdId(manualAddId);
      if (!student) {
        alert("ไม่พบรหัสนักเรียนนี้ในระบบ");
      } else {
        if ((type === 'CORE' && student.isCoreLeader) || (type === 'COMMITTEE' && student.isCommittee)) {
           alert("นักเรียนคนนี้สมัครไปแล้ว");
        } else {
           const updateData = type === 'CORE' 
             ? { isCoreLeader: true, coreLeaderAppliedDate: new Date().toISOString() }
             : { isCommittee: true, committeeAppliedDate: new Date().toISOString() };
           await updateStudent(student.id!, updateData);
           alert(`เพิ่ม ${student.firstName} ${student.lastName} เรียบร้อยแล้ว`);
           setManualAddId('');
           loadData();
        }
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setManualAddLoading(false);
    }
  };

  const exportImage = async () => {
     if(statsRef.current) {
        const element = statsRef.current;
        const clone = element.cloneNode(true) as HTMLElement;
        clone.style.position = 'fixed';
        clone.style.top = '-10000px';
        clone.style.left = '0';
        clone.style.width = 'max-content';
        clone.style.height = 'auto';
        clone.style.overflow = 'visible';
        clone.style.zIndex = '-1000';
        clone.style.background = 'white';
        document.body.appendChild(clone);
        try {
            const canvas = await html2canvas(clone, { scale: 2, useCORS: true, windowWidth: clone.scrollWidth + 100, windowHeight: clone.scrollHeight + 100 });
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

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ... [renderStats function remains same] ...
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
      
      {/* Manual Add Student Section */}
      <Card className="border-l-4 border-amber-500 bg-amber-50">
         <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-amber-800"><PlusCircle size={20}/> สมัครให้นักเรียน (Manual Add)</h3>
         <form onSubmit={handleManualAdd} className="flex gap-4 items-end">
            <div className="flex-1 max-w-xs">
               <label className="block text-sm font-bold text-amber-900 mb-1">รหัสนักเรียน</label>
               <Input 
                 placeholder="กรอกรหัสนักเรียน" 
                 value={manualAddId} 
                 onChange={e => setManualAddId(e.target.value)} 
                 className="bg-white"
               />
            </div>
            <Button type="submit" variant="gold" disabled={manualAddLoading}>
               {manualAddLoading ? 'กำลังตรวจสอบ...' : 'สมัครเข้าร่วม'}
            </Button>
         </form>
      </Card>

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

// --- Admin Students (Updated) ---

const AdminStudents = () => {
   const [students, setStudents] = useState<StudentData[]>([]);
   const [searchTerm, setSearchTerm] = useState('');
   const [filterYear, setFilterYear] = useState('');
   const [filterGrade, setFilterGrade] = useState('');
   const [filterRoom, setFilterRoom] = useState('');
   
   // UI States
   const [editingStudent, setEditingStudent] = useState<StudentData | null>(null);
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
   
   // New Student Form
   const [newStudentForm, setNewStudentForm] = useState({
      studentId: '', prefix: 'นาย', firstName: '', lastName: '', grade: GradeLevel.M1, room: '1', phone: '', academicYear: ''
   });

   useEffect(() => { 
     getAllStudents().then(setStudents); 
     getSystemSettings().then(s => setNewStudentForm(prev => ({...prev, academicYear: s.currentAcademicYear})));
   }, []);
   
   // ... [Delete/Edit functions same as before] ...
   const handleDeleteUser = async (id: string) => {
      if(!window.confirm("ยืนยันการลบผู้ใช้งานนี้?")) return;
      try { await deleteStudent(id); setStudents(students.filter(s => s.id !== id)); } catch (e) { alert("Error"); }
   };
   const handleEditClick = (s: StudentData) => setEditingStudent({ ...s });
   const handleEditSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingStudent || !editingStudent.id) return;
      try {
        const { id, ...data } = editingStudent;
        // @ts-ignore
        await updateStudent(id, data);
        setStudents(students.map(s => s.id === id ? editingStudent : s));
        setEditingStudent(null);
        alert("Saved");
      } catch (e) { alert("Error"); }
   };

   // Add Single Student
   const handleAddStudent = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
         await registerStudent(newStudentForm);
         alert("เพิ่มนักเรียนสำเร็จ");
         setIsAddModalOpen(false);
         // Reset form
         setNewStudentForm({...newStudentForm, studentId: '', firstName: '', lastName: '', phone: ''});
         getAllStudents().then(setStudents);
      } catch (e: any) {
         alert(e.message || "เกิดข้อผิดพลาด");
      }
   };

   // CSV Import Logic
   const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (evt) => {
         const text = evt.target?.result as string;
         const lines = text.split('\n');
         let successCount = 0;
         let failCount = 0;

         // Skip header if needed, assuming no header for now or user handles it. 
         // Strategy: Regex/Split logic.
         // Expected: ID, Grade, Room, Prefix, Name, Surname, Nickname, Phone
         
         const promises = lines.map(async (line) => {
            const cols = line.split(',').map(s => s.trim());
            if (cols.length < 6) return; // Skip empty/invalid lines

            const [id, gradeRaw, room, prefix, first, last, nick, phone] = cols;
            
            // Normalize Grade
            let gradeStr = gradeRaw;
            if (/^\d$/.test(gradeStr)) gradeStr = "ม." + gradeStr; // 1 -> ม.1
            if (!Object.values(GradeLevel).includes(gradeStr as GradeLevel)) {
               // Fallback or default
               gradeStr = GradeLevel.M1; 
            }

            try {
               await registerStudent({
                  studentId: id,
                  grade: gradeStr as GradeLevel,
                  room: room,
                  prefix: prefix,
                  firstName: first,
                  lastName: last,
                  phone: phone || '', // Phone might be optional/missing
                  academicYear: newStudentForm.academicYear
               });
               successCount++;
            } catch (err) {
               console.error(`Failed to import ${id}:`, err);
               failCount++;
            }
         });

         await Promise.all(promises);
         alert(`นำเข้าสำเร็จ ${successCount} รายการ, ล้มเหลว/ซ้ำ ${failCount} รายการ`);
         getAllStudents().then(setStudents);
         setIsCSVModalOpen(false);
      };
      reader.readAsText(file);
   };

   const filtered = students.filter(s => {
      const matchesSearch = (s.firstName + s.lastName).includes(searchTerm) || s.studentId.includes(searchTerm);
      const matchesYear = !filterYear || s.academicYear === filterYear;
      const matchesGrade = !filterGrade || s.grade === filterGrade;
      const matchesRoom = !filterRoom || s.room === filterRoom;
      return matchesSearch && matchesYear && matchesGrade && matchesRoom;
   });

   const academicYears = Array.from(new Set(students.map(s => s.academicYear).filter(Boolean)));

   return (
     <div className="space-y-6">
       <div className="flex flex-col gap-4">
         <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold text-slate-800">ข้อมูลนักเรียน</h1>
            <div className="flex gap-2">
               <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2"><PlusCircle size={18}/> เพิ่มรายชื่อ</Button>
               <Button onClick={() => setIsCSVModalOpen(true)} variant="secondary" className="flex items-center gap-2"><Upload size={18}/> นำเข้า CSV</Button>
            </div>
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

       {/* Add Student Modal */}
       {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
             <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><PlusCircle/> เพิ่มข้อมูลนักเรียน</h2>
                <form onSubmit={handleAddStudent} className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-bold mb-1">รหัสนักเรียน</label><Input required value={newStudentForm.studentId} onChange={e => setNewStudentForm({...newStudentForm, studentId: e.target.value})} /></div>
                      <div>
                         <label className="block text-sm font-bold mb-1">คำนำหน้า</label>
                         <select className="w-full px-4 py-2 rounded-lg border border-gray-300" value={newStudentForm.prefix} onChange={e => setNewStudentForm({...newStudentForm, prefix: e.target.value})}>
                            <option>เด็กชาย</option><option>เด็กหญิง</option><option>นาย</option><option>นางสาว</option>
                         </select>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-bold mb-1">ชื่อ</label><Input required value={newStudentForm.firstName} onChange={e => setNewStudentForm({...newStudentForm, firstName: e.target.value})} /></div>
                      <div><label className="block text-sm font-bold mb-1">นามสกุล</label><Input required value={newStudentForm.lastName} onChange={e => setNewStudentForm({...newStudentForm, lastName: e.target.value})} /></div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-bold mb-1">ชั้น</label>
                         <select className="w-full px-4 py-2 rounded-lg border border-gray-300" value={newStudentForm.grade} onChange={e => setNewStudentForm({...newStudentForm, grade: e.target.value as GradeLevel})}>
                            {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                         </select>
                      </div>
                      <div>
                         <label className="block text-sm font-bold mb-1">ห้อง</label>
                         <select className="w-full px-4 py-2 rounded-lg border border-gray-300" value={newStudentForm.room} onChange={e => setNewStudentForm({...newStudentForm, room: e.target.value})}>
                            {ROOM_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                         </select>
                      </div>
                   </div>
                   <div><label className="block text-sm font-bold mb-1">เบอร์โทรศัพท์</label><Input value={newStudentForm.phone} onChange={e => setNewStudentForm({...newStudentForm, phone: e.target.value})} /></div>
                   <div className="flex gap-3 pt-4">
                      <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)} className="flex-1">ยกเลิก</Button>
                      <Button type="submit" className="flex-1">บันทึก</Button>
                   </div>
                </form>
             </Card>
          </div>
       )}

       {/* CSV Modal */}
       {isCSVModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
             <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Upload/> นำเข้าข้อมูล CSV</h2>
                <div className="space-y-4">
                   <p className="text-sm text-gray-600">
                      กรุณาเตรียมไฟล์ CSV โดยไม่มีหัวตาราง (No Header) เรียงลำดับข้อมูลดังนี้:<br/>
                      <code className="bg-gray-100 p-1 rounded text-xs block mt-2">
                         รหัสนักเรียน, ระดับชั้น(1 หรือ ม.1), ห้อง, คำนำหน้า, ชื่อ, นามสกุล, ชื่อเล่น(ระบบไม่เก็บ), เบอร์โทร
                      </code>
                   </p>
                   <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer relative">
                      <input type="file" accept=".csv" onChange={handleCSVUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">คลิกเพื่อเลือกไฟล์ CSV</p>
                   </div>
                   <Button variant="secondary" onClick={() => setIsCSVModalOpen(false)} className="w-full">ปิดหน้าต่าง</Button>
                </div>
             </Card>
          </div>
       )}

       {/* Edit Modal (Existing) */}
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

// --- Admin Components ---

const AdminDashboard = () => {
   const [stats, setStats] = useState({ students: 0, core: 0, committee: 0, projects: 0 });
   useEffect(() => {
      const load = async () => {
         const st = await getAllStudents();
         const pj = await getProjects();
         setStats({
            students: st.length,
            core: st.filter(s => s.isCoreLeader).length,
            committee: st.filter(s => s.isCommittee).length,
            projects: pj.length
         });
      };
      load();
   }, []);

   return (
      <div className="space-y-6">
         <h1 className="text-3xl font-bold text-slate-800">ภาพรวมระบบ</h1>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-blue-600 text-white border-none">
               <div className="text-blue-100 mb-2">นักเรียนทั้งหมด</div>
               <div className="text-4xl font-bold">{stats.students}</div>
            </Card>
            <Card className="bg-indigo-600 text-white border-none">
               <div className="text-indigo-100 mb-2">แกนนำห้องเรียน</div>
               <div className="text-4xl font-bold">{stats.core}</div>
            </Card>
            <Card className="bg-teal-600 text-white border-none">
               <div className="text-teal-100 mb-2">กรรมการนักเรียน</div>
               <div className="text-4xl font-bold">{stats.committee}</div>
            </Card>
            <Card className="bg-amber-600 text-white border-none">
               <div className="text-amber-100 mb-2">โครงงานคุณธรรม</div>
               <div className="text-4xl font-bold">{stats.projects}</div>
            </Card>
         </div>
      </div>
   );
}

const AdminProject = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filterYear, setFilterYear] = useState('');
  
  useEffect(() => {
     getSystemSettings().then(s => {
        setFilterYear(s.currentAcademicYear);
        getProjects(s.currentAcademicYear).then(setProjects);
     });
  }, []);

  const handleStatusChange = async (project: Project, status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
     if(!project.id) return;
     await updateProject(project.id, { status });
     setProjects(projects.map(p => p.id === project.id ? { ...p, status } : p));
  };
  
  const handleDelete = async (id: string) => {
    if(!confirm("ลบโครงงานนี้?")) return;
    await deleteProject(id);
    setProjects(projects.filter(p => p.id !== id));
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-800">จัดการโครงงานคุณธรรม</h1>
          <select value={filterYear} onChange={e => { setFilterYear(e.target.value); getProjects(e.target.value).then(setProjects); }} className="border rounded-lg px-3 py-2">
             <option value="2567">2567</option>
             <option value="2566">2566</option>
          </select>
       </div>
       <Card>
          <div className="overflow-x-auto">
             <table className="w-full text-sm">
                <thead>
                   <tr className="bg-slate-50 text-left">
                      <th className="p-4">ห้อง</th>
                      <th className="p-4">ชื่อโครงงาน</th>
                      <th className="p-4">สถานะ</th>
                      <th className="p-4">จัดการ</th>
                   </tr>
                </thead>
                <tbody>
                   {projects.map(p => (
                      <tr key={p.id} className="border-b">
                         <td className="p-4">{p.grade}/{p.room}</td>
                         <td className="p-4">
                            <div className="font-bold">{p.name}</div>
                            <div className="text-xs text-gray-500">{p.moralPrinciple}</div>
                         </td>
                         <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'APPROVED' ? 'bg-green-100 text-green-700' : p.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                               {p.status}
                            </span>
                         </td>
                         <td className="p-4 flex gap-2">
                            <button onClick={() => handleStatusChange(p, 'APPROVED')} className="text-green-600 hover:bg-green-50 p-1 rounded"><CheckCircle size={18}/></button>
                            <button onClick={() => handleStatusChange(p, 'REJECTED')} className="text-red-600 hover:bg-red-50 p-1 rounded"><X size={18}/></button>
                            <button onClick={() => handleDelete(p.id!)} className="text-gray-400 hover:text-red-600 p-1 rounded"><Trash2 size={18}/></button>
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

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin', label: 'ภาพรวมระบบ', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/core', label: 'จัดการแกนนำ', icon: <Users size={20} /> },
    { path: '/admin/committee', label: 'จัดการกรรมการ', icon: <Award size={20} /> },
    { path: '/admin/students', label: 'ข้อมูลนักเรียน', icon: <UserIcon size={20} /> },
    { path: '/admin/project', label: 'โครงงานคุณธรรม', icon: <FileText size={20} /> },
  ];

  const handleLogout = async () => {
     await logout();
     navigate('/login');
  };

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
           <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-white hover:bg-red-500/20 w-full rounded-xl transition-colors">
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

// Helper for Profile Check
type ForceProfileUpdateProps = { 
  children: React.ReactNode; 
  currentUser: StudentData | AdminUser | null; 
  role: UserRole | null; 
  sysSettings: SystemSettings 
};

const ForceProfileUpdate: React.FC<ForceProfileUpdateProps> = ({ 
  children, 
  currentUser, 
  role, 
  sysSettings 
}) => {
   if (role === UserRole.STUDENT && currentUser) {
      const s = currentUser as StudentData;
      if (s.academicYear !== sysSettings.currentAcademicYear) {
         return <Navigate to="/profile/edit" />;
      }
   }
   return <>{children}</>;
};

// Main App Component
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