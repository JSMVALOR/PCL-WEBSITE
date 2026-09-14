/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../NAVBAR/Navbar';
// NOTE: adjust the Navbar import path to match your project structure, or remove it
// if this page will render standalone.


const COMPANY_NAME = 'JSM Innovations';
const PRODUCT_NAME = 'Prudentia College of Law Website & ERP';
const SUPPORT_EMAIL = 'contact.jsminnovations@gmail.com';
const PRIVACY_EMAIL = 'contact.jsminnovations@gmail.com';
const COMPANY_ADDRESS = '3-23, Gurramguda, Opp Badangpet Municipal Office, Balapur Mandal, R.R. Dist, Hyderabad - Telangana 501510';
const EFFECTIVE_DATE = '19 July 2026';
const VERSION = 'v1.0';

const SECTIONS = [
  { id: 'scope', label: 'Scope of this policy' },
  { id: 'two-kinds', label: 'Two kinds of data' },
  { id: 'collect', label: 'Information we collect' },
  { id: 'use', label: 'How we use information' },
  { id: 'cookies', label: 'Cookies and tracking' },
  { id: 'sharing', label: 'How we share information' },
  { id: 'security', label: 'Data security' },
  { id: 'retention', label: 'Data retention' },
  { id: 'transfers', label: 'International transfers' },
  { id: 'rights', label: 'Your rights and choices' },
  { id: 'children', label: "Children's privacy" },
  { id: 'dpa', label: 'Customer data and DPA' },
  { id: 'changes', label: 'Changes to this policy' },
  { id: 'contact', label: 'Contact us' },
  { id: 'dpdpa', label: 'DPDPA Rights (India)' },
];

