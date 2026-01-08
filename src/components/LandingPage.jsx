import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Trophy, ShieldCheck, Zap, GraduationCap, Heart, BookOpen } from 'lucide-react';
import api from '../services/api';

export default function LandingPage({ onLoginSuccess }) {
	const [modalMode, setModalMode] = useState(null);
	const [selectedRole, setSelectedRole] = useState(null);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [showForgot, setShowForgot] = useState(false);
	const [forgotSent, setForgotSent] = useState(false);
	const [resendSent, setResendSent] = useState(false);
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [backendAvailable, setBackendAvailable] = useState(true);
	// Production: Remove all local-only/migration state

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				await api.ping();
				if (mounted) setBackendAvailable(true);
			} catch (e) {
				if (mounted) setBackendAvailable(false);
			}
		})();
		return () => { mounted = false; };
	}, []);

	// No-op: no local fallback allowed in production

	const migrateAll = async () => {
		if (!localUsers || localUsers.length === 0) return;
		setMigratingAll(true);
		const statuses = { ...migrationStatus };
		for (const u of [...localUsers]) {
			const pwd = migratePasswords[u.email];
			if (!pwd) {
				statuses[u.email] = 'missing_password';
				setMigrationStatus({ ...statuses });
				continue;
			}
			try {
				await api.register({ email: u.email, password: pwd, name: u.name });
				statuses[u.email] = 'ok';
				// remove from local storage immediately
				const remaining = JSON.parse(localStorage.getItem('class123_users') || '[]').filter(x => x.email !== u.email);
				localStorage.setItem('class123_users', JSON.stringify(remaining));
				setLocalUsers(remaining);
			} catch (err) {
				statuses[u.email] = 'error';
			}
			setMigrationStatus({ ...statuses });
		}
		setMigratingAll(false);
	};

	const handleSignup = async (e) => {
		e.preventDefault();
		setError('');
		if (!backendAvailable) {
			setError('Backend not available. Please connect to the server to create an account.');
			return;
		}
		if (password !== confirmPassword) {
			setError('Passwords do not match.');
			return;
		}
		try {
			const resp = await api.register({ email, password, name });
			if (resp && resp.message) {
				setError(resp.message);
				setEmail('');
				setPassword('');
				setConfirmPassword('');
				setName('');
			} else {
				setError('Account created! Please check your email to verify your account.');
				setEmail('');
				setPassword('');
				setConfirmPassword('');
				setName('');
			}
		} catch (err) {
			console.error('Signup error:', err);
			let msg = 'Failed to create account.';
			if (err?.body) {
				try {
					const body = typeof err.body === 'string' ? JSON.parse(err.body) : err.body;
					if (body.data?.email) msg = 'This email is already registered.';
					else if (body.message) msg = body.message;
					else if (body.error) msg = body.error;
				} catch (e) { 
					console.error('Error parsing body:', e);
					msg = err.body?.message || err.message || msg; 
				}
			}
			setError(msg);
		}
	};

	const handleLogin = async (e) => {
		e.preventDefault();
		setError('');
		try {
			const resp = await api.login({ email, password });
			if (resp && resp.token) {
				api.setToken(resp.token);
				onLoginSuccess({ ...resp.user, token: resp.token });
			}
		} catch (err) {
			let msg = 'Login failed.';
			let showResend = false;
			if (err?.body) {
				try {
					const body = typeof err.body === 'string' ? JSON.parse(err.body) : err.body;
					if (body.message?.includes('email not verified')) {
						msg = 'Please verify your email first. Check your inbox for the verification link.';
						showResend = true;
					} else if (body.message?.includes('not found')) msg = 'No account found with that email.';
					else if (body.message?.includes('password')) msg = 'Incorrect password.';
					else msg = body.message || msg;
				} catch { msg = err.message || msg; }
			}
			setError(msg + (showResend ? ' (Check spam folder if not found)' : ''));
		}
	};

	const handleForgot = async (e) => {
		e.preventDefault();
		setError('');
		setForgotSent(false);
		try {
			await api.forgotPassword(email);
			setForgotSent(true);
		} catch (err) {
			setError('Could not send reset email.');
		}
	};

	const handleResend = async (e) => {
		e.preventDefault();
		setError('');
		setResendSent(false);
		try {
			await api.resendConfirmation(email);
			setResendSent(true);
		} catch (err) {
			setError('Could not resend confirmation.');
		}
	};

	return (
		<div style={modernStyles.container}>
			<div style={modernStyles.glow}></div>

			<nav style={modernStyles.nav}>
				{!backendAvailable && (
					<div style={{ background: '#FFF6F6', color: '#9B1C1C', padding: '10px 18px', borderRadius: 10, position: 'absolute', left: 20, top: 16, zIndex: 110, fontWeight: 600 }}>
						Backend not available. Please connect to the server to create an account.
					</div>
				)}
				<div style={modernStyles.logo}>Class123 <span style={modernStyles.badge}>2026</span></div>
				<div style={modernStyles.navLinks}>
					<a href="#why" style={modernStyles.anchor}>Why Us</a>
					<a href="#how" style={modernStyles.anchor}>How To</a>
					<button onClick={() => setModalMode('login')} style={modernStyles.loginBtn}>Login</button>
					<button onClick={() => setModalMode('role')} style={modernStyles.signupBtn}>Sign Up Free</button>
				</div>
			</nav>

			<section style={modernStyles.hero}>
				<div style={modernStyles.tagline}>✨ The #1 Classroom Community Platform</div>
				<h1 style={modernStyles.heroTitle}>Engage students like <br/> <span style={modernStyles.gradientText}>never before.</span></h1>
				<p style={modernStyles.heroSub}>A complete ecosystem for teachers to track behavior, gamify learning, and connect with parents instantly.</p>
				<div style={{display:'flex', gap:'15px', justifyContent:'center', marginTop:'30px'}}>
						<button onClick={() => setModalMode('role')} style={modernStyles.mainCta}>Get Started for Free <ArrowRight size={18}/></button>
				</div>
			</section>

			<section id="why" style={modernStyles.infoSection}>
				<h2 style={modernStyles.sectionHeading}>Why This is a Great Website</h2>
				<div style={modernStyles.infoGrid}>
						<div style={modernStyles.infoCard}>
								<div style={modernStyles.iconBg}><Zap color="#4CAF50" /></div>
								<h3>Real-time Reward System</h3>
								<p>Instantly recognize student effort with visual and audio feedback that builds confidence.</p>
						</div>
						<div style={modernStyles.infoCard}>
								<div style={modernStyles.iconBg}><Trophy color="#FFD700" /></div>
								<h3>Egg Progress Goals</h3>
								<p>Gamify the whole classroom experience. When the class works together, the egg hatches!</p>
						</div>
						<div style={modernStyles.infoCard}>
								<div style={modernStyles.iconBg}><ShieldCheck color="#2196F3" /></div>
								<h3>Data You Can Trust</h3>
								<p>End-to-end encryption for all student records and teacher communication.</p>
						</div>
				</div>
			</section>

			<section id="how" style={modernStyles.howSection}>
					<div style={modernStyles.howContent}>
							<h2 style={{fontSize: '40px', fontWeight: 900}}>How to use Class123</h2>
							<div style={modernStyles.step}>
									<div style={modernStyles.stepNum}>1</div>
									<div>
											<h4>Create your Digital Classroom</h4>
											<p>Sign up as a teacher and add your students with custom avatars or real photos.</p>
									</div>
							</div>
							<div style={modernStyles.step}>
									<div style={modernStyles.stepNum}>2</div>
									<div>
											<h4>Award "Wow" & "Nono" Points</h4>
											<p>Use your dashboard to reinforce positive behaviors during your lessons.</p>
									</div>
							</div>
							<div style={modernStyles.step}>
									<div style={modernStyles.stepNum}>3</div>
									<div>
											<h4>Automated Reporting</h4>
											<p>Generate beautiful PDF reports for parents at the click of a button.</p>
									</div>
							</div>
					</div>
					<div style={modernStyles.howVisual}>
							<div style={modernStyles.mockupCard}>🚀 Class Spirit: 100%</div>
					</div>
			</section>

			{modalMode && (
				<div style={modernStyles.overlay}>
				  <div style={modernStyles.bentoContainer}>
						<div style={modernStyles.modalHeader}>
							<h2 style={{fontWeight: 900}}>{modalMode === 'role' ? 'Choose Account Type' : modalMode === 'signup' ? 'Sign Up' : 'Welcome Back'}</h2>
							<X onClick={() => {setModalMode(null); setError('');}} style={{cursor:'pointer'}} />
						</div>

						{modalMode === 'role' && (
							<div style={modernStyles.bentoGrid}>
								<div onClick={() => {setSelectedRole('teacher'); setModalMode('signup');}} style={modernStyles.bentoCard}>
									<GraduationCap size={40} color="#4CAF50" />
									<h3>Teacher</h3>
									<p>Manage your students.</p>
								</div>
								<div style={{...modernStyles.bentoCard, opacity: 0.6}}>
									<Heart size={40} color="#FF5252" />
									<h3>Parent</h3>
									<p>View student reports.</p>
								</div>
								<div style={{...modernStyles.bentoCard, opacity: 0.6}}>
									<BookOpen size={40} color="#4DB6AC" />
									<h3>Student</h3>
									<p>Track your badges.</p>
								</div>
							</div>
						)}

								{(modalMode === 'signup' || modalMode === 'login') && (
									modalMode === 'login' && showForgot ? (
										<form onSubmit={handleForgot} style={modernStyles.authForm}>
											<input type="email" placeholder="Email Address" style={modernStyles.input} onChange={e => setEmail(e.target.value)} required />
											<button type="submit" style={modernStyles.mainCta}>Send Reset Link</button>
											{forgotSent && <p style={{color:'green', fontSize:'13px', textAlign:'center'}}>Reset link sent! Check your email.</p>}
											<p style={{textAlign:'center', marginTop: '15px', color: '#666'}}>
												<span onClick={() => setShowForgot(false)} style={{color:'#4CAF50', cursor:'pointer', fontWeight:'bold', marginLeft:'5px'}}>Back to Login</span>
											</p>
										</form>
									) : (
										<form onSubmit={modalMode === 'signup' ? handleSignup : handleLogin} style={modernStyles.authForm}>
											{error && <p style={{color:'red', fontSize:'13px', textAlign:'center'}}>{error}</p>}
											<input type="email" placeholder="Email Address" style={modernStyles.input} onChange={e => setEmail(e.target.value)} required />
											<input type="password" placeholder="Password" style={modernStyles.input} onChange={e => setPassword(e.target.value)} required />
											{modalMode === 'signup' && (
												<>
													<input type="password" placeholder="Confirm Password" style={modernStyles.input} onChange={e => setConfirmPassword(e.target.value)} required />
													<input placeholder="Full name (optional)" style={modernStyles.input} onChange={e => setName(e.target.value)} />
												</>
											)}
											<button type="submit" style={modernStyles.mainCta}>
												{modalMode === 'signup' ? 'Create My Account' : 'Log Into Dashboard'}
											</button>
											{modalMode === 'login' && (
												<>
													<p style={{textAlign:'center', marginTop: '10px', color: '#666'}}>
														<span onClick={() => setShowForgot(true)} style={{color:'#4CAF50', cursor:'pointer', fontWeight:'bold'}}>Forgot password?</span>
													</p>
													{error === 'Account not confirmed. Check your email.' && (
														<p style={{textAlign:'center', marginTop: '10px', color: '#666'}}>
															<span onClick={handleResend} style={{color:'#4CAF50', cursor:'pointer', fontWeight:'bold'}}>Resend confirmation email</span>
															{resendSent && <span style={{color:'green', marginLeft: 8}}>Sent!</span>}
														</p>
													)}
												</>
											)}
											<p style={{textAlign:'center', marginTop: '15px', color: '#666'}}>
												{modalMode === 'signup' ? 'Already have an account?' : 'New here?'} 
												<span onClick={() => { setModalMode(modalMode === 'signup' ? 'login' : 'role'); setShowForgot(false); }} style={{color:'#4CAF50', cursor:'pointer', fontWeight:'bold', marginLeft:'5px'}}>
													{modalMode === 'signup' ? 'Login' : 'Sign Up'}
												</span>
											</p>
										</form>
									)
								)}
					</div>
				</div>
			)}
		</div>
	);
}

