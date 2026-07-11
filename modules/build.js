// Build Workspace & Business Blueprint Compiler for AI-OS
// Powered by A.R. Labs

import { state } from './core.js';
import { showToast } from './utils.js';
import { isUserAuthenticated } from './auth.js';
import { showPricingModal } from './ui.js';
import { updateConversionFunnel } from './expand.js';
import { awardXP, completeMissionTask } from './gamification.js';

const launchpadIdeas = {
  'agency': {
    title: "AI Business Automation",
    desc: "Deploy conversational lead-capture chat bots, CRM database synchronizers, and intake form workflows for client services.",
    retail: {
      setup: "₹1,500 (Domain registration + clean custom email address)",
      monthly: "₹4,200 (Make.com core plan + OpenAI token usage + Voiceflow setup)",
      profit: "₹80,000 - ₹3,50,000 / month",
      tools: "Make.com, Voiceflow, ChatGPT API, Google Drive APIs",
      skills: "API webhook configurations, prompt structuring, client discovery",
      registration: "Sole Proprietorship initially. Transition to One Person Company (OPC) once monthly retainer exceeds ₹1,50,000.",
      marketing: "Configure Programmatic SEO directory sites targetting '[City Name] Realtor Automations' + cold outreach DMs.",
      sales: "Build a basic real estate booking bot mockup and send a 3-minute video showcase to local agency directors.",
      automation: "Webhooks sync lead capture records directly to client CRM spreadsheet rows while firing Slack client alert pings.",
      risks: "API model updates changing bot output tones, client churn, setting up wrong webhooks.",
      timeline: "14 - 30 days to close first client retainer.",
      checklist: [
        "1. Build landing portal displaying realtor conversational lead booking bot demo.",
        "2. Locate 40 regional realtors on Google Maps and LinkedIn.",
        "3. Pitch Loom audit illustrating how bots reduce booking leakage by 60%.",
        "4. Close setup agreement and link Make.com pipeline nodes."
      ]
    },
    ecommerce: {
      setup: "₹2,500",
      monthly: "₹6,000",
      profit: "₹1,20,000 - ₹4,50,000 / month",
      tools: "Make.com, ActiveCampaign, ChatGPT API, E-Commerce App Marketplace",
      skills: "Email sequence structuring, cart abandon script setups",
      registration: "Sole Proprietorship. Register as Private Limited for foreign remittances.",
      marketing: "Audit brands using BuiltWith and email marketing directors with specific cart recovery recommendations.",
      sales: "Charge a performance retainer (e.g. 15% cut on all recovered shopping carts).",
      automation: "Triggers sync checkout abandonment tags to personalized email reminders containing AI copywriting.",
      risks: "Email deliverability limits, E-Commerce API access modifications.",
      timeline: "10 - 25 days.",
      checklist: [
        "1. Configure Make triggers for cart checkouts.",
        "2. Identify 30 E-Commerce brands in directory portals.",
        "3. Pitch email recovery improvements.",
        "4. Verify sequence delivery reports."
      ]
    },
    health: {
      setup: "₹1,500",
      monthly: "₹5,000",
      profit: "₹1,00,000 - ₹3,80,000 / month",
      tools: "Make, Voiceflow, HIPAA-compliant storage configs, WhatsApp Business API",
      skills: "Data compliance guidelines, conversational flows",
      registration: "Sole Proprietorship. Transition to Partnership or LLC for legal shield.",
      marketing: "Target local dental or wellness clinic owners with a WhatsApp appointment-auto-confirm system outline.",
      sales: "Present a case study of a local clinic reducing phone support workloads by 70% using WhatsApp automation.",
      automation: "Booking bot automatically updates scheduling calendars, confirms appointments, and alerts administrative staff.",
      risks: "Data privacy regulations, wrong calendars booking syncs.",
      timeline: "15 - 30 days.",
      checklist: [
        "1. Create a dental/health booking bot script template.",
        "2. Target local clinic directors with WhatsApp templates.",
        "3. Close setup retainer and synchronize database appointments."
      ]
    },
    education: {
      setup: "₹1,200",
      monthly: "₹3,500",
      profit: "₹60,000 - ₹2,20,000 / month",
      tools: "Make, Zoom API, Loom, Google Classroom APIs",
      skills: "Learning flow setups, document templates",
      registration: "Sole Proprietorship.",
      marketing: "Target private tutors or content creators with auto-quiz generators and lesson organizers.",
      sales: "Offer custom course templates for an upfront ₹25,000 setup fee.",
      automation: "Signup events trigger lesson scheduling and generate completion certificates automatically.",
      risks: "Student churn, video bandwidth costs.",
      timeline: "7 - 20 days.",
      checklist: [
        "1. Build automated certificate and quiz generators.",
        "2. Contact local tutors and coaches.",
        "3. Deploy course workflows and sync signups."
      ]
    }
  },
  'dropservicing': {
    title: "Online Service Business",
    desc: "Broker high-value digital services (web design, copywriting, video editing) by securing contracts and outsourcing delivery to vetted contractors.",
    retail: {
      setup: "₹1,000 (Domain + basic landing site builder)",
      monthly: "₹2,500 (CRM tool + outreach sequencing software)",
      profit: "₹75,000 - ₹3,00,000 / month",
      tools: "Webflow, Loom, Google Forms, Freelance portals",
      skills: "High-ticket sales, project management, contractor vetting",
      registration: "Sole Proprietorship. LLC once cash flows stabilize.",
      marketing: "Build a premium niche portfolio site (e.g. 'Custom Web Design for Real Estate Brokers').",
      sales: "Outbound outreach pitching site upgrades, charging ₹80,000 flat setup fee.",
      automation: "Client feedback forms map updates directly to contractor project boards via Trello integrations.",
      risks: "Contractor delays or poor output quality, client communication delays.",
      timeline: "15 - 40 days.",
      checklist: [
        "1. Vett 3 high-quality UI designers on Behance and agree on hourly pricing.",
        "2. Build client-facing site presenting premium visual examples.",
        "3. Reach out to 50 realtors with outdated sites.",
        "4. Close client deal, pay contractor 40%, and keep 60% arbitrage margin."
      ]
    },
    ecommerce: {
      setup: "₹1,000",
      monthly: "₹3,000",
      profit: "₹90,000 - ₹4,00,000 / month",
      tools: "Outreach CRM, Upwork, Make.com",
      skills: "Product-led sales, client onboarding",
      registration: "Sole Proprietorship.",
      marketing: "Pitch E-commerce brands high-converting video ad edits for social media channels.",
      sales: "Sell video packs (10 ads/month) for a monthly recurring retainer of ₹50,000.",
      automation: "Dropbox automation pulls raw assets, alerts the video editor, and syncs finalized reviews.",
      risks: "Fluctuating ad platform compliance rules, contractor availability.",
      timeline: "10 - 30 days.",
      checklist: [
        "1. Contract 2 expert video editors.",
        "2. Direct-message active e-commerce brands running ads.",
        "3. Close monthly video retainer.",
        "4. Delegate editing tasks and track delivery."
      ]
    }
  },
  'micro-saas': {
    title: "Software Business",
    desc: "Launch a single-feature software tool that solves a highly specific operational task, monetizing via low-cost monthly subscriptions.",
    retail: {
      setup: "₹3,500 (API server + domain + database config)",
      monthly: "₹5,000 (Vercel hosting + Supabase + OpenAI APIs + Stripe API)",
      profit: "₹1,50,000 - ₹8,00,000 / month",
      tools: "Next.js, Tailwind, Supabase, OpenAI, Resend",
      skills: "JavaScript/React development, basic API routing, product design",
      registration: "Private Limited or LLP immediately to protect software assets.",
      marketing: "Submit product to AI directories (ProductHunt, TheresAnAIForThat) + programmatic content.",
      sales: "Set pricing at ₹1,500/month per user account with a free 7-day trial.",
      automation: "User accounts, billing portals, and API keys are provisioned automatically.",
      risks: "Server down-time, OpenAI billing scale spikes, competitors launching identical clones.",
      timeline: "30 - 60 days.",
      checklist: [
        "1. Build a single-page tool: e.g., 'Real Estate AI Description Writer'.",
        "2. Integrate Supabase Auth and Stripe checkout links.",
        "3. List product on directories and launch organic search campaigns.",
        "4. Optimize product UX based on client feedback metrics."
      ]
    },
    ecommerce: {
      setup: "₹4,000",
      monthly: "₹6,000",
      profit: "₹2,00,000 - ₹12,00,000 / month",
      tools: "Next.js, E-Commerce Cart Automation Matrix, Supabase, OpenAI",
      skills: "E-Commerce API, backend database schema",
      registration: "Private Limited.",
      marketing: "List app on the E-Commerce App Marketplace, optimizing for keywords like 'AI product reviews' or 'SEO tagger'.",
      sales: "Freemium plan: Free up to 100 products, then ₹2,500/month.",
      automation: "Platform installation captures account details and configures synchronization automatically.",
      risks: "E-Commerce store bans, review ratings drops, API changes.",
      timeline: "30 - 90 days.",
      checklist: [
        "1. Write single-feature app for product tag generation.",
        "2. Submit app to E-Commerce App Marketplace validation.",
        "3. Run targeted installs campaigns.",
        "4. Upsell premium subscription models."
      ]
    }
  },
  'creator': {
    title: "Content Creator Business",
    desc: "Build a highly-targeted content brand using AI video scripting tools, monetizing via sponsorships, templates, and courses.",
    retail: {
      setup: "₹0 (Free social accounts + organic editing tools)",
      monthly: "₹1,500 (AI video generation + captioning templates)",
      profit: "₹50,000 - ₹2,50,000 / month",
      tools: "CapCut, ElevenLabs, ChatGPT, Gumroad, Canva",
      skills: "Video storytelling, script structure, content hook design",
      registration: "Sole Proprietorship. LLC once sponsorship revenues emerge.",
      marketing: "Publish daily vertical content explaining business mechanics and automation tips.",
      sales: "Monetize by selling copy-paste template bundles on Gumroad at ₹750/download.",
      automation: "Gumroad delivery fires immediately, updating customer directories and newsletter lists.",
      risks: "Algorithm updates limiting reach, audience fatigue.",
      timeline: "30 - 90 days.",
      checklist: [
        "1. Create social channels focused on 'How to automate local businesses'.",
        "2. Generate 10 videos showing active visual workflows.",
        "3. Build a digital template pack on Gumroad.",
        "4. Direct traffic to bio link."
      ]
    },
    ecommerce: {
      setup: "₹500",
      monthly: "₹2,000 (Gemini Omni / Kling AI video rendering allocations)",
      profit: "₹70,000 - ₹3,00,000 / month",
      tools: "CapCut, ChatGPT, affiliate program links",
      skills: "Affiliate marketing, video editing",
      registration: "Sole Proprietorship.",
      marketing: "Review e-commerce gadgets on camera using interactive hooks.",
      sales: "Place affiliate purchase links in bio descriptions (capturing 5-15% commission).",
      automation: "Affiliate dashboard tracks conversions and schedules payouts.",
      risks: "Affiliate program changes, account bans.",
      timeline: "20 - 60 days.",
      checklist: [
        "1. Setup affiliate program relationships (Amazon, EarnKaro).",
        "2. Create short content reviews of trending gadgets.",
        "3. Include affiliate links in description bios.",
        "4. Scale video content volume."
      ]
    }
  },
  'agency_video_ad': {
    title: "Video Advertisement Business",
    desc: "Transform a single product or brand image into a premium commercial video ad using keyframe interpolation and motion vector blueprints.",
    retail: {
      setup: "₹1,500 (Domain + safe professional email mapping)",
      monthly: "₹4,500 (Motion Script Compiler Pipeline API credits + mid-tier image models)",
      profit: "₹90,000 - ₹3,50,000 / month",
      tools: "Motion Script Compiler Pipeline, Google Veo, OmniFlash, ChatGPT, Midjourney",
      skills: "Storyboard expansion, motion vector prompt engineering, asset standardization",
      registration: "Sole Proprietorship initially. Transition to LLC as campaigns scale.",
      marketing: "Target local e-commerce and retail brands with high-quality spec video ads.",
      sales: "Charge a flat retainership for weekly high-retention video ad creatives.",
      automation: "Product image uploaded -> Universal Storyboard prompt generates 9-frame layout -> Motion Script Compiler Pipeline JSON prompt outputs camera movement instructions -> Video renders automatically.",
      risks: "Ad platform compliance changes, high rendering API costs.",
      timeline: "7 - 14 days to secure first ad production client.",
      checklist: [
        "1. Scrape directory listings for local e-commerce brands with static product imagery.",
        "2. Generate a 6-8 second spec video ad from their raw image asset using Workflow 1 templates.",
        "3. Send a direct outbound message presenting the high-retention cinematic animation result.",
        "4. Close a monthly creation retainer and automate the intake delivery webhook."
      ]
    },
    ecommerce: {
      setup: "₹1,500 (Domain + safe professional email mapping)",
      monthly: "₹4,500 (Motion Script Compiler Pipeline API credits + mid-tier image models)",
      profit: "₹90,000 - ₹3,50,000 / month",
      tools: "Motion Script Compiler Pipeline, Google Veo, OmniFlash, ChatGPT, Midjourney",
      skills: "Storyboard expansion, motion vector prompt engineering, asset standardization",
      registration: "Sole Proprietorship initially. Transition to LLC as campaigns scale.",
      marketing: "Target local e-commerce and retail brands with high-quality spec video ads.",
      sales: "Charge a flat retainership for weekly high-retention video ad creatives.",
      automation: "Product image uploaded -> Universal Storyboard prompt generates 9-frame layout -> Motion Script Compiler Pipeline JSON prompt outputs camera movement instructions -> Video renders automatically.",
      risks: "Ad platform compliance changes, high rendering API costs.",
      timeline: "7 - 14 days to secure first ad production client.",
      checklist: [
        "1. Scrape directory listings for local e-commerce brands with static product imagery.",
        "2. Generate a 6-8 second spec video ad from their raw image asset using Workflow 1 templates.",
        "3. Send a direct outbound message presenting the high-retention cinematic animation result.",
        "4. Close a monthly creation retainer and automate the intake delivery webhook."
      ]
    },
    health: {
      setup: "₹1,500 (Domain + safe professional email mapping)",
      monthly: "₹4,500 (Motion Script Compiler Pipeline API credits + mid-tier image models)",
      profit: "₹90,000 - ₹3,50,000 / month",
      tools: "Motion Script Compiler Pipeline, Google Veo, OmniFlash, ChatGPT, Midjourney",
      skills: "Storyboard expansion, motion vector prompt engineering, asset standardization",
      registration: "Sole Proprietorship initially. Transition to LLC as campaigns scale.",
      marketing: "Target local e-commerce and retail brands with high-quality spec video ads.",
      sales: "Charge a flat retainership for weekly high-retention video ad creatives.",
      automation: "Product image uploaded -> Universal Storyboard prompt generates 9-frame layout -> Motion Script Compiler Pipeline JSON prompt outputs camera movement instructions -> Video renders automatically.",
      risks: "Ad platform compliance changes, high rendering API costs.",
      timeline: "7 - 14 days to secure first ad production client.",
      checklist: [
        "1. Scrape directory listings for local e-commerce brands with static product imagery.",
        "2. Generate a 6-8 second spec video ad from their raw image asset using Workflow 1 templates.",
        "3. Send a direct outbound message presenting the high-retention cinematic animation result.",
        "4. Close a monthly creation retainer and automate the intake delivery webhook."
      ]
    },
    education: {
      setup: "₹1,500 (Domain + safe professional email mapping)",
      monthly: "₹4,500 (Motion Script Compiler Pipeline API credits + mid-tier image models)",
      profit: "₹90,000 - ₹3,50,000 / month",
      tools: "Motion Script Compiler Pipeline, Google Veo, OmniFlash, ChatGPT, Midjourney",
      skills: "Storyboard expansion, motion vector prompt engineering, asset standardization",
      registration: "Sole Proprietorship initially. Transition to LLC as campaigns scale.",
      marketing: "Target local e-commerce and retail brands with high-quality spec video ads.",
      sales: "Charge a flat retainership for weekly high-retention video ad creatives.",
      automation: "Product image uploaded -> Universal Storyboard prompt generates 9-frame layout -> Motion Script Compiler Pipeline JSON prompt outputs camera movement instructions -> Video renders automatically.",
      risks: "Ad platform compliance changes, high rendering API costs.",
      timeline: "7 - 14 days to secure first ad production client.",
      checklist: [
        "1. Scrape directory listings for local e-commerce brands with static product imagery.",
        "2. Generate a 6-8 second spec video ad from their raw image asset using Workflow 1 templates.",
        "3. Send a direct outbound message presenting the high-retention cinematic animation result.",
        "4. Close a monthly creation retainer and automate the intake delivery webhook."
      ]
    }
  },
  'creator_zackd_shorts': {
    title: "Short Video Production Business",
    desc: "Produce highly viral 3D cartoon-realistic educational shorts with fast-paced pacing and scientific cross-section reveals for social channels.",
    retail: {
      setup: "₹0 (Organic video channel registration)",
      monthly: "₹2,000 (Gemini Omni / Kling AI video rendering allocations)",
      profit: "₹70,000 - ₹3,00,000 / month",
      tools: "ChatGPT, Gemini (Create with Omni), CapCut, InShot, ElevenLabs",
      skills: "Viral hook structure, high-retention pacing, localized video stitching",
      registration: "Sole Proprietorship. Register for tax filing once AdSense/brand sponsorships are active.",
      marketing: "Deploy vertical content natively on YouTube Shorts, Instagram Reels, and TikTok optimized with localized hashtags.",
      sales: "Monetize via platform views creator pools, brand sponsor placements, and digital template downloads in bio.",
      automation: "Master prompt detects content category -> outputs 10 curious titles -> selection triggers a 3-part script (Hook, Explanation, Shocking Reveal) with explicit camera motions (Orbit, Push-in) and Hindi voiceovers.",
      risks: "Platform algorithm variance, automated reuse content flags, high rendering queue latency.",
      timeline: "15 - 30 days to build audience metrics and initial revenue.",
      checklist: [
        "1. Establish faceless social media handles targeting educational/bizarre fact niches.",
        "2. Compile the master script blueprint using the exact 24-30 second motion script sequencing layout sequence.",
        "3. Render the three independent 8-10 second clips inside Gemini's video engine using stylized 3D character descriptions.",
        "4. Stitch the outputs sequentially with automated captions and drop a template download link in the bio."
      ]
    },
    ecommerce: {
      setup: "₹0 (Organic video channel registration)",
      monthly: "₹2,000 (Gemini Omni / Kling AI video rendering allocations)",
      profit: "₹70,000 - ₹3,00,000 / month",
      tools: "ChatGPT, Gemini (Create with Omni), CapCut, InShot, ElevenLabs",
      skills: "Viral hook structure, high-retention pacing, localized video stitching",
      registration: "Sole Proprietorship. Register for tax filing once AdSense/brand sponsorships are active.",
      marketing: "Deploy vertical content natively on YouTube Shorts, Instagram Reels, and TikTok optimized with localized hashtags.",
      sales: "Monetize via platform views creator pools, brand sponsor placements, and digital template downloads in bio.",
      automation: "Master prompt detects content category -> outputs 10 curious titles -> selection triggers a 3-part script (Hook, Explanation, Shocking Reveal) with explicit camera motions (Orbit, Push-in) and Hindi voiceovers.",
      risks: "Platform algorithm variance, automated reuse content flags, high rendering queue latency.",
      timeline: "15 - 30 days to build audience metrics and initial revenue.",
      checklist: [
        "1. Establish faceless social media handles targeting educational/bizarre fact niches.",
        "2. Compile the master script blueprint using the exact 24-30 second motion script sequencing layout sequence.",
        "3. Render the three independent 8-10 second clips inside Gemini's video engine using stylized 3D character descriptions.",
        "4. Stitch the outputs sequentially with automated captions and drop a template download link in the bio."
      ]
    },
    health: {
      setup: "₹0 (Organic video channel registration)",
      monthly: "₹2,000 (Gemini Omni / Kling AI video rendering allocations)",
      profit: "₹70,000 - ₹3,00,000 / month",
      tools: "ChatGPT, Gemini (Create with Omni), CapCut, InShot, ElevenLabs",
      skills: "Viral hook structure, high-retention pacing, localized video stitching",
      registration: "Sole Proprietorship. Register for tax filing once AdSense/brand sponsorships are active.",
      marketing: "Deploy vertical content natively on YouTube Shorts, Instagram Reels, and TikTok optimized with localized hashtags.",
      sales: "Monetize via platform views creator pools, brand sponsor placements, and digital template downloads in bio.",
      automation: "Master prompt detects content category -> outputs 10 curious titles -> selection triggers a 3-part script (Hook, Explanation, Shocking Reveal) with explicit camera motions (Orbit, Push-in) and Hindi voiceovers.",
      risks: "Platform algorithm variance, automated reuse content flags, high rendering queue latency.",
      timeline: "15 - 30 days to build audience metrics and initial revenue.",
      checklist: [
        "1. Establish faceless social media handles targeting educational/bizarre fact niches.",
        "2. Compile the master script blueprint using the exact 24-30 second motion script sequencing layout sequence.",
        "3. Render the three independent 8-10 second clips inside Gemini's video engine using stylized 3D character descriptions.",
        "4. Stitch the outputs sequentially with automated captions and drop a template download link in the bio."
      ]
    },
    education: {
      setup: "₹0 (Organic video channel registration)",
      monthly: "₹2,000 (Gemini Omni / Kling AI video rendering allocations)",
      profit: "₹70,000 - ₹3,00,000 / month",
      tools: "ChatGPT, Gemini (Create with Omni), CapCut, InShot, ElevenLabs",
      skills: "Viral hook structure, high-retention pacing, localized video stitching",
      registration: "Sole Proprietorship. Register for tax filing once AdSense/brand sponsorships are active.",
      marketing: "Deploy vertical content natively on YouTube Shorts, Instagram Reels, and TikTok optimized with localized hashtags.",
      sales: "Monetize via platform views creator pools, brand sponsor placements, and digital template downloads in bio.",
      automation: "Master prompt detects content category -> outputs 10 curious titles -> selection triggers a 3-part script (Hook, Explanation, Shocking Reveal) with explicit camera motions (Orbit, Push-in) and Hindi voiceovers.",
      risks: "Platform algorithm variance, automated reuse content flags, high rendering queue latency.",
      timeline: "15 - 30 days to build audience metrics and initial revenue.",
      checklist: [
        "1. Establish faceless social media handles targeting educational/bizarre fact niches.",
        "2. Compile the master script blueprint using the exact 24-30 second motion script sequencing layout sequence.",
        "3. Render the three independent 8-10 second clips inside Gemini's video engine using stylized 3D character descriptions.",
        "4. Stitch the outputs sequentially with automated captions and drop a template download link in the bio."
      ]
    }
  },
  'agency_voice_ai': {
    title: "AI Voice Assistant Business",
    desc: "Build and sell custom autonomous conversational voice AI booking assistants to handle administrative phone workloads for local healthcare clinics.",
    retail: {
      setup: "₹2,500 (Server endpoint configurations + custom portal mapping)",
      monthly: "₹6,000 (Claude API token scale + Twilio trunk line allocations + Voiceflow routing)",
      profit: "₹1,20,000 - ₹4,50,000 / month",
      tools: "Claude AI, OmniDimension MCP Server (https://mcp.omnidim.io/mcp), Twilio, Exotel, SIP trunks",
      skills: "MCP connector integration, voice telephony architecture, conversational intake rules",
      registration: "Private Limited company setup recommended due to enterprise medical clinic liability and service agreements.",
      marketing: "Target high-traffic local dental, wellness, and medical clinics experiencing customer service overhead.",
      sales: "Perform live telephone audits with clinic owners showcasing immediate voice booking response.",
      automation: "Incoming call activates Twilio trunk -> triggers OmniDimension MCP custom connector -> Claude processes natural dialogue -> automatically inputs appointment slot into clinic spreadsheet calendar.",
      risks: "Telephony latency issues, complex medical terminology misunderstanding, API connection dropouts.",
      timeline: "15 - 30 days to deploy your first client system.",
      checklist: [
        "1. Map out a dentist booking voice agent script using Claude's custom connectors block.",
        "2. Locate 40 regional dental or wellness clinics experiencing high support workloads.",
        "3. Run phone demonstration audits showing how the autonomous system auto-confirms data fields.",
        "4. Secure a ₹40,000 upfront setup package and scale the monthly support retainer infrastructure."
      ]
    },
    ecommerce: {
      setup: "₹2,500 (Server endpoint configurations + custom portal mapping)",
      monthly: "₹6,000 (Claude API token scale + Twilio trunk line allocations + Voiceflow routing)",
      profit: "₹1,20,000 - ₹4,50,000 / month",
      tools: "Claude AI, OmniDimension MCP Server (https://mcp.omnidim.io/mcp), Twilio, Exotel, SIP trunks",
      skills: "MCP connector integration, voice telephony architecture, conversational intake rules",
      registration: "Private Limited company setup recommended due to enterprise medical clinic liability and service agreements.",
      marketing: "Target high-traffic local dental, wellness, and medical clinics experiencing customer service overhead.",
      sales: "Perform live telephone audits with clinic owners showcasing immediate voice booking response.",
      automation: "Incoming call activates Twilio trunk -> triggers OmniDimension MCP custom connector -> Claude processes natural dialogue -> automatically inputs appointment slot into clinic spreadsheet calendar.",
      risks: "Telephony latency issues, complex medical terminology misunderstanding, API connection dropouts.",
      timeline: "15 - 30 days to deploy your first client system.",
      checklist: [
        "1. Map out a dentist booking voice agent script using Claude's custom connectors block.",
        "2. Locate 40 regional dental or wellness clinics experiencing high support workloads.",
        "3. Run phone demonstration audits showing how the autonomous system auto-confirms data fields.",
        "4. Secure a ₹40,000 upfront setup package and scale the monthly support retainer infrastructure."
      ]
    },
    health: {
      setup: "₹2,500 (Server endpoint configurations + custom portal mapping)",
      monthly: "₹6,000 (Claude API token scale + Twilio trunk line allocations + Voiceflow routing)",
      profit: "₹1,20,000 - ₹4,50,000 / month",
      tools: "Claude AI, OmniDimension MCP Server (https://mcp.omnidim.io/mcp), Twilio, Exotel, SIP trunks",
      skills: "MCP connector integration, voice telephony architecture, conversational intake rules",
      registration: "Private Limited company setup recommended due to enterprise medical clinic liability and service agreements.",
      marketing: "Target high-traffic local dental, wellness, and medical clinics experiencing customer service overhead.",
      sales: "Perform live telephone audits with clinic owners showcasing immediate voice booking response.",
      automation: "Incoming call activates Twilio trunk -> triggers OmniDimension MCP custom connector -> Claude processes natural dialogue -> automatically inputs appointment slot into clinic spreadsheet calendar.",
      risks: "Telephony latency issues, complex medical terminology misunderstanding, API connection dropouts.",
      timeline: "15 - 30 days to deploy your first client system.",
      checklist: [
        "1. Map out a dentist booking voice agent script using Claude's custom connectors block.",
        "2. Locate 40 regional dental or wellness clinics experiencing high support workloads.",
        "3. Run phone demonstration audits showing how the autonomous system auto-confirms data fields.",
        "4. Secure a ₹40,000 upfront setup package and scale the monthly support retainer infrastructure."
      ]
    },
    education: {
      setup: "₹2,500 (Server endpoint configurations + custom portal mapping)",
      monthly: "₹6,000 (Claude API token scale + Twilio trunk line allocations + Voiceflow routing)",
      profit: "₹1,20,000 - ₹4,50,000 / month",
      tools: "Claude AI, OmniDimension MCP Server (https://mcp.omnidim.io/mcp), Twilio, Exotel, SIP trunks",
      skills: "MCP connector integration, voice telephony architecture, conversational intake rules",
      registration: "Private Limited company setup recommended due to enterprise medical clinic liability and service agreements.",
      marketing: "Target high-traffic local dental, wellness, and medical clinics experiencing customer service overhead.",
      sales: "Perform live telephone audits with clinic owners showcasing immediate voice booking response.",
      automation: "Incoming call activates Twilio trunk -> triggers OmniDimension MCP custom connector -> Claude processes natural dialogue -> automatically inputs appointment slot into clinic spreadsheet calendar.",
      risks: "Telephony latency issues, complex medical terminology misunderstanding, API connection dropouts.",
      timeline: "15 - 30 days to deploy your first client system.",
      checklist: [
        "1. Map out a dentist booking voice agent script using Claude's custom connectors block.",
        "2. Locate 40 regional dental or wellness clinics experiencing high support workloads.",
        "3. Run phone demonstration audits showing how the autonomous system auto-confirms data fields.",
        "4. Secure a ₹40,000 upfront setup package and scale the monthly support retainer infrastructure."
      ]
    }
  },
  'creator_managed_network': {
    title: "Influencer Management Business",
    desc: "Monetize digital vertical content channels through highly structured creator network partnerships, direct content contracts, and high-CPM performance applications.",
    retail: {
      setup: "₹0 (Free standard creator portal access)",
      monthly: "₹1,500 (Caption builders + short-form template scripts)",
      profit: "₹50,000 - ₹2,50,000 / month",
      tools: "8x Social platform, Smartreach, Instantly, Google Sheets",
      skills: "Brand guidelines alignment, contract negotiation, performance content scaling",
      registration: "Sole Proprietorship initially. Transition to LLC/Partnership as creator contracts expand.",
      marketing: "Apply directly to premium brand databases and pitch short-form content conversion loops.",
      sales: "Secure brand integration payouts based on vertical video view thresholds and affiliate tracking codes.",
      automation: "Profile optimization triggers direct campaign matching -> system matches channel metrics to featured tech/AI campaigns (firstprompt, Pocket Pal, AiApply) -> tracking dashboard registers video views and processes direct payouts.",
      risks: "Brand guidelines violation, platform ban hazards, changing CPM pay rates.",
      timeline: "7 - 20 days.",
      checklist: [
        "1. Configure user authentication inside the 16-tier managed creator portal dashboard.",
        "2. Apply to active high-CPM campaign arrays and download specific brand briefs.",
        "3. Deploy daily vertical video assets integrating the precise promotional hook rules.",
        "4. Sign digital payout waivers and verify recurring ledger payouts to local banks."
      ]
    },
    ecommerce: {
      setup: "₹0 (Free standard creator portal access)",
      monthly: "₹1,500 (Caption builders + short-form template scripts)",
      profit: "₹50,000 - ₹2,50,000 / month",
      tools: "8x Social platform, Smartreach, Instantly, Google Sheets",
      skills: "Brand guidelines alignment, contract negotiation, performance content scaling",
      registration: "Sole Proprietorship initially. Transition to LLC/Partnership as creator contracts expand.",
      marketing: "Apply directly to premium brand databases and pitch short-form content conversion loops.",
      sales: "Secure brand integration payouts based on vertical video view thresholds and affiliate tracking codes.",
      automation: "Profile optimization triggers direct campaign matching -> system matches channel metrics to featured tech/AI campaigns (firstprompt, Pocket Pal, AiApply) -> tracking dashboard registers video views and processes direct payouts.",
      risks: "Brand guidelines violation, platform ban hazards, changing CPM pay rates.",
      timeline: "7 - 20 days.",
      checklist: [
        "1. Configure user authentication inside the 16-tier managed creator portal dashboard.",
        "2. Apply to active high-CPM campaign arrays and download specific brand briefs.",
        "3. Deploy daily vertical video assets integrating the precise promotional hook rules.",
        "4. Sign digital payout waivers and verify recurring ledger payouts to local banks."
      ]
    },
    health: {
      setup: "₹0 (Free standard creator portal access)",
      monthly: "₹1,500 (Caption builders + short-form template scripts)",
      profit: "₹50,000 - ₹2,50,000 / month",
      tools: "8x Social platform, Smartreach, Instantly, Google Sheets",
      skills: "Brand guidelines alignment, contract negotiation, performance content scaling",
      registration: "Sole Proprietorship initially. Transition to LLC/Partnership as creator contracts expand.",
      marketing: "Apply directly to premium brand databases and pitch short-form content conversion loops.",
      sales: "Secure brand integration payouts based on vertical video view thresholds and affiliate tracking codes.",
      automation: "Profile optimization triggers direct campaign matching -> system matches channel metrics to featured tech/AI campaigns (firstprompt, Pocket Pal, AiApply) -> tracking dashboard registers video views and processes direct payouts.",
      risks: "Brand guidelines violation, platform ban hazards, changing CPM pay rates.",
      timeline: "7 - 20 days.",
      checklist: [
        "1. Configure user authentication inside the 16-tier managed creator portal dashboard.",
        "2. Apply to active high-CPM campaign arrays and download specific brand briefs.",
        "3. Deploy daily vertical video assets integrating the precise promotional hook rules.",
        "4. Sign digital payout waivers and verify recurring ledger payouts to local banks."
      ]
    },
    education: {
      setup: "₹0 (Free standard creator portal access)",
      monthly: "₹1,500 (Caption builders + short-form template scripts)",
      profit: "₹50,000 - ₹2,50,000 / month",
      tools: "8x Social platform, Smartreach, Instantly, Google Sheets",
      skills: "Brand guidelines alignment, contract negotiation, performance content scaling",
      registration: "Sole Proprietorship initially. Transition to LLC/Partnership as creator contracts expand.",
      marketing: "Apply directly to premium brand databases and pitch short-form content conversion loops.",
      sales: "Secure brand integration payouts based on vertical video view thresholds and affiliate tracking codes.",
      automation: "Profile optimization triggers direct campaign matching -> system matches channel metrics to featured tech/AI campaigns (firstprompt, Pocket Pal, AiApply) -> tracking dashboard registers video views and processes direct payouts.",
      risks: "Brand guidelines violation, platform ban hazards, changing CPM pay rates.",
      timeline: "7 - 20 days.",
      checklist: [
        "1. Configure user authentication inside the 16-tier managed creator portal dashboard.",
        "2. Apply to active high-CPM campaign arrays and download specific brand briefs.",
        "3. Deploy daily vertical video assets integrating the precise promotional hook rules.",
        "4. Sign digital payout waivers and verify recurring ledger payouts to local banks."
      ]
    }
  },
  'creator_kids_animation': {
    title: "Kids Content Business",
    desc: "Produce automated, high-view count children's animation channels using structured ChatGPT text storyboards and native mobile generation apps.",
    retail: {
      setup: "₹500 (Basic design templates)",
      monthly: "₹2,500 (YouTube Create video scaling + audio assets)",
      profit: "₹60,000 - ₹2,20,000 / month",
      tools: "ChatGPT, YouTube Create App, CapCut, Canva, Suno AI",
      skills: "Nursery narrative structure, mobile video layout generation, audio syncing",
      registration: "Sole Proprietorship. File taxes once YouTube AdSense thresholds are met.",
      marketing: "Deploy highly engaging 3D nursery rhyme videos on YouTube and YouTube Kids using strategic tags.",
      sales: "Monetize through YouTube Partner Program (AdSense) and merchandise or book licensing.",
      automation: "Prompt forces ChatGPT to render scene-by-scene detail scripts -> user inserts instructions into YouTube Create's AI video generation interface -> tool outputs smooth, colorful animated short frames.",
      risks: "YouTube Kids algorithm updates, reuse content guidelines, copyright strikes on audio tracks.",
      timeline: "30 - 60 days to gain authority and build steady audience metrics.",
      checklist: [
        "1. Research viral children's animation categories on YouTube and map their view volume metrics.",
        "2. Command ChatGPT to write a detailed, high-contrast nursery rhyme storyboard scene breakdown.",
        "3. Generate the colorful cinematic clips using the text-to-video tools inside the mobile editor pipeline.",
        "4. Layer background tracks and schedule daily automated uploads optimized for mobile view loops."
      ]
    },
    ecommerce: {
      setup: "₹500 (Basic design templates)",
      monthly: "₹2,500 (YouTube Create video scaling + audio assets)",
      profit: "₹60,000 - ₹2,20,000 / month",
      tools: "ChatGPT, YouTube Create App, CapCut, Canva, Suno AI",
      skills: "Nursery narrative structure, mobile video layout generation, audio syncing",
      registration: "Sole Proprietorship. File taxes once YouTube AdSense thresholds are met.",
      marketing: "Deploy highly engaging 3D nursery rhyme videos on YouTube and YouTube Kids using strategic tags.",
      sales: "Monetize through YouTube Partner Program (AdSense) and merchandise or book licensing.",
      automation: "Prompt forces ChatGPT to render scene-by-scene detail scripts -> user inserts instructions into YouTube Create's AI video generation interface -> tool outputs smooth, colorful animated short frames.",
      risks: "YouTube Kids algorithm updates, reuse content guidelines, copyright strikes on audio tracks.",
      timeline: "30 - 60 days to gain authority and build steady audience metrics.",
      checklist: [
        "1. Research viral children's animation categories on YouTube and map their view volume metrics.",
        "2. Command ChatGPT to write a detailed, high-contrast nursery rhyme storyboard scene breakdown.",
        "3. Generate the colorful cinematic clips using the text-to-video tools inside the mobile editor pipeline.",
        "4. Layer background tracks and schedule daily automated uploads optimized for mobile view loops."
      ]
    },
    health: {
      setup: "₹500 (Basic design templates)",
      monthly: "₹2,500 (YouTube Create video scaling + audio assets)",
      profit: "₹60,000 - ₹2,20,000 / month",
      tools: "ChatGPT, YouTube Create App, CapCut, Canva, Suno AI",
      skills: "Nursery narrative structure, mobile video layout generation, audio syncing",
      registration: "Sole Proprietorship. File taxes once YouTube AdSense thresholds are met.",
      marketing: "Deploy highly engaging 3D nursery rhyme videos on YouTube and YouTube Kids using strategic tags.",
      sales: "Monetize through YouTube Partner Program (AdSense) and merchandise or book licensing.",
      automation: "Prompt forces ChatGPT to render scene-by-scene detail scripts -> user inserts instructions into YouTube Create's AI video generation interface -> tool outputs smooth, colorful animated short frames.",
      risks: "YouTube Kids algorithm updates, reuse content guidelines, copyright strikes on audio tracks.",
      timeline: "30 - 60 days to gain authority and build steady audience metrics.",
      checklist: [
        "1. Research viral children's animation categories on YouTube and map their view volume metrics.",
        "2. Command ChatGPT to write a detailed, high-contrast nursery rhyme storyboard scene breakdown.",
        "3. Generate the colorful cinematic clips using the text-to-video tools inside the mobile editor pipeline.",
        "4. Layer background tracks and schedule daily automated uploads optimized for mobile view loops."
      ]
    },
    education: {
      setup: "₹500 (Basic design templates)",
      monthly: "₹2,500 (YouTube Create video scaling + audio assets)",
      profit: "₹60,000 - ₹2,20,000 / month",
      tools: "ChatGPT, YouTube Create App, CapCut, Canva, Suno AI",
      skills: "Nursery narrative structure, mobile video layout generation, audio syncing",
      registration: "Sole Proprietorship. File taxes once YouTube AdSense thresholds are met.",
      marketing: "Deploy highly engaging 3D nursery rhyme videos on YouTube and YouTube Kids using strategic tags.",
      sales: "Monetize through YouTube Partner Program (AdSense) and merchandise or book licensing.",
      automation: "Prompt forces ChatGPT to render scene-by-scene detail scripts -> user inserts instructions into YouTube Create's AI video generation interface -> tool outputs smooth, colorful animated short frames.",
      risks: "YouTube Kids algorithm updates, reuse content guidelines, copyright strikes on audio tracks.",
      timeline: "30 - 60 days to gain authority and build steady audience metrics.",
      checklist: [
        "1. Research viral children's animation categories on YouTube and map their view volume metrics.",
        "2. Command ChatGPT to write a detailed, high-contrast nursery rhyme storyboard scene breakdown.",
        "3. Generate the colorful cinematic clips using the text-to-video tools inside the mobile editor pipeline.",
        "4. Layer background tracks and schedule daily automated uploads optimized for mobile view loops."
      ]
    }
  }
}

