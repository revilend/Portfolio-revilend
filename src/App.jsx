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
import CommandPalette from './components/CommandPalette.jsx';
import ScrollProgress from './components/ScrollProgress.jsx';
import ScrollScene from './components/ScrollScene.jsx';
import { projects } from './data/projects.js';
import { projectPath, readProjectId } from './lib/projectUrl.js';
import { initSmoothScroll, scrollToId, setScrollLocked } from './lib/smoothScroll.js';
import { initTelegramWebApp, setTelegramBackButton } from './lib/telegram.js';
import { installErrorReporting, pingVisit } from './lib/telemetry.js';

const CyberRoomView = lazy(() => import('./components/CyberRoomView.jsx'));

function RoomLoader() {
  return (
    <div className="fixed inset-0 z-0 flex items-center justify-center bg-ink-950">
      <div className="flex flex-col items-center gap-4">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-electric/20 border-t-electric" />
        <p className="font-mono text-2xs uppercase tracking-label text-slate-400">
          3D xona yuklanmoqda…
        </p>
      </div>
    </div>
  );
}

// A deep link such as /loyiha/teachermuzaffar/ opens that project's drawer, so
// a shared link lands on the thing that was shared.
function projectFromLocation() {
  if (typeof window === 'undefined') return null;

  const id = readProjectId(window.location);
  if (!id) return null;

  return projects.find((project) => project.id === id) ?? null;
}

export default function App() {
  const [mode, setMode] = useState('2d');
  const [activeProject, setActiveProject] = useState(projectFromLocation);
  const [toast, setToast] = useState(null);
  const [pendingContact, setPendingContact] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const notify = useCallback((message) => {
    setToast({ message, id: Date.now() });
  }, []);

  const clearProjectUrl = useCallback(() => {
    if (readProjectId(window.location)) window.history.replaceState({}, '', '/');
  }, []);

  const openProject = useCallback((project) => {
    setActiveProject(project);

    if (readProjectId(window.location) !== project.id) {
      window.history.pushState({ projectId: project.id }, '', projectPath(project.id));
    }
  }, []);

  const openProjectById = useCallback(
    (id) => {
      const project = projects.find((item) => item.id === id);
      if (project) openProject(project);
    },
    [openProject]
  );

  const closeProject = useCallback(() => {
    // When the project came from an in-page click we pushed a history entry, so
    // closing is a real back navigation. A deep link has no entry to pop.
    if (window.history.state?.projectId) {
      window.history.back();
      return;
    }

    setActiveProject(null);
    clearProjectUrl();
  }, [clearProjectUrl]);

  const changeMode = useCallback(
    (nextMode) => {
      setActiveProject(null);
      clearProjectUrl();
      setMode(nextMode);
    },
    [clearProjectUrl]
  );

  const handleContact = useCallback(() => {
    if (mode === '3d') {
      changeMode('2d');
      setPendingContact(true);
      return;
    }
    scrollToId('contact');
  }, [mode, changeMode]);

  // Ctrl/Cmd+K opens the palette from anywhere, including the 3D room.
  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  // A palette destination always lands on the 2D page: the 3D room has no
  // scrollable sections to jump to.
  const navigateToSection = useCallback(
    (id) => {
      setPaletteOpen(false);
      const scroll = () => scrollToId(id);

      if (mode === '3d') {
        changeMode('2d');
        window.setTimeout(scroll, 140);
        return;
      }
      scroll();
    },
    [mode, changeMode]
  );

  // Inertial scrolling for the whole 2D page; the module no-ops under
  // prefers-reduced-motion so the native scroll is untouched there.
  useEffect(() => {
    initSmoothScroll();
  }, []);

  // Telegram injects its WebApp SDK inside the Mini App; everywhere else this
  // is a no-op. Tinting the client chrome keeps the dark page seamless.
  useEffect(() => {
    initTelegramWebApp();
  }, []);

  // A broken page on a visitor's phone is otherwise invisible: forward crashes
  // and WebGL context loss to the bot, and count the visit for the summary.
  useEffect(() => {
    const stopReporting = installErrorReporting();
    pingVisit();
    return stopReporting;
  }, []);

  // Inside Telegram the native back button should close the drawer instead of
  // leaving the Mini App.
  useEffect(() => {
    if (!activeProject) return setTelegramBackButton(false);

    return setTelegramBackButton(true, () => closeProject());
  }, [activeProject, closeProject]);

  // Browser back/forward keeps the drawer in sync with the URL.
  useEffect(() => {
    const handlePopState = () => setActiveProject(projectFromLocation());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Warm the 3D chunk after first paint, but skip it on metered or slow
  // connections: it is ~150 kB gzipped and most visitors never open the room.
  useEffect(() => {
    const connection = navigator.connection;
    if (connection?.saveData) return undefined;
    if (connection?.effectiveType && /(^|-)2g$/.test(connection.effectiveType)) return undefined;

    const timer = window.setTimeout(() => {
      import('./components/CyberRoomView.jsx').catch(() => {});
    }, 2500);
    return () => window.clearTimeout(timer);
  }, []);

  const scrollLocked = mode === '3d' || Boolean(activeProject) || paletteOpen;

  useEffect(() => {
    setScrollLocked(scrollLocked);
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
      <Header
        mode={mode}
        onModeChange={changeMode}
        onContact={handleContact}
        onOpenPalette={() => setPaletteOpen(true)}
      />

      {mode === '2d' ? (
        <div key="2d" className="animate-fade-in">
          <ScrollProgress />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-lg focus:bg-electric focus:px-4 focus:py-2 focus:font-medium focus:text-ink-950"
          >
            Asosiy kontentga oʻtish
          </a>

          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-ink-900" />
            {/* The tunnel lives inside this background layer: it has to paint
                above the opaque page fill, but still under every section. */}
            <ScrollScene />
            <div className="absolute inset-x-0 top-0 h-[880px] opacity-[0.13] [background-image:radial-gradient(rgba(148,163,184,0.45)_0.6px,transparent_0.6px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
            <div className="absolute inset-y-0 left-1/2 hidden w-full max-w-6xl -translate-x-1/2 border-x border-white/[0.025] lg:block" />
            {/* Radial gradients instead of blurred boxes: the glows look the
                same, but compositing a gradient is nearly free while a
                140px blur re-rasterises on every animated frame. */}
            <div className="absolute -top-48 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(0,242,254,0.14),rgba(0,242,254,0.05)_55%,transparent)]" />
            <div className="absolute right-[-10%] top-[35%] h-[460px] w-[460px] rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.20),rgba(139,92,246,0.06)_55%,transparent)] [animation-delay:2.5s]" />
            <div className="absolute bottom-[-10%] left-[-5%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(6,182,212,0.14),rgba(6,182,212,0.04)_55%,transparent)] [animation-delay:5s]" />
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

      <CommandPalette
        open={paletteOpen}
        mode={mode}
        onClose={() => setPaletteOpen(false)}
        onNavigate={navigateToSection}
        onModeChange={changeMode}
      />

      {toast ? (
        <Toast key={toast.id} message={toast.message} onClose={() => setToast(null)} />
      ) : null}
    </div>
  );
}
