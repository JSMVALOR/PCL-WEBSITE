/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../NAVBAR/Navbar';
// NOTE: adjust the Navbar import path to match your project structure, or remove it
// if this page will render standalone.


const COMPANY_NAME = 'JSM Innovations';
const PRODUCT_NAME = 'Prudentia College of Law Website & ERP';
const SUPPORT_EMAIL = 'contact.jsminnovations@gmail.com';
const LEGAL_EMAIL = 'contact.jsminnovations@gmail.com';
const COMPANY_ADDRESS = '3-23, Gurramguda, Opp Badangpet Municipal Office, Balapur Mandal, R.R. Dist, Hyderabad - Telangana 501510';
const GOVERNING_LAW = 'India';
const JURISDICTION_CITY = 'Hyderabad, Telangana';
const EFFECTIVE_DATE = '19 July 2026';
const VERSION = 'v1.0';

const SECTIONS = [
  { id: 'agreement', label: 'Agreement to these terms' },
  { id: 'service', label: 'The service' },
  { id: 'accounts', label: 'Accounts and eligibility' },
  { id: 'billing', label: 'Subscriptions, fees and billing' },
  { id: 'trials', label: 'Free trials and beta features' },
  { id: 'your-data', label: 'Your data' },
  { id: 'acceptable-use', label: 'Acceptable use' },
  { id: 'ip', label: 'Intellectual property' },
  { id: 'integrations', label: 'Third-party integrations' },
  { id: 'confidentiality', label: 'Confidentiality' },
  { id: 'availability', label: 'Availability and support' },
  { id: 'suspension', label: 'Suspension and termination' },
  { id: 'warranties', label: 'Warranties and disclaimers' },
  { id: 'liability', label: 'Limitation of liability' },
  { id: 'indemnity', label: 'Indemnification' },
  { id: 'law', label: 'Governing law and disputes' },
  { id: 'changes', label: 'Changes to these terms' },
  { id: 'general', label: 'General provisions' },
  { id: 'contact', label: 'Contact' },
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

export default function TermsAndConditions() {
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
            Terms of Service
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
                          : { borderColor: 'transparent', color: 'var(--tw-prose-body, inherit)' }
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
              These Terms of Service ("Terms") are a binding agreement between {COMPANY_NAME} ("{PRODUCT_NAME}",
              "we", "us", "our") and the person or organization using our service ("you", "your", "Customer").
              By creating an account or using {PRODUCT_NAME}, you agree to these Terms. If you're accepting
              on behalf of an organization, you're confirming you have authority to bind that organization.
            </p>

            <Clause
              id="agreement"
              index={1}
              title="Agreement to these terms"
              summary="Using the product means you've agreed to this contract, including for anyone you sign up on behalf of."
            >
              <p>
                These Terms, together with any Order Form, Data Processing Addendum, and our Privacy Policy,
                make up the entire agreement between you and {COMPANY_NAME} regarding your use of {PRODUCT_NAME}
                (the "Service"). If an Order Form conflicts with these Terms, the Order Form controls for that
                conflict only.
              </p>
            </Clause>

            <Clause
              id="service"
              index={2}
              title="The service"
              summary="JSM INNOVATIONS ERP helps small businesses manage inventory, invoicing, accounting and HR in one place — provided as-is and improved over time."
            >
              <p>
                {PRODUCT_NAME} is a cloud-based enterprise resource planning platform covering modules such as
                inventory management, invoicing and billing, basic accounting, and HR and payroll workflows.
                We may add, change, or retire individual features as the product evolves. We'll give you
                reasonable notice before removing a feature you actively use on a paid plan, except where
                required sooner for security, legal, or operational reasons.
              </p>
            </Clause>

            <Clause
              id="accounts"
              index={3}
              title="Accounts and eligibility"
              summary="Keep your login secure and your account details accurate — you're responsible for activity under your account."
            >
              <p>
                You must provide accurate registration information and keep it up to date. You're responsible
                for maintaining the confidentiality of your login credentials and for all activity that occurs
                under your account, whether by you, your employees, or anyone you invite. Notify us promptly
                at {SUPPORT_EMAIL} if you suspect unauthorized access.
              </p>
              <p>
                You must be at least 18 years old and legally able to enter into a binding contract to create
                an account. The Service is intended for business use and is not directed at consumers acting
                outside a trade or profession.
              </p>
            </Clause>

            <Clause
              id="billing"
              index={4}
              title="Subscriptions, fees and billing"
              summary="Subscriptions renew automatically at the price on your plan unless you cancel; we'll give 30 days' notice before any price increase."
            >
              <p>
                Paid plans are billed in advance on a monthly or annual cycle as selected at signup, plus
                applicable taxes. Subscriptions renew automatically for successive terms of the same length
                unless you cancel before the renewal date through your account settings or by emailing{' '}
                {SUPPORT_EMAIL}.
              </p>
              <p>
                We may change our prices, but we'll give you at least 30 days' notice before any increase takes
                effect on your account, and the new price will apply starting your next renewal. Fees already
                paid are non-refundable except where required by law or expressly stated in an Order Form; we
                don't provide prorated refunds for partial billing periods or unused seats.
              </p>
              <p>
                If a payment fails, we'll attempt to notify you and retry billing. We may suspend access to
                paid features (with data preserved) if an invoice remains unpaid more than 14 days after the
                due date.
              </p>
            </Clause>

            <Clause
              id="trials"
              index={5}
              title="Free trials and beta features"
              summary="Trials and beta features are provided as-is, can change or end at short notice, and aren't covered by our usual support commitments."
            >
              <p>
                We may offer a free trial period or early-access "beta" features. Trials and beta features are
                provided without warranty, may be modified or discontinued at any time, and are excluded from
                the availability commitments in Section 11. If you don't convert to a paid plan by the end of a
                trial, your account and data may become read-only or be scheduled for deletion in line with
                Section 12.
              </p>
            </Clause>

            <Clause
              id="your-data"
              index={6}
              title="Your data"
              summary="Whatever business data you put into JSM INNOVATIONS — invoices, inventory, employee records — stays yours. We're processing it on your behalf, not claiming ownership."
            >
              <p>
                As between you and us, you own all data, records, and content you upload to or generate within
                the Service ("Customer Data"). We process Customer Data solely to provide, maintain, and
                support the Service, and as described in our Privacy Policy and Data Processing Addendum. We
                don't sell Customer Data, and we don't use it to train third-party products.
              </p>
              <p>
                You're responsible for the accuracy and legality of Customer Data you input, including any
                personal data about your own employees or customers, and for having the rights needed to share
                that data with us.
              </p>
            </Clause>

            <Clause
              id="acceptable-use"
              index={7}
              title="Acceptable use"
              summary="Use JSM INNOVATIONS for legitimate business purposes — no reverse engineering, reselling access, overloading the system, or illegal activity."
            >
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-brand-muted">
                <li>reverse engineer, decompile, or attempt to extract the source code of the Service, except
                  where applicable law gives you that right despite this restriction;</li>
                <li>resell, sublicense, or provide the Service to third parties as a bureau or managed service
                  without our written consent;</li>
                <li>probe, scan, or test the vulnerability of the Service, or interfere with its normal
                  operation or other customers' use of it;</li>
                <li>upload malicious code, or use the Service to store or transmit content that is unlawful,
                  infringing, or violates a third party's rights;</li>
                <li>use automated means to access the Service outside of our published APIs and rate limits.</li>
              </ul>
              <p>
                We may suspend access for a violation of this section, following the process in Section 12
                where practical.
              </p>
            </Clause>

            <Clause
              id="ip"
              index={8}
              title="Intellectual property"
              summary="We own the software and platform; you own your data; feedback you give us can be used to improve the product without obligation to you."
            >
              <p>
                {COMPANY_NAME} and its licensors own all right, title, and interest in the Service, including
                its software, design, and documentation, excluding Customer Data. Subject to your compliance
                with these Terms, we grant you a limited, non-exclusive, non-transferable right to access and
                use the Service during your subscription term for your internal business operations.
              </p>
              <p>
                If you send us feedback or suggestions about the Service, you agree we may use them without
                restriction or obligation to you.
              </p>
            </Clause>

            <Clause
              id="integrations"
              index={9}
              title="Third-party integrations"
              summary="You can connect JSM INNOVATIONS to other tools — we're not responsible for how those third-party services handle your data."
            >
              <p>
                {PRODUCT_NAME} may allow you to connect third-party services, such as payment gateways, banks,
                or accounting tools. Your use of those integrations is governed by the third party's own terms
                and privacy practices. We're not responsible for the availability, accuracy, or security
                practices of third-party services, and enabling an integration is at your discretion.
              </p>
            </Clause>

            <Clause
              id="confidentiality"
              index={10}
              title="Confidentiality"
              summary="Both sides agree to protect non-public information shared during the relationship, using at least reasonable care."
            >
              <p>
                Each party may receive non-public business, technical, or financial information from the other
                ("Confidential Information"). Each party agrees to use the other's Confidential Information
                only to perform its obligations under these Terms, and to protect it using at least the same
                degree of care it uses for its own confidential information, and no less than reasonable care.
                This section doesn't apply to information that is or becomes public through no fault of the
                receiving party, or that must be disclosed by law, provided reasonable notice is given where
                legally permitted.
              </p>
            </Clause>

            <Clause
              id="availability"
              index={11}
              title="Availability and support"
              summary="We target high uptime and reasonable support response times, but as a small team we can't promise a guaranteed, credit-backed SLA unless it's written into your plan."
            >
              <p>
                We use commercially reasonable efforts to keep the Service available and to target a monthly
                uptime of 99.5%, excluding scheduled maintenance (which we'll try to notify you of in advance)
                and events outside our reasonable control. Unless your Order Form states otherwise, this is a
                target rather than a guaranteed, credit-backed service level agreement.
              </p>
              <p>
                We provide support by email at {SUPPORT_EMAIL} during business hours and aim to acknowledge
                support requests within one business day. Response and resolution times are best-effort unless
                a specific support tier is set out in your Order Form.
              </p>
            </Clause>

            <Clause
              id="suspension"
              index={12}
              title="Suspension and termination"
              summary="Either side can end the agreement with notice; we'll give you 30 days to export your data after termination."
            >
              <p>
                Either party may terminate these Terms for the other party's material breach if the breach
                isn't cured within 30 days of written notice. You may cancel a subscription at any time, with
                cancellation taking effect at the end of the current billing period.
              </p>
              <p>
                We may suspend or restrict your access immediately, without prior notice where reasonably
                necessary, if we believe your use poses a security risk, violates Section 7, or if payment is
                more than 14 days overdue. We'll restore access promptly once the issue is resolved.
              </p>
              <p>
                Following termination, you'll have 30 days to export your Customer Data in a standard format.
                After that period, we may delete Customer Data from our active systems, subject to routine
                backups which are also purged on a rolling schedule.
              </p>
            </Clause>

            <Clause
              id="warranties"
              index={13}
              title="Warranties and disclaimers"
              summary="The Service is provided as-is; we don't promise it will be error-free or uninterrupted, beyond the availability target in Section 11."
            >
              <p>
                Except as expressly stated in these Terms, the Service is provided "as is" and "as available."
                To the maximum extent permitted by law, we disclaim all implied warranties, including
                merchantability, fitness for a particular purpose, and non-infringement. We don't warrant that
                the Service will be uninterrupted, error-free, or fully secure, though we take reasonable steps
                to make it both reliable and secure.
              </p>
              <p>
                Nothing in this section limits any liability that cannot be limited or excluded under
                applicable law, including liability for death, personal injury caused by negligence, or fraud.
              </p>
            </Clause>

            <Clause
              id="liability"
              index={14}
              title="Limitation of liability"
              summary="Each side's liability is capped at what you paid us in the past 12 months, and neither side is liable for indirect or consequential losses. This cap doesn't apply to a short list of carve-outs like confidentiality breaches or unpaid fees."
            >
              <p>
                To the maximum extent permitted by law, neither party will be liable for any indirect,
                incidental, special, consequential, or punitive damages, or for lost profits, lost revenue, or
                loss of data, arising out of or related to these Terms, even if advised of the possibility of
                such damages.
              </p>
              <p>
                Each party's total aggregate liability arising out of or related to these Terms will not exceed
                the fees you paid to us in the 12 months immediately preceding the event giving rise to the
                claim, or {"\u20B9"}10,000 if no fees have yet been paid.
              </p>
              <p>
                These limits don't apply to: (a) either party's indemnification obligations under Section 15;
                (b) a breach of confidentiality obligations under Section 10; (c) your payment obligations
                under Section 4; or (d) liability that cannot be limited under applicable law.
              </p>
            </Clause>

            <Clause
              id="indemnity"
              index={15}
              title="Indemnification"
              summary="You cover claims arising from your misuse of the Service or the data you put into it; we cover claims that our software infringes someone else's intellectual property."
            >
              <p>
                You'll defend and indemnify {COMPANY_NAME} against third-party claims arising from your
                Customer Data, your breach of these Terms, or your violation of applicable law, and pay any
                resulting damages and reasonable legal costs finally awarded or agreed in settlement.
              </p>
              <p>
                We'll defend and indemnify you against third-party claims alleging that the Service, as
                provided by us and used in accordance with these Terms, infringes that party's intellectual
                property rights, and pay any resulting damages and reasonable legal costs finally awarded or
                agreed in settlement. This obligation doesn't apply to claims arising from your Customer Data,
                unauthorized modifications, or use of the Service in combination with products we didn't
                provide.
              </p>
              <p>
                The indemnified party must give prompt written notice of the claim and reasonable cooperation;
                the indemnifying party controls the defense and any settlement.
              </p>
            </Clause>

            <Clause
              id="law"
              index={16}
              title="Governing law and disputes"
              summary="These Terms are governed by the laws of India, and courts in [City] have exclusive jurisdiction — but we'll try to resolve disagreements directly first."
            >
              <p>
                These Terms are governed by the laws of {GOVERNING_LAW}, without regard to conflict-of-law
                principles. Before starting formal proceedings, both parties agree to try to resolve any
                dispute through good-faith discussion for at least 30 days. Subject to that, the courts at{' '}
                {JURISDICTION_CITY}, {GOVERNING_LAW} have exclusive jurisdiction over any dispute arising out
                of or relating to these Terms.
              </p>
            </Clause>

            <Clause
              id="changes"
              index={17}
              title="Changes to these terms"
              summary="We may update these Terms; if a change is material, we'll give at least 30 days' notice before it takes effect."
            >
              <p>
                We may update these Terms from time to time. For material changes, we'll notify you by email
                or in-product notice at least 30 days before the change takes effect. Continuing to use the
                Service after a change takes effect means you accept the updated Terms; if you don't agree, you
                may cancel your subscription before the change takes effect.
              </p>
            </Clause>

            <Clause id="general" index={18} title="General provisions">
              <p>
                <strong className="text-white">Assignment.</strong> You may not assign these Terms without our
                written consent, except to a successor in a merger or sale of substantially all your assets. We
                may assign these Terms in connection with a merger, acquisition, or sale of assets.
              </p>
              <p>
                <strong className="text-white">Force majeure.</strong> Neither party is liable for delay or
                failure to perform caused by events beyond its reasonable control, such as natural disasters,
                internet or utility outages, or governmental action.
              </p>
              <p>
                <strong className="text-white">Severability and waiver.</strong> If any provision is found
                unenforceable, the remaining provisions stay in effect, and the unenforceable provision will be
                enforced to the maximum extent permitted. Failure to enforce a provision isn't a waiver of it.
              </p>
              <p>
                <strong className="text-white">Notices.</strong> We'll send legal notices to the email
                associated with your account; you can reach us at {LEGAL_EMAIL}.
              </p>
            </Clause>

            <Clause id="contact" index={19} title="Contact">
              <div className="not-prose bg-brand-card border border-brand-border rounded-2xl p-8">
                <p className="text-brand-muted">
                  Questions about these Terms? Reach {COMPANY_NAME} at{' '}
                  <strong className="text-white">{LEGAL_EMAIL}</strong>, or by post at{' '}
                  <strong className="text-white">{COMPANY_ADDRESS}</strong>.
                </p>
              </div>
            </Clause>
          </div>
        </div>
      </div>
    </div>
  );
}
