import React, { useEffect, useRef, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import "../stylesheets/landingPage.css";
import DicomViewerImg from "../Assets/DicomViewer.png";
import AIReportImg from "../Assets/AIReport.png";
import UploadImg from "../Assets/Upload.png";
import AdminPanelImg from "../Assets/AdminPanel.jpg";
import UnauthorizedImg from "../Assets/UnautorizedPage.png";
import Upload from './upload';

const CAROUSEL_LABELS = [
    'DICOM Viewer — Cornerstone3D · window/level, zoom, pan & presets',
    'AI Report — local LLM-generated reporting · no patient data sent externally',
    'Batch Upload — automatic DICOM parsing · per-study progress',
    'PostDICOM Console — internal admin dashboard · client account management',
    'Role-based Access — unauthorized actions are blocked per user role',
];

export default function LandingPage() {
    const rootRef = useRef<HTMLDivElement>(null);

    // ─── Embla carousel setup ───
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 14 }); // was default (25) — now faster
    const [selectedIndex, setSelectedIndex] = useState(0);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    // Sync selected dot / label whenever Embla's selection changes
    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
            emblaApi.off('reInit', onSelect);
        };
    }, [emblaApi, onSelect]);

    useEffect(() => {
        if (!emblaApi) return;
        let paused = false;

        const interval = setInterval(() => {
            if (!paused) emblaApi.scrollNext();
        }, 2800);

        const wrapper = rootRef.current?.querySelector<HTMLElement>('.carousel-wrapper');
        const handleMouseEnter = () => { paused = true; };
        const handleMouseLeave = () => { paused = false; };
        wrapper?.addEventListener('mouseenter', handleMouseEnter);
        wrapper?.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            clearInterval(interval);
            wrapper?.removeEventListener('mouseenter', handleMouseEnter);
            wrapper?.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [emblaApi]);
    // ─── Load the Google Fonts used by this page (originally a <link> in <head>) ───
    useEffect(() => {
        const id = 'cloudpacs-fonts';
        if (document.getElementById(id)) return;
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href =
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap';
        document.head.appendChild(link);
    }, []);

    // ─── Scroll reveal ───
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        root.querySelectorAll('.section-label, .section-title, .section-sub').forEach((el) => {
            el.classList.add('reveal');
        });
        ['.feat-card', '.stat-card', '.learn-card', '.arch-point', '.team-card'].forEach((sel) => {
            root.querySelectorAll<HTMLElement>(sel).forEach((el, i) => {
                el.classList.add('reveal');
                el.style.transitionDelay = (i % 4) * 0.1 + 's';
            });
        });
        root.querySelectorAll('.mentor-block, .arch-diagram').forEach((el) => {
            el.classList.add('reveal');
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );
        root.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
            <div ref={rootRef} className="cloudpacs-landing">
            {/* ─── NAV ─── */}
            <nav>
                <div className="nav-brand">
                    <span className="nav-brand-dot"></span>
                    CloudPACS <span>by PostDICOM B.V.</span>
                </div>
                <div className="nav-links">
                    <a href="#features">Features</a>
                    <a href="#architecture">Architecture</a>
                    <a href="#stats">Impact</a>
                    <a href="#skills">Skills</a>
                    <a href="#team">Team</a>
                </div>
                <a href="#" className="nav-github">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" /></svg>
                    GitHub ↗
                </a>
            </nav>

            {/* ─── HERO ─── */}
            <section className="hero">
                <div className="hero-glow"></div>
                <div className="hero-inner">
                    <div className="hero-badge">PostDICOM Internship · Summer 2026</div>

                    <h1>From DICOM to diagnosis.<br /><em>Built for the cloud.</em></h1>

                    <p className="hero-sub">
                        A production-grade cloud PACS system — DICOM viewing with Cornerstone3D,
                        AI-assisted radiology reporting via local LLM, role-based access control,
                        and full CI/CD on Azure. Built from scratch in 12 weeks.
                    </p>

                    <div className="hero-btns">
                        <a href="#" className="btn-primary">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" /></svg>
                            View on GitHub
                        </a>
                        <a href="http://localhost:5173/login" className="btn-secondary" target="_blank" rel="noopener">Online demo (Work in progress)</a>
                    </div>

                    {/* ── Carousel (Embla) ── */}
                    <div className="carousel-wrapper">
                        <div className="carousel-viewport" ref={emblaRef}>
                            <div className="carousel-track" style={{ display: 'flex' }}>

                                <div className="carousel-slide" style={{ flex: '0 0 100%' }}>
                                    <img
                                        className="carousel-screenshot"
                                        src={DicomViewerImg}
                                        alt="CloudPACS DICOM viewer showing an echocardiogram with window/level, zoom, pan, and preset tools"
                                    />
                                </div>

                                <div className="carousel-slide" style={{ flex: '0 0 100%' }}>
                                    <img
                                        className="carousel-screenshot"
                                        src={AIReportImg}
                                        alt="AI-generated radiology report panel over the DICOM viewer, produced by a local LLM"
                                    />
                                </div>

                                <div className="carousel-slide" style={{ flex: '0 0 100%' }}>
                                    <img
                                        className="carousel-screenshot"
                                        src={UploadImg}
                                        alt="CloudPACS batch upload screen showing DICOM file drop zone and per-study upload progress"
                                    />
                                </div>

                                <div className="carousel-slide" style={{ flex: '0 0 100%' }}>
                                    <img
                                        className="carousel-screenshot"
                                        src={AdminPanelImg}
                                        alt="PostDICOM internal admin console showing client accounts, storage usage, and user counts"
                                    />
                                </div>

                                <div className="carousel-slide" style={{ flex: '0 0 100%' }}>
                                    <img
                                        className="carousel-screenshot"
                                        src={UnauthorizedImg}
                                        alt="Unauthorized access screen shown when a user attempts an action outside their role permissions"
                                    />
                                </div>

                            </div>{/* /carousel-track */}
                        </div>{/* /carousel-viewport */}

                        <div className="carousel-nav">
                            <button className="carousel-btn carousel-prev" onClick={scrollPrev}>←</button>
                            <div className="carousel-dots">
                                {CAROUSEL_LABELS.map((_, i) => (
                                    <button
                                        key={i}
                                        className={`carousel-dot${i === selectedIndex ? ' active' : ''}`}
                                        onClick={() => scrollTo(i)}
                                    />
                                ))}
                            </div>
                            <button className="carousel-btn carousel-next" onClick={scrollNext}>→</button>
                        </div>
                        <div className="carousel-label">{CAROUSEL_LABELS[selectedIndex]}</div>
                    </div>{/* /carousel-wrapper */}
                </div>
            </section>

            {/* ─── HERO → LIGHT FADE ─── */}
            <div className="hero-fade"></div>

            {/* ─── TECH STACK STRIP ─── */}
            <div className="stack-strip">
                <span className="stack-label">Built with</span>
                <span className="stack-badge" data-tip="Concurrent rendering, Suspense &amp; hooks-based architecture">React 18</span>
                <span className="stack-badge" data-tip="Strict typing across the entire frontend codebase">TypeScript</span>
                <span className="stack-badge" data-tip="Cross-platform REST API with minimal API pattern">.NET Core 8</span>
                <span className="stack-badge" data-tip="Primary language for all backend services">C#</span>
                <span className="stack-badge" data-tip="WebAssembly-powered DICOM rendering at 60 FPS">Cornerstone3D</span>
                <span className="stack-badge" data-tip="NoSQL document database — partition-key design for multi-tenancy">Azure CosmosDB</span>
                <span className="stack-badge" data-tip="Raw .dcm file storage — up to GBs per study, streamed to the viewer">Azure Blob Storage</span>
                <span className="stack-badge" data-tip="Microsoft's LLM orchestration SDK for the AI reporting pipeline">Semantic Kernel</span>
                <span className="stack-badge" data-tip="Runs the LLM locally — zero data egress, fully GDPR compliant">Ollama</span>
                <span className="stack-badge" data-tip="Multi-stage builds for lean, reproducible production images">Docker</span>
                <span className="stack-badge" data-tip="CI/CD pipeline — build, test and deploy on every merged PR">GitHub Actions</span>
                <span className="stack-badge" data-tip="Serverless container hosting with scale-to-zero on Azure">Azure Container Apps</span>
                <span className="stack-badge" data-tip="React component library — consistent, accessible UI across all screens">MUI v6</span>
            </div>

            {/* ─── FEATURES ─── */}
            <div id="features">
                <div className="section">
                    <div className="section-label">What we built</div>
                    <div className="section-title">A complete cloud PACS system — from upload to report.</div>
                    <div className="section-sub">Every layer built from scratch: a DICOM processing pipeline, a WebAssembly-powered viewer, a REST API, and a local AI reporting engine. No shortcuts.</div>

                    <div className="features-grid">

                        <div className="feat-card">
                            <div className="feat-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                            </div>
                            <div className="feat-title">DICOM Viewer — Cornerstone3D</div>
                            <div className="feat-desc">
                                Full-screen, dark-mode DICOM viewer powered by Cornerstone3D and a WebAssembly decoder.
                                Supports CT, MR, CR, and DX with Window/Level presets, Zoom, Pan, and multi-series
                                navigation. Rendered entirely in the browser — no server-side rendering.
                            </div>
                            <div className="feat-tags">
                                <span className="feat-tag">Cornerstone3D</span>
                                <span className="feat-tag">WebAssembly</span>
                                <span className="feat-tag">React 18</span>
                                <span className="feat-tag">W/L presets</span>
                                <span className="feat-tag">CT · MR · CR · DX</span>
                            </div>
                        </div>

                        <div className="feat-card">
                            <div className="feat-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" /></svg>
                            </div>
                            <div className="feat-title">AI-Assisted Reporting — Local LLM</div>
                            <div className="feat-desc">
                                One-click structured radiology report drafts, generated entirely on-premises.
                                Microsoft Semantic Kernel orchestrates the prompt pipeline; Ollama runs the LLM locally.
                                Zero patient data leaves the infrastructure — 100% GDPR-compliant by architecture.
                            </div>
                            <div className="feat-tags">
                                <span className="feat-tag">Semantic Kernel</span>
                                <span className="feat-tag">Ollama</span>
                                <span className="feat-tag">Local LLM</span>
                                <span className="feat-tag">GDPR by design</span>
                            </div>
                        </div>

                        <div className="feat-card">
                            <div className="feat-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" /><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" /></svg>
                            </div>
                            <div className="feat-title">Cloud Backend — REST API on Azure</div>
                            <div className="feat-desc">
                                .NET Core 8 REST API with a CosmosDB data layer and Azure Blob Storage for DICOM files.
                                The DICOM processing pipeline parses study metadata from file headers on upload, indexing
                                patients and studies automatically. Deployed to Azure Container Apps via GitHub Actions CI/CD.
                            </div>
                            <div className="feat-tags">
                                <span className="feat-tag">.NET Core 8</span>
                                <span className="feat-tag">C#</span>
                                <span className="feat-tag">Azure CosmosDB</span>
                                <span className="feat-tag">Blob Storage</span>
                                <span className="feat-tag">Docker</span>
                                <span className="feat-tag">GitHub Actions</span>
                            </div>
                        </div>

                        <div className="feat-card">
                            <div className="feat-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            </div>
                            <div className="feat-title">Security, RBAC &amp; Audit Logging</div>
                            <div className="feat-desc">
                                JWT authentication with role-based access control across four roles: Admin, Radiologist,
                                Uploader, and Viewer. Per-patient audit log records every access event. Invitation-only
                                user onboarding — no public registration. Designed with IEC 62304 compliance thinking.
                            </div>
                            <div className="feat-tags">
                                <span className="feat-tag">JWT auth</span>
                                <span className="feat-tag">RBAC</span>
                                <span className="feat-tag">Audit logging</span>
                                <span className="feat-tag">IEC 62304</span>
                                <span className="feat-tag">Invite-only</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* ─── ARCHITECTURE ─── */}
            <div id="architecture">
                <div className="section" style={{ maxWidth: '1100px' }}>
                    <div className="section-label">Architecture</div>
                    <div className="section-title">Full-stack. Cloud-native. Production-grade.</div>
                    <div className="section-sub">Every layer was designed and implemented by the team — not scaffolded or copy-pasted. The system follows real-world software engineering practices from day one.</div>
                    <div className="arch-grid">
                        <div className="arch-diagram">
                            <div className="arch-layer layer-fe">
                                <div className="arch-layer-icon icon-fe">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                                </div>
                                <div>
                                    <div className="arch-layer-name">Frontend</div>
                                    <div className="arch-layer-tech">React 18 · TypeScript · MUI v6 · Cornerstone3D</div>
                                </div>
                            </div>
                            <div className="arch-arrow">↕ REST API (HTTPS · JSON)</div>
                            <div className="arch-layer layer-be">
                                <div className="arch-layer-icon icon-be">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                                </div>
                                <div>
                                    <div className="arch-layer-name">Backend API</div>
                                    <div className="arch-layer-tech">.NET Core 8 · C# · REST · JWT · Azure Container Apps</div>
                                </div>
                            </div>
                            <div className="arch-arrow">↕ CosmosDB SDK &nbsp;·&nbsp; Blob SDK</div>
                            <div className="arch-layer layer-db">
                                <div className="arch-layer-icon icon-db">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" /><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" /></svg>
                                </div>
                                <div>
                                    <div className="arch-layer-name">Data Layer</div>
                                    <div className="arch-layer-tech">Azure CosmosDB (NoSQL) · Azure Blob Storage (DICOM files)</div>
                                </div>
                            </div>
                            <div className="arch-arrow">↕ HTTP (local network)</div>
                            <div className="arch-layer layer-ai">
                                <div className="arch-layer-icon icon-ai">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" /></svg>
                                </div>
                                <div>
                                    <div className="arch-layer-name">AI Layer</div>
                                    <div className="arch-layer-tech">Semantic Kernel · Ollama (local LLM) · Zero data egress</div>
                                </div>
                            </div>
                            <div className="arch-arrow">↑ Deploy via</div>
                            <div className="arch-layer layer-ci">
                                <div className="arch-layer-icon icon-ci">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" /></svg>
                                </div>
                                <div>
                                    <div className="arch-layer-name">CI / CD</div>
                                    <div className="arch-layer-tech">Docker · GitHub Actions · Azure Container Registry</div>
                                </div>
                            </div>
                        </div>
                        <div className="arch-points">
                            <div className="arch-point">
                                <div className="arch-point-title">DICOM processing pipeline</div>
                                <div className="arch-point-desc">Files are parsed on upload — the backend reads DICOM tags (PatientName, StudyDate, Modality) and automatically creates or updates patient and study records. No manual data entry required.</div>
                            </div>
                            <div className="arch-point">
                                <div className="arch-point-title">Multi-tenant SaaS model</div>
                                <div className="arch-point-desc">Separate PostDICOM Console for internal account management. Client accounts are isolated. Sub-users join via invitation link — no public registration. Every action is tied to a tenant.</div>
                            </div>
                            <div className="arch-point">
                                <div className="arch-point-title">Integration-tested data layer</div>
                                <div className="arch-point-desc">The CosmosDB layer is tested against the real Cosmos Emulator using xUnit and ASP.NET WebApplicationFactory. No mocks — the tests prove correctness against the real database engine.</div>
                            </div>
                            <div className="arch-point">
                                <div className="arch-point-title">Linear git history + branch protection</div>
                                <div className="arch-point-desc">Main branch is protected: PRs required, linear history enforced, CI must pass. Every change is traceable — the same standard used in regulated medical software teams.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── STATS ─── */}
            <div id="stats">
                <div className="section">
                    <div className="section-label">By the numbers</div>
                    <div className="section-title">12 weeks. Two production-ready applications.</div>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-num">12</div>
                            <div className="stat-label">Weeks of full-time development</div>
                            <div className="stat-sub">Jun – Sep 2026</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-num">4</div>
                            <div className="stat-label">Azure services integrated end to end</div>
                            <div className="stat-sub">CosmosDB · Blob Storage · Container Apps · Container Registry</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-num">2</div>
                            <div className="stat-label">Production applications built</div>
                            <div className="stat-sub">CloudPACS viewer · PostDICOM Console</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-num">0</div>
                            <div className="stat-label">Bytes of patient data sent to external AI</div>
                            <div className="stat-sub">Local Ollama · Semantic Kernel · GDPR compliant</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── SKILLS ─── */}
            <div id="skills">
                <div className="section" style={{ maxWidth: '1100px' }}>
                    <div className="section-label">Skills developed</div>
                    <div className="section-title">Real engineering. Real stack. Real impact.</div>
                    <div className="section-sub">Every week introduced production concepts that go directly onto a CV — not toy exercises.</div>
                    <div className="learn-grid">
                        <div className="learn-card">
                            <div className="learn-card-title">Backend Engineering</div>
                            <ul className="learn-card-items">
                                <li>.NET Core 8 REST API design</li>
                                <li>CosmosDB data modelling (NoSQL)</li>
                                <li>DICOM file parsing pipeline</li>
                                <li>JWT authentication &amp; RBAC</li>
                                <li>Integration testing with xUnit</li>
                                <li>Dependency injection patterns</li>
                            </ul>
                        </div>
                        <div className="learn-card">
                            <div className="learn-card-title">Frontend Engineering</div>
                            <ul className="learn-card-items">
                                <li>React 18 with TypeScript</li>
                                <li>MUI component library</li>
                                <li>Cornerstone3D DICOM viewer</li>
                                <li>Route-based auth guards</li>
                                <li>Bulk upload with progress UX</li>
                                <li>API integration &amp; error handling</li>
                            </ul>
                        </div>
                        <div className="learn-card">
                            <div className="learn-card-title">DevOps &amp; Cloud</div>
                            <ul className="learn-card-items">
                                <li>Docker multi-stage builds</li>
                                <li>GitHub Actions CI/CD pipelines</li>
                                <li>Azure Container Apps deployment</li>
                                <li>Azure CosmosDB &amp; Blob Storage</li>
                                <li>Branch protection &amp; linear history</li>
                                <li>AZ-900 Azure fundamentals</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── TEAM ─── */}
            <div id="team">
                <div className="section">
                    <div className="section-label">Built by</div>
                    <div className="section-title">Meet the team.</div>
                    <div className="section-sub">Two first-year CS students. One summer. One production system.</div>

                    <div className="team-grid">

                        <div className="team-card">
                            <div className="team-header">
                                <img className="team-photo" src="images/acelya.jpg" alt="Acelya Ecem Oksuz" />
                                <div>
                                    <div className="team-name">Acelya Ecem Oksuz</div>
                                    <div className="team-uni">King's College London · BSc Computer Science</div>
                                    <a href="https://linkedin.com/in/acelya-ecem-oksuz" className="team-linkedin" target="_blank" rel="noopener">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                        LinkedIn
                                    </a>
                                </div>
                            </div>
                            <blockquote className="team-quote">
                                <p>"My biggest hurdle was orchestrating the WebAssembly worker lifecycle in React 18 — getting the DICOM decoder to run off the main thread without blocking the UI took a week to get right."</p>
                            </blockquote>
                            <div className="team-quote-note">↳ Key challenge · Frontend &amp; DICOM viewer</div>
                        </div>

                        <div className="team-card">
                            <div className="team-header">
                                <img className="team-photo" src="images/ibrahim.jpg" alt="Ibrahim Cem Oksuz" />
                                <div>
                                    <div className="team-name">Ibrahim Cem Oksuz</div>
                                    <div className="team-uni">University of Birmingham · BSc Computer Science</div>
                                    <a href="https://linkedin.com/in/ibrahim-cem-oksuz" className="team-linkedin" target="_blank" rel="noopener">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                        LinkedIn
                                    </a>
                                </div>
                            </div>
                            <blockquote className="team-quote">
                                <p>"Designing a partition-key strategy in CosmosDB that scales to millions of records while keeping queries fast was genuinely eye-opening. The wrong choice early on would have killed performance at scale."</p>
                            </blockquote>
                            <div className="team-quote-note">↳ Key challenge · Backend &amp; data layer</div>
                        </div>

                    </div>

                    {/* Mentor endorsement */}
                    <div className="mentor-block">
                        <span className="mentor-quote-mark">"</span>
                        <p className="mentor-quote-text">This isn't a student project. It's a production-grade system built with the same engineering rigour we apply at PostDICOM B.V. — real architecture decisions, real trade-offs, and real code running in a live medical imaging environment. I'd hire them both today.</p>
                        <div className="mentor-attribution">
                            <div className="mentor-avatar">OG</div>
                            <div>
                                <div className="mentor-name">Omer Gokcen</div>
                                <div className="mentor-title">Software Engineer, PostDICOM B.V. · Internship Mentor</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* ─── FOOTER ─── */}
            <footer>
                <div>
                    <div className="footer-brand">CloudPACS · PostDICOM B.V.</div>
                    <div className="footer-sub">Acelya Ecem Oksuz &amp; Ibrahim Cem Oksuz · Summer Internship 2026 · PostDICOM B.V., Netherlands</div>
                </div>
                <div className="footer-stack">
                    <span className="footer-tag">React 18</span>
                    <span className="footer-tag">TypeScript</span>
                    <span className="footer-tag">.NET Core 8</span>
                    <span className="footer-tag">Azure</span>
                    <span className="footer-tag">Cornerstone3D</span>
                    <span className="footer-tag">Ollama</span>
                    <span className="footer-tag">Semantic Kernel</span>
                    <span className="footer-tag">Docker</span>
                </div>
            </footer>
        </div>
    );
}