function useScrollSpy(ids) {
  const [activeId, setActiveId] = useState(ids[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}

function Clause({ id, index, title, summary, children }) {
  return (
    <section id={id} className="legal-clause scroll-mt-32 mb-14">
      <div className="flex items-start gap-4 mb-4">
        <span
          className="shrink-0 mt-1 font-mono text-xs tracking-wider px-2 py-1 rounded-sm border"
          style={{
            borderColor: 'var(--primary-color)',
            color: 'var(--primary-color)',
          }}
        >
          §{String(index).padStart(2, '0')}
        </span>
        <h2
          className="text-xl md:text-2xl font-bold text-white leading-snug"
         
        >
          {title}
        </h2>
      </div>

      {summary && (
        <div
          className="mb-5 pl-4 py-3 text-sm text-brand-muted border-l-2"
          style={{ borderColor: 'var(--primary-color)' }}
        >
          <span
            className="font-mono uppercase tracking-wider text-[11px] mr-2"
            style={{ color: 'var(--primary-color)' }}
          >
            In short
          </span>
          {summary}
        </div>
      )}

      <div className="space-y-4 text-brand-text/90 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPolicy() {
  const ids = useRef(SECTIONS.map((s) => s.id)).current;
  const activeId = useScrollSpy(ids);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
      <Navbar />

      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(var(--primary-color) 1px, transparent 1px), linear-gradient(90deg, var(--primary-color) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      <div className="relative pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-14 border-b border-brand-border pb-8">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="w-12 h-1 bg-[var(--primary-color)]"></div>
            <span className="font-mono text-xs tracking-widest uppercase text-brand-muted">
              Legal &middot; {PRODUCT_NAME}
            </span>
          </div>

          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
           
          >
            Privacy Policy
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-brand-muted font-mono">
            <span>Effective {EFFECTIVE_DATE}</span>
            <span className="opacity-50">/</span>
            <span>{VERSION}</span>
            <span className="opacity-50">/</span>
            <button
              onClick={() => window.print()}
              className="underline decoration-dotted underline-offset-4 hover:text-[var(--primary-color)] transition-colors"
            >
              Print or save as PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12">
          {/* Table of contents */}
          <nav className="hidden lg:block">
            <div className="sticky top-28">
              <p className="font-mono text-[11px] uppercase tracking-widest text-brand-muted mb-4">
                On this page
              </p>
              <ul className="space-y-1 border-l border-brand-border">
                {SECTIONS.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block pl-4 py-1.5 text-sm -ml-px border-l transition-colors"
                      style={
                        activeId === s.id
                          ? { borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }
                          : { borderColor: 'transparent' }
                      }
                    >
                      <span className="text-brand-muted font-mono text-xs mr-2">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className={activeId === s.id ? '' : 'text-brand-muted'}>{s.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <p className="text-brand-text/90 leading-relaxed mb-14">
              {COMPANY_NAME} ("{PRODUCT_NAME}", "we", "us", "our") built this policy so you know what
              information we collect through our website and application, why we collect it, and what control
              you have over it. It applies to visitors to our marketing site and to customers and their users
              inside the product.
            </p>

            <Clause
              id="scope"
              index={1}
              title="Scope of this policy"
              summary="This covers personal data we handle as a company — not the business records our customers store inside their own JSM INNOVATIONS account."
            >
              <p>
                This policy describes how we handle personal data belonging to website visitors, prospects,
                account holders, and individual users of {PRODUCT_NAME}. It does not separately list every
                field of business data a customer chooses to store in their account — see Section 12 for how
                that data is handled.
              </p>
            </Clause>

            <Clause
              id="two-kinds"
              index={2}
              title="Two kinds of data"
              summary="We're the decision-maker for account and marketing data, but just a processor for the business records you enter into the product."
            >
              <p>
                Because {PRODUCT_NAME} is an ERP system, we handle two categories of personal data differently:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                <li>
                  <strong className="text-white">Account and marketing data</strong> — information about you as
                  a website visitor, prospective customer, or registered user (name, work email, billing
                  contact, usage of our site and app). For this data, we act as the data controller and this
                  policy is our full statement of practice.
                </li>
                <li>
                  <strong className="text-white">Customer Data</strong> — the business records a customer
                  enters into their JSM INNOVATIONS account, such as invoices, inventory, or their own employees'
                  HR and payroll details. For this data, our customer is the controller and we act only as a
                  data processor on their instructions, under a Data Processing Addendum. See Section 12.
                </li>
              </ul>
            </Clause>

            <Clause
              id="collect"
              index={3}
              title="Information we collect"
              summary="Contact and account details you give us directly, plus usage and device data collected automatically when you use our site or app."
            >
              <h3 className="text-lg font-bold text-white mb-2 mt-6">Information you provide</h3>
              <p className="mb-4">
                Name, work email, phone number, company name, and billing details when you create an account,
                contact sales or support, or subscribe to a plan. Payment card details are collected and stored
                directly by our payment processor, not by us.
              </p>
              <h3 className="text-lg font-bold text-white mb-2 mt-6">Information collected automatically</h3>
              <p className="mb-4">
                Device and browser type, IP address, pages visited, referring URL, and timestamps, collected
                through server logs and cookies as described in Section 5. Within the product, we also log
                account-level activity (such as logins and feature usage) for security and product-improvement
                purposes.
              </p>
              <h3 className="text-lg font-bold text-white mb-2 mt-6">Information from other sources</h3>
              <p>
                We may receive limited information from integration partners you've connected (for example,
                confirming a payment gateway connection succeeded), or from public business directories when
                qualifying a sales lead.
              </p>
            </Clause>

            <Clause
              id="use"
              index={4}
              title="How we use information"
              summary="To run the account you signed up for, keep the product secure, provide support, and — only with reasonable marketing opt-outs — tell you about relevant updates."
            >
              <ul className="space-y-3">
                <li className="flex gap-3 items-start">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--primary-color)' }} />
                  <span>Provide, maintain, and secure the Service, including authentication and fraud prevention.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--primary-color)' }} />
                  <span>Process billing and send transactional notices, such as invoices and renewal reminders.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--primary-color)' }} />
                  <span>Respond to support requests and communicate about changes to the Service.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--primary-color)' }} />
                  <span>Understand aggregate usage patterns so we can improve reliability and features.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--primary-color)' }} />
                  <span>Send product updates or marketing communications, where you can opt out at any time.</span>
                </li>
              </ul>
              <p className="mt-4">We don't sell personal data, and we don't use Customer Data to train models sold to other parties.</p>
            </Clause>

            <Clause
              id="cookies"
              index={5}
              title="Cookies and tracking"
              summary="Essential cookies keep you logged in; optional analytics cookies help us understand product usage, and you can decline them."
            >
              <p>
                We use strictly necessary cookies to keep you signed in and to remember basic preferences. We
                also use analytics cookies to understand how the site and app are used, which you can decline
                through your browser settings or our cookie banner where shown. Declining analytics cookies
                doesn't affect your ability to use the Service.
              </p>
            </Clause>

            <Clause
              id="sharing"
              index={6}
              title="How we share information"
              summary="We share data with the vendors that help us run the Service (hosting, payments, email) under confidentiality obligations — never for their own advertising."
            >
              <p>We share personal data only in these circumstances:</p>
              <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                <li>
                  <strong className="text-white">Service providers</strong> — hosting, payment processing,
                  email delivery, and customer support tooling, bound by contract to protect the data and use
                  it only to provide services to us.
                </li>
                <li>
                  <strong className="text-white">Legal and safety reasons</strong> — where required to comply
                  with law, enforce our Terms, or protect the rights, property, or safety of {COMPANY_NAME},
                  our customers, or others.
                </li>
                <li>
                  <strong className="text-white">Business transfers</strong> — if we're involved in a merger,
                  acquisition, or asset sale, personal data may be transferred as part of that transaction,
                  subject to this policy's commitments continuing to apply.
                </li>
              </ul>
              <p className="mt-4">We do not sell personal data or share it with third parties for their own advertising purposes.</p>
            </Clause>

            <Clause
              id="security"
              index={7}
              title="Data security"
              summary="We use encryption, access controls, and regular reviews to protect data — but no system is completely immune to risk."
            >
              <p>
                We use technical and organizational measures appropriate to the risk, including encryption of
                data in transit, access controls limiting who inside {COMPANY_NAME} can view production data,
                and regular review of our security practices. No method of transmission or storage is completely
                secure, and we can't guarantee absolute security.
              </p>
            </Clause>

            <Clause
              id="retention"
              index={8}
              title="Data retention"
              summary="We keep account data while your account is active and for a limited period after, mainly to meet legal, tax, and dispute-resolution needs."
            >
              <p>
                We retain account and billing data for as long as your account is active, and for a limited
                period afterward to meet legal, tax, accounting, or dispute-resolution requirements, typically
                not exceeding 7 years for financial records. Customer Data is handled per the retention terms
                in Section 12 and your Data Processing Addendum.
              </p>
            </Clause>

            <Clause
              id="transfers"
              index={9}
              title="International transfers"
              summary="Our infrastructure may be located outside your country; where required, we use recognized legal safeguards for cross-border transfers."
            >
              <p>
                Depending on your location, providing the Service may involve transferring personal data to
                countries other than your own. Where applicable law requires a specific transfer mechanism
                (such as EU Standard Contractual Clauses), we put that mechanism in place with our
                infrastructure and processing partners.
              </p>
            </Clause>

            <Clause
              id="rights"
              index={10}
              title="Your rights and choices"
              summary="Depending on where you live, you may be able to access, correct, export, or delete your personal data — write to us and we'll act within a reasonable time."
            >
              <p>
                Subject to applicable law, you may have the right to access, correct, export, or request
                deletion of your personal data, and to object to or restrict certain processing. To exercise
                these rights, email {PRIVACY_EMAIL}. We'll respond within the time required by applicable law,
                and in any case within 30 days. Where you're a user inside a customer's JSM INNOVATIONS account
                rather than our direct customer, we may need to direct your request to that organization, since
                they control that data.
              </p>
            </Clause>

            <Clause
              id="children"
              index={11}
              title="Children's privacy"
              summary="JSM INNOVATIONS is a business product, not directed at children, and we don't knowingly collect personal data from them."
            >
              <p>
                {PRODUCT_NAME} is a business tool intended for use by adults acting on behalf of an
                organization. We don't knowingly collect personal data from children. If you believe a child
                has provided us with personal data, contact {PRIVACY_EMAIL} and we'll delete it.
              </p>
            </Clause>

            <Clause
              id="dpa"
              index={12}
              title="Customer data and data processing agreements"
              summary="If your organization stores business or HR records in JSM INNOVATIONS, that data is covered by our Data Processing Addendum, not this policy — your organization controls it, we just process it on their instructions."
            >
              <p>
                Where a customer organization stores personal data inside {PRODUCT_NAME} — for example,
                employee records in an HR module, or customer contact details in invoices — that organization
                is the data controller, and we process that data only as instructed under our Data Processing
                Addendum ("DPA"), available on request at {PRIVACY_EMAIL}. The DPA covers our confidentiality
                obligations, subprocessor list, security commitments, and assistance with data subject requests.
              </p>
              <p>
                If you're an individual whose data appears in a customer's account (for example, an employee of
                one of our customers), please direct privacy requests to that organization directly, as they
                control how your data is used.
              </p>
            </Clause>

            <Clause
              id="changes"
              index={13}
              title="Changes to this policy"
              summary="We may update this policy; for material changes we'll give notice before they take effect."
            >
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or for
                legal or operational reasons. For material changes, we'll provide notice by email or an
                in-product notice before the change takes effect. The "Effective" date at the top of this page
                shows when it was last revised.
              </p>
            </Clause>

            <Clause id="contact" index={14} title="Contact us">
              <div className="not-prose bg-brand-card border border-brand-border rounded-2xl p-8">
                <p className="text-brand-muted">
                  Questions about this policy or your data? Reach {COMPANY_NAME} at{' '}
                  <strong className="text-white">{PRIVACY_EMAIL}</strong> (privacy) or{' '}
                  <strong className="text-white">{SUPPORT_EMAIL}</strong> (general support), or by post at{' '}
                  <strong className="text-white">{COMPANY_ADDRESS}</strong>.
                </p>
              </div>
            </Clause>
          <Clause
            id="dpdpa"
            index={15}
            title="DPDPA Rights (India)"
            summary="If you reside in India, you have specific rights under the Digital Personal Data Protection Act, 2023."
          >
            <p>
              As a Data Fiduciary operating in India, {COMPANY_NAME} strictly adheres to the Digital Personal Data Protection Act, 2023. We process your personal data based on your explicit consent or for legitimate uses outlined in the Act.
            </p>
            <p>Under the DPDPA, Data Principals have the right to:</p>
            <ul>
              <li><strong>Information:</strong> Request a summary of personal data being processed.</li>
              <li><strong>Correction & Erasure:</strong> Request the correction of inaccurate data or erasure of data no longer needed.</li>
              <li><strong>Grievance Redressal:</strong> Readily available means of grievance redressal.</li>
              <li><strong>Withdraw Consent:</strong> Withdraw your consent for data processing at any time.</li>
            </ul>
            <p>
              To exercise these rights or contact our designated Data Protection Officer, please email us at <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>.
            </p>
          </Clause>

          </div>
        </div>
      </div>
    </div>
  );
}
