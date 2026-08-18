import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import policyMarkdown from "../../swish-privacy-policy.md?raw";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

// Cream + black design system (shared with pricing/contact/waitlist)
const ink = "var(--mk-ink)";
const muted = "var(--mk-muted)";
const faint = "var(--mk-faint)";
const border = "var(--mk-border)";
const heading = "var(--font-heading)";
const body = "var(--font-body)";

/* ---------- primitives ---------- */

function Section({
  label,
  title,
  children,
}: {
  label?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      className="pt-12 mt-12"
      style={{ borderTop: `1px solid ${border}` }}
    >
      {label && (
        <p
          className="text-xs uppercase tracking-[0.18em] mb-3"
          style={{ color: faint }}
        >
          {label}
        </p>
      )}
      <h2
        className="text-2xl font-bold tracking-tight mb-6"
        style={{ fontFamily: heading, color: ink }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function H3({ children }: { children: ReactNode }) {
  return (
    <h3
      className="text-base font-semibold mt-10 mb-4"
      style={{ fontFamily: heading, color: ink }}
    >
      {children}
    </h3>
  );
}

function P({ children }: { children: ReactNode }) {
  return (
    <p className="mb-5 leading-[1.75]" style={{ color: muted }}>
      {children}
    </p>
  );
}

function B({ children }: { children: ReactNode }) {
  return (
    <strong className="font-semibold" style={{ color: ink }}>
      {children}
    </strong>
  );
}

function List({ children }: { children: ReactNode }) {
  return (
    <ul
      className="mb-5 space-y-3 pl-5 list-disc leading-[1.7]"
      style={{ color: muted }}
    >
      {children}
    </ul>
  );
}

/** Unfilled value the policy still needs before publication. */
function Ph({ children }: { children: ReactNode }) {
  return (
    <span
      className="rounded px-1.5 py-0.5 text-[0.85em] whitespace-nowrap"
      style={{
        background: "var(--mk-tint)",
        color: ink,
        fontFamily: "ui-monospace, monospace",
      }}
    >
      {children}
    </span>
  );
}

function Table({ cols, rows }: { cols: string[]; rows: ReactNode[][] }) {
  return (
    <div className="my-7 overflow-x-auto">
      <table
        className="w-full border-collapse text-sm"
        style={{ minWidth: 480 }}
      >
        <thead>
          <tr>
            {cols.map((c) => (
              <th
                key={c}
                className="text-left font-medium py-2.5 pr-6 align-bottom"
                style={{ color: faint, borderBottom: `1px solid ${border}` }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="py-3.5 pr-6 align-top leading-[1.6]"
                  style={{
                    color: j === 0 ? ink : muted,
                    borderBottom: `1px solid ${border}`,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- page ---------- */

function PrivacyPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--mk-bg)", color: ink, fontFamily: body }}
    >
      <Navbar />

      <main
        className="flex-grow w-full mx-auto px-6 md:px-12 py-20"
        style={{ maxWidth: 760 }}
      >
        {/* Header */}
        <header>
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
            style={{ fontFamily: heading, color: ink }}
          >
            Privacy Policy
          </h1>
          <div
            className="flex flex-wrap gap-x-8 gap-y-2 text-sm"
            style={{ color: faint }}
          >
            <span>
              Effective <Ph>[[Month Day, Year]]</Ph>
            </span>
            <span>
              Last revised <Ph>[[Month Day, Year]]</Ph>
            </span>
          </div>
        </header>

        <details className="mt-10" style={{ borderTop: `1px solid ${border}` }}>
          <summary
            className="cursor-pointer py-5 text-sm font-semibold"
            style={{ color: ink }}
          >
            Read the full policy source
          </summary>
          <pre
            className="overflow-x-auto whitespace-pre-wrap pb-6 text-sm leading-[1.7]"
            style={{ color: muted, fontFamily: body }}
          >
            {policyMarkdown}
          </pre>
        </details>

        <Section title="About This Policy">
          <P>
            This Privacy Policy explains how Swish, Inc. (“Swish,” “we,” “us,”
            or “our”) collects, uses, discloses, and protects information about
            you when you use the Swish mobile app and website (collectively, the
            “App”).
          </P>
          <P>
            This Policy is written for <B>Shoppers</B> — individuals who create
            a Swish account to browse, wishlist, and shop with participating
            stores (“Merchants”). Swish’s data practices toward Merchants
            themselves are governed by a separate Merchant Data Agreement,
            provided to Merchants when they connect their point-of-sale system
            to Swish.
          </P>
          <P>
            <B>This Policy is a disclosure, not a contract.</B> Reading it or
            using the App does not by itself constitute agreement to any
            particular data practice. Where the law requires your consent before
            we collect or use information in a specific way, we ask for that
            consent separately and in context — and you can withdraw it at any
            time. Practices that require separate consent include:
          </P>
          <List>
            <li>
              <B>Precise geolocation</B> — collected only after you grant
              location permission through your device’s operating system. You
              can revoke this at any time in your device settings without losing
              access to the App’s other features.
            </li>
            <li>
              <B>Marketing messages from Merchants</B> — sent only after you
              take an affirmative action with that specific Merchant (see
              Section 4), and you can unsubscribe from each Merchant
              individually.
            </li>
            <li>
              <B>Push notifications</B> — sent only after you enable them.
            </li>
            <li>
              <B>Merchant loyalty programs</B> — joined only by opt-in
              enrollment (see Section 8).
            </li>
          </List>
          <P>
            Your use of the App is also governed by our Terms of Service, which
            is a separate agreement.
          </P>
        </Section>

        <Section label="Section 1" title="Information We Collect">
          <Table
            cols={["Category", "Examples", "Sensitive under California law?"]}
            rows={[
              [
                "Identifiers",
                "Name, username, email address, phone number, device identifier",
                "No",
              ],
              [
                "Commercial information",
                "Products you wishlist, stores you follow, discount codes you claim, purchase history, loyalty balances and redemptions",
                "No",
              ],
              [
                "Internet & app activity",
                "Search terms, clicks, screens viewed, browsing patterns within the App",
                "No",
              ],
              [
                "General geolocation",
                "Approximate location (e.g., city or postal area), used for nearby-store discovery",
                "No",
              ],
              [
                "Precise geolocation",
                "Your exact device location, collected only with your permission",
                <B>Yes</B>,
              ],
              [
                "Account credentials",
                "Your password (stored only as a salted hash) or authentication token",
                <B>Yes</B>,
              ],
            ]}
          />
          <P>
            We do not knowingly collect sensitive categories beyond those listed
            above — such as health information, financial account numbers,
            biometric information, government ID numbers, race or ethnicity,
            religious beliefs, sexual orientation, or the contents of your
            private communications. If you include such information in a message
            to us, we will delete it once your request is resolved.
          </P>
          <P>
            We do not use sensitive personal information to infer
            characteristics about you.
          </P>
        </Section>

        <Section label="Section 2" title="Sources of Information">
          <P>We obtain information about you from four sources.</P>
          <P>
            <B>Directly from you.</B> Information you provide when you create an
            account, complete your profile, wishlist an item, follow a store,
            enroll in a loyalty program, enter a search, or contact customer
            support.
          </P>
          <P>
            <B>Automatically from your device and your activity in the App.</B>{" "}
            Device identifiers, app version and operating system, IP address,
            general location derived from your IP address, precise location
            (only if you have granted permission), crash and diagnostic logs,
            and records of how you navigate and interact with the App. Some of
            this is collected through software development kits (“SDKs”) from
            analytics and infrastructure vendors — see Section 7.
          </P>
          <P>
            <B>
              From participating Merchants and their point-of-sale (“POS”)
              systems.
            </B>{" "}
            When you make a purchase at a participating Merchant, that
            Merchant’s connected POS system transmits transaction data to Swish
            so we can credit your loyalty balance, confirm a discount
            redemption, and keep your purchase history current. This includes
            the items purchased, the amount, the store location, the date and
            time, and an identifier the Merchant uses to associate the
            transaction with you. We do not receive your payment card number or
            other payment credentials.
          </P>
          <P>
            <B>From service providers acting on our behalf.</B> For example,
            fraud-prevention and infrastructure vendors may return signals about
            suspicious activity or device integrity.
          </P>
        </Section>

        <Section label="Section 3" title="How We Use Your Information">
          <P>
            <B>Core App functions.</B> Creating and maintaining your account,
            managing your wishlists, locating nearby inventory, and tracking and
            redeeming loyalty perks.
          </P>
          <P>
            <B>Personalization.</B> Recommending products and stores based on
            your activity, and translating your search terms (for example, “blue
            jacket under $100”) into structured filters.
          </P>
          <P>
            <B>Notifications.</B> Sending restock alerts, price-drop
            notifications, and updates from stores you follow. You can manage
            these in your notification settings at any time.
          </P>
          <P>
            <B>Merchant relationships.</B> Enabling the Merchants you interact
            with to recognize you, credit your loyalty activity, and communicate
            with you — as described in detail in Section 4.
          </P>
          <P>
            <B>Aggregate demand insights.</B> Producing de-identified,
            aggregated demand-forecasting reports for Merchants (see Section
            4.3).
          </P>
          <P>
            <B>Security, fraud prevention, and improvement.</B> Detecting and
            preventing fraud and abuse, debugging, measuring performance, and
            improving the App.
          </P>
          <P>
            <B>Legal and compliance.</B> Meeting our legal obligations,
            responding to privacy rights requests, and establishing or defending
            legal claims.
          </P>
          <P>
            We do not use your information for purposes materially different
            from those described here without first giving you notice.
          </P>
        </Section>

        <Section label="Section 4" title="What Participating Merchants Receive">
          <H3>4.1 When a Merchant receives your information</H3>
          <P>
            A Merchant receives identifiable information about you <B>only</B>{" "}
            after you take a deliberate action directed at that specific
            Merchant:
          </P>
          <List>
            <li>Following the store</li>
            <li>Enrolling in the store’s loyalty program</li>
            <li>Claiming one of the store’s discount codes</li>
            <li>Wishlisting one of that store’s items</li>
            <li>Making a purchase at that store</li>
          </List>
          <P>
            Browsing a store’s page, viewing its items, or seeing it in general
            catalog results does <B>not</B> cause any information about you to
            be sent to that Merchant.
          </P>

          <H3>4.2 What that Merchant receives</H3>
          <Table
            cols={["Data", "Shared with that Merchant?"]}
            rows={[
              ["Your Swish username", "Yes"],
              [
                "Your email address",
                "Yes — so the store can send you marketing and alerts directly",
              ],
              [
                "The specific action you took (follow, enrollment, code claim, wishlist item)",
                "Yes",
              ],
              [
                "Your purchase and loyalty history at that store",
                "Yes, for stores whose loyalty program you have joined",
              ],
              ["Your phone number", "No"],
              ["Your precise or general geolocation", "No"],
              ["Your account credentials", "No"],
              ["Your search history", "No"],
              ["Your wishlist items belonging to other stores", "No"],
              ["Your activity with any other Merchant", "No"],
              [
                <B>Your full Swish browsing history</B>,
                <B>No — see Section 4.4</B>,
              ],
            ]}
          />
          <P>
            Merchants use this information to send you marketing messages and
            service notifications such as restock and price-drop alerts. Each
            Merchant is an independent business, and its use of your information
            is governed by its own privacy policy and by our Merchant Data
            Agreement, which prohibits the Merchant from selling your
            information or using it for any purpose other than communicating
            with you about that store.
          </P>
          <P>
            You can stop this at any time by unfollowing the store, leaving its
            loyalty program, or unsubscribing from its messages.
          </P>

          <H3>4.3 Aggregate demand insights are separate and de-identified</H3>
          <P>
            Separately from the above, we provide Merchants with aggregated
            demand-forecasting insights — for example, how many Swish users in a
            metropolitan area wishlisted a category of item in a given week.
            This data is de-identified: it does not include your username, email
            address, device identifier, or any other information that identifies
            you, and it is aggregated across enough users that you cannot be
            singled out.
          </P>
          <P>
            With respect to this de-identified data we: (i) have taken
            reasonable measures to ensure it cannot be associated with you or
            your household; (ii) publicly commit to maintain and use it in
            de-identified form and not to attempt to re-identify it, except to
            test our own de-identification methods; and (iii) contractually
            obligate every recipient to comply with these same requirements.
          </P>

          <H3>4.4 Merchants cannot see your full Swish activity</H3>
          <P>
            No Merchant — regardless of how much you interact with it — can see
            your full Swish browsing or search history, your activity on other
            Merchants’ pages, or your wishlist items belonging to other stores.
            A Merchant’s window into your account is limited to your
            relationship with that Merchant, and this limit is enforced in the
            systems Merchants use, not by contract alone.
          </P>
        </Section>

        <Section label="Section 5" title="Sharing Your Information">
          <P>
            Beyond the Merchant sharing described in Section 4, we disclose
            information as follows.
          </P>
          <P>
            <B>Service providers.</B> We share information with vendors who
            perform services for us — cloud hosting, data storage, analytics,
            crash reporting, customer support tooling, communications delivery,
            and fraud prevention. These vendors process information{" "}
            <B>on our behalf and under our instructions</B>, under contracts
            that prohibit them from using it for their own purposes, from
            retaining it beyond what is necessary to perform the service, and
            from selling or sharing it.
          </P>
          <P>
            <B>This includes sensitive information.</B> Your precise geolocation
            and your account credentials are processed by our infrastructure and
            service providers — a location lookup has to be resolved by a
            mapping service, and a login has to be verified by an authentication
            service. Our commitment is therefore specific:
          </P>
          <List>
            <li>
              We never <B>sell</B> your precise geolocation or account
              credentials, and we never disclose them in exchange for money or
              other valuable consideration.
            </li>
            <li>
              We never <B>share</B> them for cross-context behavioral
              advertising, and we do not disclose them to advertising networks,
              data brokers, or ad-measurement partners.
            </li>
            <li>
              Service providers that handle them are contractually restricted to
              the specific service they perform for us and are prohibited from
              any independent use.
            </li>
            <li>
              We never disclose your password in any form. Passwords are stored
              only as salted hashes and are not readable by us or by any vendor.
            </li>
          </List>
          <P>
            <B>Analytics and advertising partners.</B> We disclose limited,
            non-sensitive information — such as general app usage, device type,
            and non-precise location — to analytics providers so we can
            understand how the App is used and improve it. See Section 6 for how
            these disclosures are characterized under California law and Section
            9 for how to opt out.
          </P>
          <P>
            <B>Legal disclosures.</B> We may disclose information if required by
            law, subpoena, court order, or other valid legal process, or where
            we believe in good faith that disclosure is necessary to protect the
            rights, property, or safety of Swish, our users, or the public.
          </P>
          <P>
            <B>Business transfers.</B> If Swish is involved in a merger,
            acquisition, financing, reorganization, or sale of assets, your
            information may be transferred as part of that transaction. We will
            notify you before your information becomes subject to a materially
            different privacy policy.
          </P>
        </Section>

        <Section
          label="Section 6"
          title="“Sale” and “Sharing” Under California Law"
        >
          <P>
            California law uses two specific terms that are easy to confuse, so
            we define both and state plainly where Swish stands.
          </P>
          <P>
            <B>“Sale”</B> means disclosing personal information to a third party
            for monetary <B>or other valuable consideration</B>. Money does not
            have to change hands — a disclosure made in exchange for services or
            other benefits can qualify.
          </P>
          <P>
            <B>“Sharing”</B> means disclosing personal information to a third
            party for <B>cross-context behavioral advertising</B>: advertising
            targeted to you based on information gathered about your activity
            across different businesses, websites, or apps. A disclosure can be
            “sharing” even if Swish receives nothing in return.
          </P>
          <P>
            Neither term covers disclosures to a <B>service provider</B> or{" "}
            <B>contractor</B> — a vendor that processes information solely on
            our behalf under a contract containing the restrictions California
            law requires.
          </P>

          <H3>Where Swish stands</H3>
          <P>
            <B>We do not sell your personal information.</B> We do not disclose
            personal information to any third party for money or other valuable
            consideration.
          </P>
          <P>
            <B>
              We do not share your personal information for cross-context
              behavioral advertising.
            </B>
          </P>
          <P>
            <B>We never sell or share sensitive personal information</B>, and we
            do not use or disclose sensitive personal information for any
            purpose other than those permitted under California law. Because our
            use of sensitive information is limited to providing the App and
            other permitted purposes, we are not required to offer a “Limit the
            Use of My Sensitive Personal Information” control — but you can
            disable precise location at any time in your device settings.
          </P>

          <H3>Opt-out preference signals</H3>
          <P>
            We honor the <B>Global Privacy Control (GPC)</B> and other browser-
            or device-level opt-out preference signals as a valid request to opt
            out of sale and sharing for the browser or device that transmits the
            signal. If you are logged in when we receive the signal, we apply it
            to your account as well.
          </P>
          <P>
            We do not respond to browser “Do Not Track” signals, which are a
            separate and unstandardized mechanism.
          </P>

          <H3>Categories disclosed in the preceding 12 months</H3>
          <Table
            cols={[
              "Category",
              "Disclosed for a business purpose to",
              "Sold or shared?",
            ]}
            rows={[
              [
                "Identifiers",
                "Service providers; Merchants you interacted with",
                "No",
              ],
              [
                "Commercial information",
                "Service providers; Merchants you interacted with",
                "No",
              ],
              [
                "Internet & app activity",
                "Service providers; analytics providers",
                "No",
              ],
              [
                "General geolocation",
                "Service providers; analytics providers",
                "No",
              ],
              [
                "Precise geolocation (sensitive)",
                "Service providers only",
                <B>No — never</B>,
              ],
              [
                "Account credentials (sensitive)",
                "Authentication service providers only",
                <B>No — never</B>,
              ],
            ]}
          />
        </Section>

        <Section label="Section 7" title="Cookies, SDKs & Tracking">
          <P>
            <B>Website.</B> We use cookies to keep you logged in, remember your
            preferences, and understand usage patterns. You can block or delete
            cookies in your browser settings, though some features may not work
            correctly without them.
          </P>
          <P>
            <B>App.</B> We use SDKs from third-party vendors for analytics,
            crash reporting, and infrastructure. These SDKs may collect device
            identifiers, IP address, and interaction events. The vendors we
            currently use are: <Ph>[[list current SDK vendors]]</Ph>.
          </P>
          <P>
            <B>Mobile advertising identifiers.</B> On iOS you can limit tracking
            through App Tracking Transparency. On Android you can reset or
            delete your advertising ID in system settings.
          </P>
        </Section>

        <Section
          label="Section 8"
          title="Loyalty & Rewards — Notice of Financial Incentive"
        >
          <P>
            Swish’s loyalty and perks features constitute a “financial
            incentive” program under California law, because enrolling gives you
            something of monetary value and causes your identifiable activity to
            be disclosed to the Merchant operating the program. The following
            notice is therefore provided.
          </P>
          <P>
            <B>Summary of the incentive.</B> Enrolling in a participating
            Merchant’s loyalty program through Swish, or claiming a Merchant’s
            discount code, entitles you to that Merchant’s rewards — which may
            include percentage discounts, points redeemable for products, member
            pricing, early access to inventory, and similar perks. The specific
            rewards are set by each Merchant and are described at the point of
            enrollment.
          </P>
          <P>
            <B>Material terms.</B>
          </P>
          <List>
            <li>
              <em>Categories of personal information implicated:</em>{" "}
              identifiers (username and email address), and commercial
              information (your enrollment, code claims, wishlist activity with
              that Merchant, and your purchase and loyalty history at that
              Merchant).
            </li>
            <li>
              <em>What we do with it:</em> we disclose it to the Merchant
              operating the program so it can administer your rewards and
              communicate with you, as described in Section 4.
            </li>
            <li>
              <em>Duration:</em> the incentive continues for as long as you
              remain enrolled.
            </li>
            <li>
              <em>Limitations:</em> rewards are provided by the Merchant, not by
              Swish, and are subject to the Merchant’s own program terms.
            </li>
          </List>
          <P>
            <B>How to opt in.</B> Participation is entirely voluntary. You opt
            in by affirmatively enrolling in a specific Merchant’s program in
            the App. There is no automatic or default enrollment, and you can
            use every other feature of Swish without joining any loyalty
            program.
          </P>
          <P>
            <B>How to withdraw.</B> You may withdraw at any time in Account
            Settings → Loyalty Programs, or by contacting us using the
            information in Section 14. Withdrawal takes effect within{" "}
            <Ph>[[30]]</Ph> days. When you withdraw, we stop disclosing new
            activity to that Merchant. Unredeemed points or rewards held by that
            Merchant may be forfeited upon withdrawal, in accordance with that
            Merchant’s program terms.
          </P>
          <P>
            <B>Good-faith estimate of the value of your data.</B> We estimate
            the value of a participating Shopper’s personal information to Swish
            at approximately <Ph>[[$X.XX]]</Ph> per enrolled Shopper per year.
          </P>
          <P>
            <B>Method of calculation.</B> We calculated this estimate using an
            expense-based method: we totaled our annual expenses attributable to
            collecting, storing, securing, and transmitting the categories of
            personal information implicated by the loyalty program — including
            the allocable portion of data infrastructure, security, and
            privacy-compliance costs — and divided that total by the number of
            Shoppers enrolled in at least one Merchant loyalty program during
            the same period. We believe this estimate reasonably approximates
            the value of the information to our business, and we have determined
            in good faith that the value of the incentives offered to you bears
            a reasonable relationship to it.
          </P>
          <P>
            <B>Non-discrimination.</B> Every financial incentive we offer is
            reasonably related to the value of your information, is offered on
            the same terms to all eligible Shoppers, and is not a penalty for
            exercising your privacy rights.
          </P>
        </Section>

        <Section label="Section 9" title="Your Privacy Choices & Rights">
          <H3>Available to everyone</H3>
          <List>
            <li>
              <B>Access, correct, or delete</B> your account information in
              Account Settings.
            </li>
            <li>
              <B>Manage notifications</B> — turn push, email, and Merchant
              messages on or off individually.
            </li>
            <li>
              <B>Disable location access</B> in your device settings at any
              time. General and precise location can be controlled separately on
              most devices.
            </li>
            <li>
              <B>Leave a Merchant’s loyalty program</B> or unfollow a store at
              any time.
            </li>
            <li>
              <B>Delete your account</B> in Account Settings, which deletes your
              personal information subject to the retention criteria in Section
              11.
            </li>
            <li>
              <B>Opt out of analytics and advertising disclosures</B> using the
              in-app privacy settings, the “Do Not Sell or Share My Personal
              Information” link, or by contacting us at the address in Section
              14.
            </li>
          </List>

          <H3>California residents</H3>
          <P>
            You have the right to: know what personal information we collect,
            use, disclose, sell, and share, and the sources and purposes; access
            a copy in a portable format; correct inaccurate information; delete
            your personal information; opt out of sale and sharing; limit the
            use of sensitive personal information (see Section 6); and not be
            discriminated or retaliated against for exercising any of these
            rights.
          </P>

          <H3>Residents of other states</H3>
          <P>
            If you live in a state with a comprehensive privacy law — including
            Colorado, Connecticut, Virginia, Utah, Texas, Oregon, Montana, and
            others — you have comparable rights to access, correct, delete, and
            obtain a portable copy of your personal information, and to opt out
            of targeted advertising, sale, and certain profiling. Several of
            these states also give you the right to appeal a denied request. If
            we deny your request, our response will explain how to appeal.
          </P>

          <H3>How to exercise your rights</H3>
          <P>
            Submit a request in Account Settings → Privacy, or contact us using
            the information in Section 14. We will verify your identity by
            confirming control of the email address associated with your
            account, and may request additional information for sensitive
            requests. You may use an authorized agent, who must provide proof of
            authorization.
          </P>
          <P>
            We respond within 45 days, extendable by an additional 45 days where
            reasonably necessary. We will tell you if we need the extension.
          </P>
          <P>
            <B>Non-discrimination.</B> We will not deny you goods or services,
            charge you a different price, provide a different level of quality,
            or suggest that we will, because you exercised a privacy right. The
            loyalty programs described in Section 8 are an opt-in financial
            incentive, not a penalty.
          </P>
        </Section>

        <Section label="Section 10" title="Children’s & Teens’ Privacy">
          <P>
            The App is not directed to, and is not intended for use by,
            individuals under 13. We do not knowingly collect personal
            information from children under 13, and if we learn we have, we will
            delete it promptly.
          </P>
          <P>
            We do not knowingly sell or share the personal information of any
            user under 16.
          </P>
          <P>
            If you believe a child under 13 has provided us information, contact
            us at the address in Section 14.
          </P>
        </Section>

        <Section label="Section 11" title="Data Retention">
          <P>
            We keep each category of information only as long as we need it for
            the purpose we collected it for. The table below states the criteria
            we apply and our current retention periods.
          </P>
          <Table
            cols={["Category", "Retention period", "Criteria we use"]}
            rows={[
              [
                "Account identifiers (name, username, email, phone)",
                <>
                  Life of the account, plus <Ph>[[12]]</Ph> months
                </>,
                "Needed to operate your account; the tail period allows account recovery, resolution of chargebacks and disputes, and blocking of fraudulent re-registration",
              ],
              [
                "Wishlists, follows, and search history",
                "Life of the account, or until you delete the item",
                "Directly powers the features you use and is under your control; no independent need to retain it",
              ],
              [
                "Purchase and loyalty history",
                <>
                  Life of the account, plus <Ph>[[7]]</Ph> years for
                  transactional records
                </>,
                "Tax, accounting, and consumer-protection recordkeeping obligations; loyalty balances must remain auditable for the Merchant and for you",
              ],
              [
                "Device identifiers and app activity logs",
                <>
                  <Ph>[[13]]</Ph> months from collection
                </>,
                "Long enough to compare year-over-year seasonality and detect multi-cycle fraud patterns; retaining beyond one full annual cycle adds risk without analytical value",
              ],
              [
                "General geolocation",
                <>
                  <Ph>[[13]]</Ph> months
                </>,
                "Same analytical cycle as above; used to tune regional inventory and recommendations",
              ],
              [
                <B>Precise geolocation</B>,
                <Ph>[[24 hours]]</Ph>,
                "Used only to answer a live “what’s near me” query. Once the query is answered there is no ongoing purpose, so we retain it for the shortest period consistent with debugging and abuse detection",
              ],
              [
                "Account credentials",
                "Life of the account",
                "Salted hashes only; deleted on account deletion",
              ],
              [
                "Customer support correspondence",
                <>
                  <Ph>[[24]]</Ph> months after the matter is resolved
                </>,
                "Dispute resolution, service-quality review, and defense against related claims",
              ],
              [
                "Records of privacy rights requests",
                <>
                  <Ph>[[24]]</Ph> months
                </>,
                "We are required to maintain records of consumer requests and our responses",
              ],
              [
                "De-identified aggregate insights",
                "Indefinite",
                "No longer identifies you and cannot be re-associated with you; retained for longitudinal demand modeling",
              ],
            ]}
          />
          <P>
            <B>What overrides these periods.</B> We retain information longer
            than stated when we are required to by law, when it is subject to a
            legal hold because litigation or an investigation is pending or
            reasonably anticipated, or when it is needed to investigate an
            ongoing security incident or a suspected violation of our Terms.
            Once the reason ends, the normal period resumes.
          </P>
          <P>
            <B>Backups.</B> Deleted information may persist in encrypted backups
            for up to <Ph>[[90]]</Ph> days before it is overwritten on the
            ordinary backup cycle. It is not restored to active systems during
            that period except in a disaster-recovery event.
          </P>
          <P>
            <B>Deleting your account.</B> When you delete your account we delete
            or de-identify your personal information according to the criteria
            above, and we instruct our service providers to do the same.
            Information already disclosed to a Merchant under Section 4 is
            subject to that Merchant’s own retention practices, and you may need
            to contact the Merchant directly to have it removed.
          </P>
        </Section>

        <Section label="Section 12" title="Security">
          <P>
            We use industry-standard safeguards to protect your information,
            including encryption in transit and at rest, salted password
            hashing, access controls limiting employee access to what is needed
            for their role, and regular security review. No system is completely
            secure, and we cannot guarantee absolute security.
          </P>
          <P>
            If you believe your account has been compromised, contact us
            immediately at the address in Section 14.
          </P>
        </Section>

        <Section label="Section 13" title="Where We Store Data">
          <P>
            The App is operated from the United States. Your information may be
            stored and processed in the United States or in other jurisdictions
            where our service providers operate. Privacy laws in those
            jurisdictions may differ from those where you live.
          </P>
        </Section>

        <Section label="Section 14" title="Changes & Contact">
          <P>
            We may update this Policy from time to time. We will update the
            “Last Revised” date at the top whenever we do. If we make material
            changes — including any change to the categories of information we
            collect, the purposes we use it for, or the parties we disclose it
            to — we will notify you through the App or by email before the
            change takes effect, and where the law requires it, we will obtain
            your consent rather than relying on notice alone.
          </P>
          <P>Questions or requests regarding this Policy or your data:</P>
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span style={{ color: faint, minWidth: 56 }}>Email</span>
              <Ph>[[privacy@swish.com]]</Ph>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span style={{ color: faint, minWidth: 56 }}>Mail</span>
              <span style={{ color: muted }}>
                Swish, Inc., <Ph>[[mailing address]]</Ph>
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span style={{ color: faint, minWidth: 56 }}>Phone</span>
              <Ph>[[toll-free number]]</Ph>
            </div>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer
        style={{ borderTop: "1px solid rgba(0,0,0,.06)", padding: "48px 28px" }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 18,
              flexShrink: 0,
            }}
          >
            <img
              src="/your-logo.png"
              alt="Swish Logo"
              style={{ height: "100%", width: "auto", display: "block" }}
            />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            <Link
              to="/privacy"
              className="mk-nlink"
              style={{ fontSize: 13, color: "#71717a" }}
            >
              Privacy Policy
            </Link>
            <a
              href="#"
              className="mk-nlink"
              style={{ fontSize: 13, color: "#71717a" }}
            >
              Terms of Service
            </a>
          </div>
          <div style={{ fontSize: 13, color: "#71717a" }}>
            © 2026 Swish Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
