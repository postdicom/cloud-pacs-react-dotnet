Overview:
Mini Cloud PACS is a production-grade cloud medical imaging platform designed for clinicians to securely store, retrieve, and view medical scans. Built with a multi-tenant architecture, the ecosystem consists of two separate applications sharing a unified .NET backend:
CloudPACS: A clinical interface for managing patients, studies, series, and instances, featuring an interactive in-browser DICOM viewer and AI-assisted reporting. 

PostDICOM Console: A dedicated internal administration tool used to manage client accounts, monitor storage quotas, and handle user access across the platform. Built with strict adherence to IEC 62304 (Software as a Medical Device) and GDPR standards, this project prioritizes data privacy, role-based access control, and complete audit traceability.

Key Features:
Interactive DICOM Viewer: Integrates Cornerstone3D for advanced in-browser rendering of `.dcm` files, supporting interactive window/level adjustments, zoom, pan, and series navigation without leaving the application.

Privacy-First AI Reporting: Utilizes a local LLM (llama3.3:70b) via Ollama and Microsoft Semantic Kernel to generate structured radiology report drafts. Clinical context is processed entirely on-premise, ensuring zero patient identifiers are sent to external AI services.

Robust DICOM Pipeline: Features a drag-and-drop upload interface that leverages `fo-dicom` to parse raw binary files and extract DICOM tags. Structured metadata is indexed in Azure CosmosDB, while binary blobs are securely stored in Azure Blob Storage and accessed via time-limited SAS URLs.

Multi-Tenant Architecture: Employs CosmosDB partition keys (e.g., partitioning by `accountId` or `customerId`) to isolate tenant data efficiently, preventing cross-tenant data leakage while maintaining sub-millisecond query performance.

IEC 62304 & GDPR Compliance: Implements rigorous Role-Based Access Control (Admin, Radiologist, Viewer) via JWT claims and comprehensive audit logging. Every image view, file upload, deletion, and AI report generation is tracked with user IDs, timestamps, and IP addresses.

Tech Stack
Frontend: React 18, TypeScript, Vite, Material UI (MUI v5), TanStack Query, React Hook Form, Cornerstone3D.

Backend: C# / .NET Core 10 Web API, JWT Authentication, BCrypt, `fo-dicom`.

Database & Storage: Azure CosmosDB, Azure Blob Storage.

AI & Machine Learning: Microsoft Semantic Kernel, Ollama (llama3.3:70b).

DevSecOps & Infrastructure: Docker, Docker Compose, GitHub Actions (CI/CD), Azure Container Apps, GitHub Dependabot, CodeQL.op