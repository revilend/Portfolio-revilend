import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Projects from './components/Projects.jsx';
import Arsenal from './components/Arsenal.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import Toast from './components/Toast.jsx';
import ProjectDrawer from './components/ProjectDrawer.jsx';
import { projects } from './data/projects.js';

const CyberRoomView = lazy(() => import('./components/CyberRoomView.jsx'));

function RoomLoader() {
  return (
    <div className="fixed inset-0 z-0 flex items-center justify-center bg-[#05070d]">
      <div className="flex flex-col items-center gap-4">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-electric/20 border-t-electric" />
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
          3D xona yuklanmoqda…
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState('2d');
  const [activeProject, setActiveProject] = useState(null);
  const [toast, setToast] = useState(null);
  const [pendingContact, setPendingContact] = useState(false);

  const notify = useCallback((message) => {
    setToast({ message, id: Date.now() });
  }, []);

  const openProject = useCallback((project) => {
    setActiveProject(project);
  }, []);

  const openProjectById = useCallback((id) => {
    const project = projects.find((item) => item.id === id);
    if (project) setActiveProject(project);
  }, []);

  const closeProject = useCallback(() => {
    setActiveProject(null);
  }, []);

  const changeMode = useCallback((nextMode) => {
    setActiveProject(null);
    setMode(nextMode);
  }, []);

  const handleContact = useCallback(() => {
    if (mode === '3d') {
      changeMode('2d');
      setPendingContact(true);
      return;
    }
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  }, [mode, changeMode]);

  // Warm the 3D chunk after first paint so the mode switch feels instant.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      import('./components/CyberRoomView.jsx').catch(() => {});
    }, 2500);
    return () => window.clearTimeout(timer);
  }, []);

  const scrollLocked = mode === '3d' || Boolean(activeProject);

  useEffect(() => {
    if (!scrollLocked) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [scrollLocked]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 4600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!pendingContact || mode !== '2d') return undefined;
    const timer = window.setTimeout(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      setPendingContact(false);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [pendingContact, mode]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Header mode={mode} onModeChange={changeMode} onContact={handleContact} />

      {mode === '2d' ? (
        <div key="2d" className="animate-fade-in">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-lg focus:bg-electric focus:px-4 focus:py-2 focus:font-medium focus:text-ink-950"
          >
            Asosiy kontentga oʻtish
          </a>

          <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-ink-900" />
            <div className="absolute inset-x-0 top-0 h-[880px] opacity-[0.13] [background-image:radial-gradient(rgba(148,163,184,0.45)_0.6px,transparent_0.6px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
            <div className="absolute inset-y-0 left-1/2 hidden w-full max-w-6xl -translate-x-1/2 border-x border-white/[0.025] lg:block" />
            <div className="absolute -top-48 left-1/2 h-[560px] w-[900px] -translate-x-1/2 animate-glow-pulse rounded-full bg-electric/[0.06] blur-[140px]" />
            <div className="absolute right-[-10%] top-[35%] h-[460px] w-[460px] animate-glow-pulse rounded-full bg-plasma/[0.09] blur-[130px] [animation-delay:2.5s]" />
            <div className="absolute bottom-[-10%] left-[-5%] h-[420px] w-[420px] animate-glow-pulse rounded-full bg-cyan-500/[0.05] blur-[120px] [animation-delay:5s]" />
          </div>

          <main id="main" className="overflow-x-hidden">
            <Hero onEnter3D={() => changeMode('3d')} />
            <Projects onOpenProject={openProject} />
            <Arsenal />
            <About onNotify={notify} />
            <Contact onNotify={notify} />
          </main>

          <Footer />
        </div>
      ) : (
        <Suspense fallback={<RoomLoader />}>
          <CyberRoomView onOpenProject={openProjectById} drawerOpen={Boolean(activeProject)} />
        </Suspense>
      )}

      <ProjectDrawer project={activeProject} onClose={closeProject} />

      {toast ? <Toast key={toast.id} message={toast.message} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