const modernStyles = {
	container: { height: '100vh', background: '#fff', fontFamily: 'system-ui', overflowY: 'auto' },
	glow: { position: 'fixed', top: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 50% -20%, #e8f5e9, transparent)', pointerEvents: 'none' },
	nav: { padding: '20px 80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 },
	logo: { fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' },
	badge: { fontSize: '10px', background: '#000', color: '#fff', padding: '2px 8px', borderRadius: '10px', verticalAlign: 'middle' },
	navLinks: { display: 'flex', gap: '30px', alignItems: 'center' },
	anchor: { textDecoration: 'none', color: '#444', fontWeight: '500' },
	loginBtn: { background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
	signupBtn: { background: '#1a1a1b', color: '#fff', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
	hero: { textAlign: 'center', padding: '100px 20px' },
	tagline: { color: '#4CAF50', fontWeight: 'bold', marginBottom: '15px' },
	heroTitle: { fontSize: '48px', fontWeight: '900', lineHeight: 1.1, letterSpacing: '-1px' },
	gradientText: { background: 'linear-gradient(90deg, #4CAF50, #2E7D32)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
	heroSub: { fontSize: '18px', color: '#666', maxWidth: '700px', margin: '20px auto' },
	mainCta: { background: '#000', color: '#fff', padding: '12px 22px', borderRadius: '12px', fontSize: '16px', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' },
	infoSection: { padding: '60px', background: '#f9f9f9' },
	sectionHeading: { textAlign: 'center', fontSize: '32px', fontWeight: '900', marginBottom: '30px' },
	infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' },
	infoCard: { background: '#fff', padding: '20px', borderRadius: '18px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
	iconBg: { width: '50px', height: '50px', background: '#f5f5f5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' },
	howSection: { padding: '60px', display: 'flex', gap: '30px', alignItems: 'center' },
	howContent: { flex: 1 },
	step: { display: 'flex', gap: '12px', marginBottom: '20px' },
	stepNum: { minWidth: '36px', height: '36px', background: '#4CAF50', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
	howVisual: { flex: 1, height: '260px', background: '#eee', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
	mockupCard: { background: '#fff', padding: '14px 20px', borderRadius: '12px', fontWeight: '700', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' },
	overlay: { position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
	bentoContainer: { width: '680px', background: '#fff', padding: '36px', borderRadius: '26px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' },
	modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
	bentoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' },
	bentoCard: { background: '#f5f5f7', padding: '20px', borderRadius: '14px', cursor: 'pointer', textAlign: 'center' },
	authForm: { display: 'flex', flexDirection: 'column', gap: '12px' },
	input: { padding: '12px', borderRadius: '10px', border: '1px solid #eee', fontSize: '14px' }
};