export function renderBusinessCardsGrid() {
  const container = document.getElementById('business-cards-grid');
  if (!container) return;
  
  const models = [
    { key: 'agency', icon: '🤖', subtitle: 'Automate boring tasks and emails for local businesses.', video: 'AAA' },
    { key: 'dropservicing', icon: '💼', subtitle: 'Broker premium digital services and outsource to contractors.', video: 'Drop-Servicing_Sprint' },
    { key: 'micro-saas', icon: '⚡', subtitle: 'Launch simple single-purpose tools with monthly subscriptions.', video: 'SaaS' },
    { key: 'creator', icon: '📸', subtitle: 'Build an audience and monetize with templates and sponsorships.', video: 'Content_Engine' },
    { key: 'agency_video_ad', icon: '🎥', subtitle: 'Turn static product photos into high-converting video ads.', video: 'AI_Video_Ad_Pipeline' },
    { key: 'creator_zackd_shorts', icon: '🎬', subtitle: 'Produce viral 3D shorts and bizarre facts videos using AI.', video: 'Motion_Script_Compiler' },
    { key: 'agency_voice_ai', icon: '📞', subtitle: 'Deploy smart voice agents to answer phones for local clinics.', video: 'Inbound_Voice_AI_Studio' },
    { key: 'creator_managed_network', icon: '🤝', subtitle: 'Manage social creators and secure brand sponsorships.', video: 'Managed_Creator_Network' },
    { key: 'creator_kids_animation', icon: '👶', subtitle: 'Produce automated animated children\'s songs and rhymes.', video: 'AI_Nursery_Rhyme_Engine' }
  ];

  container.innerHTML = models.map(m => {
    const idea = launchpadIdeas[m.key];
    const profitRange = idea.retail.profit;
    
    return `
      <div class="business-catalog-card" data-key="${m.key}">
        <div class="card-glow-effect"></div>
        <div class="card-header-row">
          <div class="card-icon-wrapper">${m.icon}</div>
          <span class="card-profit-badge">${profitRange.split(' /')[0]}</span>
        </div>
        <h4 class="card-business-title">${idea.title}</h4>
        <p class="card-business-subtitle">${m.subtitle}</p>
        
        <div class="card-actions-row">
          <button class="card-btn-compile" onclick="selectAndCompileBusiness('${m.key}')">
            <span>Configure</span> ⚙️
          </button>
          <button class="card-btn-video" onclick="handleBusinessVideoPlay('${m.key}', '${m.video}', '${idea.title}')">
            <span>Watch Video</span> ▶
          </button>
        </div>
      </div>
    `;
  }).join('');
}

