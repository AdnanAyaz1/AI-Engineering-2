const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function create10xDevsPDF() {
  const pdfDoc = await PDFDocument.create();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const pageWidth = 612; // 8.5 x 11 inches (Letter)
  const pageHeight = 792;
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const darkTeal = rgb(0.05, 0.45, 0.42);
  const slateDark = rgb(0.08, 0.1, 0.14);
  const slateGray = rgb(0.35, 0.4, 0.45);
  const lightGray = rgb(0.88, 0.9, 0.92);
  const cardBg = rgb(0.96, 0.97, 0.98);

  function drawHeaderFooter(page, pageNum, totalPages) {
    // Header
    page.drawText('10xDevs Inc. | Corporate Fact Sheet & Capability Brief', {
      x: margin,
      y: pageHeight - 35,
      size: 8.5,
      font: fontRegular,
      color: slateGray,
    });

    page.drawLine({
      start: { x: margin, y: pageHeight - 42 },
      end: { x: pageWidth - margin, y: pageHeight - 42 },
      thickness: 0.75,
      color: lightGray,
    });

    // Footer
    page.drawLine({
      start: { x: margin, y: 45 },
      end: { x: pageWidth - margin, y: 45 },
      thickness: 0.75,
      color: lightGray,
    });

    page.drawText('Confidential | https://10xdevs.com | enterprise@10xdevs.com', {
      x: margin,
      y: 30,
      size: 8,
      font: fontRegular,
      color: slateGray,
    });

    const pageStr = `Page ${pageNum} of ${totalPages}`;
    const pageStrWidth = fontRegular.widthOfTextAtSize(pageStr, 8);
    page.drawText(pageStr, {
      x: pageWidth - margin - pageStrWidth,
      y: 30,
      size: 8,
      font: fontRegular,
      color: slateGray,
    });
  }

  // ==========================================
  // PAGE 1: Profile, Core Facts & Tech Stack
  // ==========================================
  const page1 = pdfDoc.addPage([pageWidth, pageHeight]);
  drawHeaderFooter(page1, 1, 3);

  let y = pageHeight - 75;

  // Title badge
  page1.drawRectangle({
    x: margin,
    y: y - 5,
    width: 145,
    height: 18,
    color: rgb(0.92, 0.97, 0.96),
    borderColor: darkTeal,
    borderWidth: 0.5,
  });
  page1.drawText('ENTERPRISE PROFILE 2026', {
    x: margin + 8,
    y: y,
    size: 8.5,
    font: fontBold,
    color: darkTeal,
  });
  y -= 30;

  // Main Title
  page1.drawText('10xDevs: Engineering Excellence & Verified Facts', {
    x: margin,
    y: y,
    size: 19,
    font: fontBold,
    color: slateDark,
  });
  y -= 18;

  page1.drawText('Full-Stack Software Engineering, Cloud-Native Modernization & Autonomous AI Systems', {
    x: margin,
    y: y,
    size: 10,
    font: fontOblique,
    color: slateGray,
  });
  y -= 25;

  // Executive Summary Box
  page1.drawRectangle({
    x: margin,
    y: y - 55,
    width: contentWidth,
    height: 65,
    color: cardBg,
    borderColor: lightGray,
    borderWidth: 0.75,
  });
  page1.drawText('Executive Summary', {
    x: margin + 12,
    y: y - 10,
    size: 10.5,
    font: fontBold,
    color: darkTeal,
  });
  page1.drawText('Founded in 2021 and headquartered in San Francisco with hubs in London and Austin, 10xDevs is a premier software engineering consultancy. We specialize in building mission-critical web applications, high-throughput distributed backends, and production-grade RAG and autonomous AI agent systems for scale-ups and Fortune 500 enterprises.', {
    x: margin + 12,
    y: y - 26,
    size: 8.5,
    font: fontRegular,
    color: slateDark,
    lineHeight: 12,
    maxWidth: contentWidth - 24,
  });
  y -= 80;

  // Key Verified Facts & Metrics (Cards Grid)
  page1.drawText('Key Operational Facts & Performance Metrics', {
    x: margin,
    y: y,
    size: 13,
    font: fontBold,
    color: slateDark,
  });
  y -= 16;

  const facts = [
    { title: '140+ Deployed Systems', desc: 'Over 140 enterprise applications shipped into live production environments with zero critical rollback incidents.' },
    { title: '99.98% Infrastructure SLA', desc: 'Average uptime achieved across managed cloud and Kubernetes clusters hosting over 2.4M daily active users.' },
    { title: '3.4x Faster Time-to-Market', desc: 'Average acceleration in customer feature delivery compared to traditional enterprise software consultancies.' },
    { title: '85+ Senior Engineers', desc: '100% staff and principal level engineers with minimum 7+ years production experience. Zero offshore outsourcing.' },
    { title: 'SOC 2 Type II & HIPAA', desc: 'Enterprise security compliance audited annually. Fully compliant with GDPR, CCPA, and ISO/IEC 27001 standards.' },
    { title: 'Sub-45ms Cloud Latency', desc: 'Global multi-region edge deployment architectures cutting 95th percentile response times below 45 milliseconds.' },
  ];

  const cardW = (contentWidth - 12) / 2;
  const cardH = 46;

  facts.forEach((item, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cx = margin + col * (cardW + 12);
    const cy = y - row * (cardH + 8) - cardH;

    page1.drawRectangle({
      x: cx,
      y: cy,
      width: cardW,
      height: cardH,
      color: rgb(0.99, 0.99, 1.0),
      borderColor: lightGray,
      borderWidth: 0.75,
    });

    page1.drawText(item.title, {
      x: cx + 8,
      y: cy + cardH - 14,
      size: 9.5,
      font: fontBold,
      color: darkTeal,
    });

    page1.drawText(item.desc, {
      x: cx + 8,
      y: cy + cardH - 26,
      size: 7.5,
      font: fontRegular,
      color: slateDark,
      lineHeight: 9.5,
      maxWidth: cardW - 16,
    });
  });

  y -= (cardH + 8) * 3 + 15;

  // Technology Stack Section
  page1.drawText('Core Enterprise Technology Stack', {
    x: margin,
    y: y,
    size: 13,
    font: fontBold,
    color: slateDark,
  });
  y -= 16;

  const techRows = [
    { category: 'Frontend & UI Engineering:', stack: 'Next.js 15/16 App Router, React 19, TypeScript, Tailwind CSS, WebSockets, PWAs' },
    { category: 'Backend & High-Throughput APIs:', stack: 'Go, Rust, Python (FastAPI), Node.js (TypeScript), gRPC, GraphQL, REST' },
    { category: 'AI, LLMs & Vector Retrieval:', stack: 'PostgreSQL pgvector, LangGraph, LangChain, Groq LPU, OpenAI, Anthropic Claude' },
    { category: 'Cloud Infrastructure & DevOps:', stack: 'AWS (EKS, Lambda), Google Cloud (GKE), Azure, Kubernetes, Terraform, ArgoCD' },
    { category: 'Data Stores & Caching:', stack: 'PostgreSQL 16, Redis Enterprise, Apache Kafka, ClickHouse, Neon Serverless' },
  ];

  techRows.forEach((tr) => {
    page1.drawText(tr.category, {
      x: margin + 6,
      y: y,
      size: 8.5,
      font: fontBold,
      color: darkTeal,
    });
    page1.drawText(tr.stack, {
      x: margin + 170,
      y: y,
      size: 8.5,
      font: fontRegular,
      color: slateDark,
    });
    y -= 15;
  });

  // ==========================================
  // PAGE 2: Detailed Service Offerings & QA
  // ==========================================
  const page2 = pdfDoc.addPage([pageWidth, pageHeight]);
  drawHeaderFooter(page2, 2, 3);

  y = pageHeight - 75;

  page2.drawText('Specialized Engineering Practices', {
    x: margin,
    y: y,
    size: 18,
    font: fontBold,
    color: slateDark,
  });
  y -= 16;
  page2.drawText('Enterprise deliverables built with strict adherence to security, reliability, and speed.', {
    x: margin,
    y: y,
    size: 9.5,
    font: fontRegular,
    color: slateGray,
  });
  y -= 25;

  const services = [
    {
      title: '1. Cloud-Native Modernization & Kubernetes Fleet Management',
      highlight: 'Zero-Downtime Microservices & GitOps Delivery',
      bullets: [
        'Multi-cloud Kubernetes architecture on AWS EKS and Google Cloud GKE with autoscaling based on custom traffic metrics.',
        'Continuous Deployment via GitOps (ArgoCD & Flux), reducing deployment failure rates to under 0.02%.',
        'Infrastructure as Code (IaC) with modular Terraform and OpenTofu for automated multi-region failover (RTO < 3 min, RPO < 30 sec).',
        'Observability stack with distributed tracing (OpenTelemetry, Grafana, Prometheus) monitoring 100,000+ metric points.',
      ],
    },
    {
      title: '2. Enterprise Retrieval-Augmented Generation (RAG) & Agentic AI',
      highlight: 'Sub-200ms Inference & Hallucination-Gated Reasoning',
      bullets: [
        'High-dimensional vector storage with pgvector and hybrid dense/sparse semantic indexing across unstructured corpora.',
        'Stateful autonomous multi-agent pipelines with LangGraph featuring human-in-the-loop validation and budget gates.',
        'Groq LPU hardware acceleration delivering 500+ tokens/second for real-time customer-facing interactions.',
        'Strict guardrails and automated evaluator agents that cross-check every model response against cited source chunks.',
      ],
    },
    {
      title: '3. High-Velocity Full-Stack Product Engineering',
      highlight: 'End-to-End Modern Web & Mobile Applications',
      bullets: [
        'Server-Side Rendered (SSR) Next.js web applications engineered for 98+ Google Lighthouse Core Web Vitals.',
        'Accessible, design-system driven interfaces complying with WCAG 2.2 AAA guidelines.',
        'Event-driven asynchronous background task processing using Redis and Celery/BullMQ with guaranteed idempotency.',
        'End-to-end type safety across the database, server API, and frontend client using Prisma ORM and TypeScript.',
      ],
    },
  ];

  services.forEach((srv) => {
    page2.drawRectangle({
      x: margin,
      y: y - 110,
      width: contentWidth,
      height: 120,
      color: cardBg,
      borderColor: lightGray,
      borderWidth: 0.75,
    });

    page2.drawText(srv.title, {
      x: margin + 12,
      y: y - 2,
      size: 11,
      font: fontBold,
      color: darkTeal,
    });

    page2.drawText(srv.highlight, {
      x: margin + 12,
      y: y - 16,
      size: 8.5,
      font: fontOblique,
      color: slateGray,
    });

    let by = y - 32;
    srv.bullets.forEach((bullet) => {
      page2.drawCircle({
        x: margin + 16,
        y: by + 2.5,
        size: 2,
        color: darkTeal,
      });
      page2.drawText(bullet, {
        x: margin + 25,
        y: by,
        size: 8,
        font: fontRegular,
        color: slateDark,
        maxWidth: contentWidth - 40,
        lineHeight: 10,
      });
      by -= 18;
    });

    y -= 130;
  });

  // Quality Assurance & Engineering Standards
  y -= 5;
  page2.drawText('Engineering Governance & Quality Standards', {
    x: margin,
    y: y,
    size: 12.5,
    font: fontBold,
    color: slateDark,
  });
  y -= 16;

  const standards = [
    'Test-Driven Development (TDD): Mandatory 85%+ automated unit and integration test coverage on every merge.',
    'Daily Automated Vulnerability Scanning: Static Application Security Testing (SAST) & automated dependency patching.',
    'Rigorous Peer Review Protocol: Two principal engineer sign-offs required for any production code changes.',
    'Zero Production Secrets Leaks: Secrets managed strictly through HashiCorp Vault, AWS Secrets Manager, and Doppler.',
  ];

  standards.forEach((std) => {
    page2.drawText(`- ${std}`, {
      x: margin + 8,
      y: y,
      size: 8,
      font: fontRegular,
      color: slateDark,
    });
    y -= 14;
  });

  // ==========================================
  // PAGE 3: Case Studies, Client ROI & Contact
  // ==========================================
  const page3 = pdfDoc.addPage([pageWidth, pageHeight]);
  drawHeaderFooter(page3, 3, 3);

  y = pageHeight - 75;

  page3.drawText('Verified Client Case Studies & Measurable ROI', {
    x: margin,
    y: y,
    size: 18,
    font: fontBold,
    color: slateDark,
  });
  y -= 16;
  page3.drawText('Concrete client results delivered across financial services, healthcare, and enterprise commerce.', {
    x: margin,
    y: y,
    size: 9.5,
    font: fontRegular,
    color: slateGray,
  });
  y -= 25;

  const caseStudies = [
    {
      client: 'Case Study 1: FinTech High-Frequency Payments Engine',
      industry: 'Global Payments Scale-Up | 18M Transactions / Month',
      challenge: 'Legacy Ruby/MySQL payments monolithic backend collapsing during 15,000 req/sec flash-sale transaction surges with 850ms latency.',
      solution: '10xDevs designed a distributed event-driven engine in Go and Kafka on AWS EKS with sub-second optimistic concurrency locks.',
      metrics: [
        'Throughput expanded 3.2x to 48,000 requests/sec with zero dropped payments.',
        'P99 transaction latency plummeted from 850ms to 38ms (95.5% latency reduction).',
        'Cloud hosting spend cut by $220,000 per year via intelligent container auto-binpacking.',
      ],
    },
    {
      client: 'Case Study 2: HealthTech Clinical Knowledge Intelligence Engine',
      industry: 'Healthcare Technology Provider | HIPAA & SOC 2 Regulated',
      challenge: 'Clinicians spent 45 minutes per case manually searching 12 million fragmented medical research papers and EHR summaries.',
      solution: '10xDevs built a hybrid vector search engine using pgvector, LangGraph medical verification agents, and secure audit logging.',
      metrics: [
        'Diagnostic retrieval accuracy increased from 61.4% to 94.8% on standard clinical benchmarks.',
        'Doctor inquiry turnaround time plummeted by 76% (saving 34 minutes per complex patient review).',
        'Passed external SOC 2 Type II and HIPAA security audit with zero non-conformities.',
      ],
    },
    {
      client: 'Case Study 3: Global Retail B2B Marketplace Modernization',
      industry: 'Fortune 500 Enterprise Retailer | $1.4B GMV',
      challenge: 'Sluggish legacy monolith with 5.1s mobile load times, causing a 64% cart abandonment rate on wholesale vendor checkouts.',
      solution: 'Engineered a headless Next.js frontend with Edge API caching, unified search, and real-time inventory synchronization.',
      metrics: [
        'Lighthouse performance score jumped from 32 to 99 on mobile devices.',
        'Checkout drop-off dropped by 41%, driving $4.8M in attributed incremental quarterly revenue.',
      ],
    },
  ];

  caseStudies.forEach((cs) => {
    page3.drawRectangle({
      x: margin,
      y: y - 110,
      width: contentWidth,
      height: 118,
      color: cardBg,
      borderColor: lightGray,
      borderWidth: 0.75,
    });

    page3.drawText(cs.client, {
      x: margin + 12,
      y: y - 2,
      size: 10.5,
      font: fontBold,
      color: darkTeal,
    });

    page3.drawText(cs.industry, {
      x: margin + 12,
      y: y - 15,
      size: 8,
      font: fontOblique,
      color: slateGray,
    });

    page3.drawText(`Challenge: ${cs.challenge}`, {
      x: margin + 12,
      y: y - 29,
      size: 7.5,
      font: fontRegular,
      color: slateDark,
      maxWidth: contentWidth - 24,
      lineHeight: 9.5,
    });

    page3.drawText(`Solution: ${cs.solution}`, {
      x: margin + 12,
      y: y - 50,
      size: 7.5,
      font: fontRegular,
      color: slateDark,
      maxWidth: contentWidth - 24,
      lineHeight: 9.5,
    });

    let my = y - 73;
    page3.drawText('Measurable Business Impact:', {
      x: margin + 12,
      y: my,
      size: 8,
      font: fontBold,
      color: darkTeal,
    });
    my -= 11;

    cs.metrics.forEach((m) => {
      page3.drawText(`*  ${m}`, {
        x: margin + 16,
        y: my,
        size: 7.5,
        font: fontBold,
        color: slateDark,
      });
      my -= 10;
    });

    y -= 126;
  });

  // Engagement Models & Contact Card
  page3.drawRectangle({
    x: margin,
    y: y - 48,
    width: contentWidth,
    height: 56,
    color: rgb(0.92, 0.96, 0.96),
    borderColor: darkTeal,
    borderWidth: 0.75,
  });

  page3.drawText('Engagement Models & Getting Started', {
    x: margin + 12,
    y: y - 8,
    size: 10,
    font: fontBold,
    color: darkTeal,
  });

  page3.drawText('1. Dedicated Engineering Pods (Lead + 3-5 Senior Engineers)   |   2. Fixed-Scope Modernization Sprints (2-6 Weeks)\n3. Architectural & AI Feasibility Audit (2-Week Deliverable)      |   Contact: enterprise@10xdevs.com | https://10xdevs.com', {
    x: margin + 12,
    y: y - 22,
    size: 8,
    font: fontRegular,
    color: slateDark,
    lineHeight: 11,
  });

  // Save PDF
  const pdfBytes = await pdfDoc.save();

  // Save to public directory for direct download/viewing
  const publicPath = path.join(process.cwd(), 'public', '10xdevs_company_facts.pdf');
  fs.writeFileSync(publicPath, pdfBytes);

  // Also save to data directory
  const dataPath = path.join(process.cwd(), 'data', '10xdevs_company_facts.pdf');
  fs.writeFileSync(dataPath, pdfBytes);

  console.log(`PDF generated successfully:`);
  console.log(`- Public URL: ${publicPath} (size: ${pdfBytes.length} bytes)`);
  console.log(`- Data Path: ${dataPath}`);
}

create10xDevsPDF().catch((err) => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