export function initBuildSection() {
  renderBusinessCardsGrid();

  const btnCompile = document.getElementById('btn-compile-blueprint');
  const bOutput = document.getElementById('blueprint-output-contents');
  if (btnCompile && bOutput) {
    btnCompile.addEventListener('click', () => {
      if (!isUserAuthenticated()) {
        document.getElementById('auth-modal-overlay').style.display = 'flex';
        showToast("Please login first to compile a business blueprint.", "warning");
        return;
      }
      
      const isPremium = state.user && (
        state.user.plan_type === 'Premium' || 
        state.user.plan_type === 'Trial' ||
        state.user.subscription?.plan === 'Premium' ||
        state.user.subscription?.plan === 'Trial'
      );
      if (state.user && !isPremium) {
        showPricingModal(true);
        showToast("Upgrade to Premium or start trial to compile executable blueprints.", "warning");
        return;
      }

      const model = document.getElementById('blueprint-model-select').value;
      const nicheEl = document.getElementById('blueprint-niche-select');
      const niche = nicheEl ? nicheEl.value : 'retail';
      const budgetSelect = document.getElementById('blueprint-budget-select');
      const budget = budgetSelect ? budgetSelect.value : "5000";

      bOutput.innerHTML = `
        <div style="text-align: center; padding: 60px 0;">
          <span style="display:inline-block; animation: pulse 1.5s infinite; font-size: 2rem;">⏳</span>
          <p style="margin-top: 10px; font-family: var(--font-mono); color: var(--bus-primary); font-size:0.85rem;">COMPILING PRODUCTION LAUNCH MATRIX...</p>
        </div>
      `;

      setTimeout(() => {
        const modelData = launchpadIdeas[model] || launchpadIdeas['agency'];
        const profile = modelData[niche] || modelData['retail'] || Object.values(modelData)[1];
        const isTrial = state.user && (state.user.plan_type === 'Trial' || state.user.subscription?.plan === 'Trial');

        let detailsHtml = '';
        if (profile.checklist && profile.checklist.length > 0) {
          detailsHtml = `
            <div style="margin-top:20px; padding:16px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:8px;">
              <h4 style="color:var(--bus-primary); font-family:var(--font-title); font-size:0.88rem; margin-bottom:12px; text-transform:uppercase; letter-spacing:0.05em;">Step-by-Step Execution Playbook</h4>
              <ol style="margin:0; padding-left:18px; color:var(--bus-text-secondary); font-size:0.82rem; line-height:1.6;">
                ${profile.checklist.map(d => `<li style="margin-bottom:8px;">${d}</li>`).join('')}
              </ol>
            </div>
          `;
        }

        const difficultyMapping = {
          agency: 'Medium',
          dropservicing: 'Low',
          'micro-saas': 'High',
          creator: 'Medium',
          agency_video_ad: 'Low',
          creator_zackd_shorts: 'Medium',
          agency_voice_ai: 'Medium',
          creator_managed_network: 'Medium',
          creator_kids_animation: 'High'
        };
        const difficulty = difficultyMapping[model] || 'Medium';

        const isHi = state.language === 'hi';
        const isHng = state.language === 'hinglish';
        
        let complexityLabel = "Complexity Index";
        let budgetLabel = "Operational Budget";
        let toolsLabel = "Core Tech Tooling";
        let autoLabel = "System Architecture Automation Flow";

        if (isHi) {
          complexityLabel = "जटिलता सूचकांक";
          budgetLabel = "परिचालन बजट";
          toolsLabel = "मुख्य तकनीकी उपकरण";
          autoLabel = "सिस्टम आर्किटेक्चर ऑटोमेशन फ्लो";
        } else if (isHng) {
          complexityLabel = "Complexity Index";
          budgetLabel = "Operational Budget";
          toolsLabel = "Core Tech Tooling";
          autoLabel = "System Automation Flow";
        }

        bOutput.innerHTML = `
          <div style="border-left: 3px solid var(--bus-primary); padding-left: 16px;">
            <h3 style="font-family:var(--font-title); font-size:1.15rem; font-weight:700; color:#fff; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.02em;">${modelData.title}</h3>
            <p style="font-size:0.82rem; color:var(--bus-text-secondary); margin-bottom:16px;">${modelData.desc}</p>
            
            <div class="blueprint-meta-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:16px; margin-bottom:20px;">
              <div style="background:rgba(255,255,255,0.02); padding:12px; border-radius:6px; border:1px solid rgba(255,255,255,0.04);">
                <span style="font-size:0.7rem; color:var(--bus-text-secondary); text-transform:uppercase; display:block; margin-bottom:4px;">${complexityLabel}</span>
                <strong style="color:var(--bus-primary); font-size:0.9rem;">${difficulty}</strong>
              </div>
              <div style="background:rgba(255,255,255,0.02); padding:12px; border-radius:6px; border:1px solid rgba(255,255,255,0.04);">
                <span style="font-size:0.7rem; color:var(--bus-text-secondary); text-transform:uppercase; display:block; margin-bottom:4px;">${budgetLabel}</span>
                <strong style="color:#fff; font-size:0.9rem;">₹${parseFloat(budget).toLocaleString('en-IN')} / Mo</strong>
              </div>
              <div style="background:rgba(255,255,255,0.02); padding:12px; border-radius:6px; border:1px solid rgba(255,255,255,0.04);">
                <span style="font-size:0.7rem; color:var(--bus-text-secondary); text-transform:uppercase; display:block; margin-bottom:4px;">${toolsLabel}</span>
                <strong style="color:var(--bus-accent); font-size:0.82rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${profile.tools}">${profile.tools}</strong>
              </div>
            </div>

            <div style="background:rgba(0,208,132,0.04); border:1px solid rgba(0,208,132,0.15); padding:14px; border-radius:8px; margin-bottom:20px;">
              <h4 style="color:var(--bus-primary); font-family:var(--font-title); font-size:0.8rem; margin-bottom:4px; text-transform:uppercase;">${autoLabel}</h4>
              <p style="font-size:0.8rem; color:#fff; line-height:1.5; margin:0;">${profile.automation}</p>
            </div>
          </div>
          ${detailsHtml}
        `;
        updateConversionFunnel(modelData, budget);
        
        // Complete daily mission task & award XP for compiling roadmap/blueprint
        awardXP(30, 'roadmap');
        completeMissionTask('roadmap');
      }, 1000);
    });
  }
}

// Global exposure for backwards compatibility
window.initBuildSection = initBuildSection;
window.launchpadIdeas = launchpadIdeas;
window.renderBusinessCardsGrid = renderBusinessCardsGrid;

export function selectAndCompileBusiness(key) {
  const select = document.getElementById('blueprint-model-select');
  if (select) {
    select.value = key;
    const configPanel = document.querySelector('.blueprint-workspace');
    if (configPanel) {
      configPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    const compileBtn = document.getElementById('btn-compile-blueprint');
    if (compileBtn) compileBtn.click();
  }
}

window.selectAndCompileBusiness = selectAndCompileBusiness;
