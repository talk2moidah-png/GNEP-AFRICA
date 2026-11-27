/**
 * GNEP Consultancy & Capacity Development — Interactive Service Selector & Enquiry System
 * Handles:
 *  1. Preselection of service category, engagement type, or institutional partnership from page CTAs and URL params.
 *  2. Client-side validation, anti-spam honeypot & submission timing guard.
 *  3. Asynchronous POST to /api/consultancy-enquiry (Cloudflare Edge Worker / Pages Function) + optional external webhook.
 *  4. Private confirmation receipt rendering with Reference ID, downloadable dossier (.txt), and direct email/WhatsApp dispatch.
 */
(function () {
  "use strict";

  const pageLoadTimestamp = Date.now();
  let lastSubmittedDossierText = "";
  let lastSubmittedRefId = "";

  function generateReferenceId() {
    const year = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `GNEP-CNS-${year}-${rand}`;
  }

  function highlightField(el) {
    if (!el) return;
    el.classList.add("border-warning", "border-3");
    setTimeout(function () {
      el.classList.remove("border-3");
    }, 2200);
  }

  function preselectEnquiryOptions(options) {
    const form = document.getElementById("gnepConsultancyEnquiryForm");
    if (!form) return;

    const serviceSelect = document.getElementById("cnsServiceOfInterest");
    const engagementSelect = document.getElementById("cnsEngagementType");
    const orgTypeSelect = document.getElementById("cnsOrganisationType");
    const audienceInput = document.getElementById("cnsIntendedAudience");

    if (options.service && serviceSelect) {
      for (let i = 0; i < serviceSelect.options.length; i++) {
        if (
          serviceSelect.options[i].value === options.service ||
          serviceSelect.options[i].value.indexOf(options.service) !== -1
        ) {
          serviceSelect.selectedIndex = i;
          highlightField(serviceSelect);
          break;
        }
      }
    }

    if (options.engagement && engagementSelect) {
      for (let i = 0; i < engagementSelect.options.length; i++) {
        if (
          engagementSelect.options[i].value === options.engagement ||
          engagementSelect.options[i].value.indexOf(options.engagement) !== -1
        ) {
          engagementSelect.selectedIndex = i;
          highlightField(engagementSelect);
          break;
        }
      }
    }

    if (options.orgType && orgTypeSelect) {
      for (let i = 0; i < orgTypeSelect.options.length; i++) {
        if (
          orgTypeSelect.options[i].value === options.orgType ||
          orgTypeSelect.options[i].value.indexOf(options.orgType) !== -1
        ) {
          orgTypeSelect.selectedIndex = i;
          highlightField(orgTypeSelect);
          break;
        }
      }
    }

    if (options.audience && audienceInput && !audienceInput.value) {
      audienceInput.value = options.audience;
      highlightField(audienceInput);
    }

    // Ensure form view is visible if confirmation was previously shown
    const formContainer = document.getElementById("cnsFormContainer");
    const confirmPanel = document.getElementById("cnsConfirmationPanel");
    if (formContainer && confirmPanel && !confirmPanel.classList.contains("d-none")) {
      confirmPanel.classList.add("d-none");
      formContainer.classList.remove("d-none");
    }

    const section = document.getElementById("consultancy-enquiry");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function buildDossierText(payload) {
    return [
      "======================================================================",
      "GLOBAL NATURE AND ENVIRONMENTAL PARTNERSHIP (GNEP AFRICA)",
      "GNEP CONSULTANCY & CAPACITY DEVELOPMENT — OFFICIAL ENQUIRY DOSSIER",
      "======================================================================",
      `Reference ID:            ${payload.referenceId}`,
      `Timestamp (UTC):         ${payload.receivedAt}`,
      "----------------------------------------------------------------------",
      "1. CLIENT & INSTITUTIONAL PROFILE",
      `Full Name:               ${payload.fullName}`,
      `Email Address:           ${payload.email}`,
      `Telephone / WhatsApp:    ${payload.phone}`,
      `Organisation / Inst.:    ${payload.organisation}`,
      `Country:                 ${payload.country}`,
      `Type of Organisation:    ${payload.organisationType}`,
      "----------------------------------------------------------------------",
      "2. CONSULTANCY & TRAINING SPECIFICATION",
      `Engagement Category:     ${payload.engagementType}`,
      `Service of Interest:     ${payload.serviceOfInterest}`,
      `Intended Audience:       ${payload.intendedAudience}`,
      `Estimated Participants:  ${payload.estimatedParticipants}`,
      `Preferred Delivery:      ${payload.deliveryFormat}`,
      `Proposed Timeframe:      ${payload.proposedTimeframe}`,
      "----------------------------------------------------------------------",
      "3. BRIEF DESCRIPTION OF REQUEST",
      payload.requestDescription,
      "----------------------------------------------------------------------",
      "4. ADDITIONAL REQUIREMENTS & SPECIAL NOTES",
      payload.additionalRequirements || "None specified.",
      "======================================================================",
      "Consultancy Desk Email:  gnep.partnership@gmail.com",
      "Consultancy Desk Phone:  +234 706 588 5070",
      "Website:                 https://gnep-africa.pages.dev/consultancy.html",
      "======================================================================"
    ].join("\n");
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  document.addEventListener("DOMContentLoaded", function () {
    // 1. Bind CTA buttons that preselect a service or institutional partnership
    document.querySelectorAll("[data-select-service], [data-select-engagement]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        preselectEnquiryOptions({
          service: btn.getAttribute("data-select-service") || "",
          engagement: btn.getAttribute("data-select-engagement") || "",
          orgType: btn.getAttribute("data-select-orgtype") || "",
          audience: btn.getAttribute("data-select-audience") || ""
        });
      });
    });

    // 2. Check URL query parameters (?service=...&engagement=...&orgType=...)
    const params = new URLSearchParams(window.location.search);
    if (params.get("service") || params.get("engagement") || params.get("orgType")) {
      preselectEnquiryOptions({
        service: params.get("service") || "",
        engagement: params.get("engagement") || "",
        orgType: params.get("orgType") || "",
        audience: params.get("audience") || ""
      });
    }

    // 3. Handle Consultancy Enquiry Form submission
    const form = document.getElementById("gnepConsultancyEnquiryForm");
    if (!form) return;

    const errorAlert = document.getElementById("cnsFormErrorAlert");
    const submitBtn = document.getElementById("cnsSubmitBtn");
    const formContainer = document.getElementById("cnsFormContainer");
    const confirmPanel = document.getElementById("cnsConfirmationPanel");

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (errorAlert) {
        errorAlert.classList.add("d-none");
        errorAlert.textContent = "";
      }

      // Honeypot check
      const hpField = document.getElementById("cnsWebsiteUrlHp");
      if (hpField && hpField.value.trim() !== "") {
        return;
      }

      // Fast-bot timing check (< 1.2s after page load)
      if (Date.now() - pageLoadTimestamp < 1200) {
        if (errorAlert) {
          errorAlert.textContent = "Please complete all fields carefully before submitting.";
          errorAlert.classList.remove("d-none");
        }
        return;
      }

      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        if (errorAlert) {
          errorAlert.textContent =
            "Please complete all required fields highlighted below before submitting your consultancy request.";
          errorAlert.classList.remove("d-none");
        }
        return;
      }

      const refId = generateReferenceId();
      const nowIso = new Date().toISOString();

      const payload = {
        referenceId: refId,
        receivedAt: nowIso,
        website_url_hp: hpField ? hpField.value.trim() : "",
        fullName: document.getElementById("cnsFullName").value.trim(),
        email: document.getElementById("cnsEmail").value.trim(),
        phone: document.getElementById("cnsPhone").value.trim(),
        organisation: document.getElementById("cnsOrganisation").value.trim(),
        country: document.getElementById("cnsCountry").value.trim(),
        organisationType: document.getElementById("cnsOrganisationType").value.trim(),
        engagementType: document.getElementById("cnsEngagementType").value.trim(),
        serviceOfInterest: document.getElementById("cnsServiceOfInterest").value.trim(),
        intendedAudience: document.getElementById("cnsIntendedAudience").value.trim(),
        estimatedParticipants: document.getElementById("cnsEstimatedParticipants").value.trim(),
        deliveryFormat: document.getElementById("cnsDeliveryFormat").value.trim(),
        proposedTimeframe: document.getElementById("cnsProposedTimeframe").value.trim(),
        requestDescription: document.getElementById("cnsRequestDescription").value.trim(),
        additionalRequirements: document.getElementById("cnsAdditionalRequirements").value.trim()
      };

      const origBtnHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Registering Consultancy Request...';

      let apiRegistered = false;
      let serverMessage =
        "Your consultancy and training enquiry has been validated and registered with the GNEP Consultancy & Capacity Development Desk.";

      try {
        const apiEndpoint = form.getAttribute("data-api-endpoint") || "/api/consultancy-enquiry";
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.ok) {
            apiRegistered = true;
            if (data.referenceId) payload.referenceId = data.referenceId;
            if (data.message) serverMessage = data.message;
          }
        }
      } catch (networkErr) {
        // Fallback if offline or static preview environment
        apiRegistered = false;
      }

      // Optional secondary external webhook (e.g. Formspree / Web3Forms if configured on data-external-webhook)
      const externalWebhook = form.getAttribute("data-external-webhook");
      if (externalWebhook && externalWebhook.startsWith("https://")) {
        try {
          await fetch(externalWebhook, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(payload)
          });
        } catch (extErr) {
          // Non-blocking
        }
      }

      lastSubmittedRefId = payload.referenceId;
      lastSubmittedDossierText = buildDossierText(payload);

      // Build mailto and WhatsApp links for direct institutional copy dispatch
      const mailSubject = `[${payload.referenceId}] GNEP Consultancy Request: ${payload.serviceOfInterest} — ${payload.organisation}`;
      const mailtoHref = `mailto:gnep.partnership@gmail.com?subject=${encodeURIComponent(
        mailSubject
      )}&body=${encodeURIComponent(lastSubmittedDossierText)}`;

      const waText = [
        `*GNEP Consultancy & Capacity Development Enquiry*`,
        `*Ref:* ${payload.referenceId}`,
        `*Name:* ${payload.fullName} (${payload.organisation}, ${payload.country})`,
        `*Type:* ${payload.organisationType}`,
        `*Engagement:* ${payload.engagementType}`,
        `*Service:* ${payload.serviceOfInterest}`,
        `*Audience & Size:* ${payload.intendedAudience} (${payload.estimatedParticipants})`,
        `*Delivery & Date:* ${payload.deliveryFormat} | ${payload.proposedTimeframe}`,
        `*Summary:* ${payload.requestDescription}`
      ].join("\n");
      const waHref = `https://wa.me/2347065885070?text=${encodeURIComponent(waText)}`;

      // Populate confirmation panel
      const refBadgeEl = document.getElementById("cnsConfirmRefBadge");
      const statusMsgEl = document.getElementById("cnsConfirmStatusMsg");
      const summaryTableEl = document.getElementById("cnsConfirmSummaryBody");
      const mailtoBtnEl = document.getElementById("cnsConfirmMailtoBtn");
      const waBtnEl = document.getElementById("cnsConfirmWhatsappBtn");

      if (refBadgeEl) refBadgeEl.textContent = payload.referenceId;
      if (statusMsgEl) {
        statusMsgEl.textContent = apiRegistered
          ? serverMessage + " A private summary of your submission is provided below."
          : "Your consultancy request dossier has been validated and prepared. Please click 'Transmit Official Copy via Email' or 'Send to Consultancy Desk via WhatsApp' below to complete direct delivery to our coordination team.";
      }

      if (summaryTableEl) {
        summaryTableEl.innerHTML = `
          <tr><th class="w-35">Reference Code</th><td class="fw-bold">${escapeHtml(payload.referenceId)}</td></tr>
          <tr><th>Contact Person</th><td>${escapeHtml(payload.fullName)} &bull; ${escapeHtml(payload.email)} &bull; ${escapeHtml(payload.phone)}</td></tr>
          <tr><th>Organisation &amp; Country</th><td>${escapeHtml(payload.organisation)} (${escapeHtml(payload.organisationType)}) &mdash; ${escapeHtml(payload.country)}</td></tr>
          <tr><th>Engagement Type</th><td><span class="badge bg-warning text-dark">${escapeHtml(payload.engagementType)}</span></td></tr>
          <tr><th>Service of Interest</th><td class="fw-bold">${escapeHtml(payload.serviceOfInterest)}</td></tr>
          <tr><th>Target Audience &amp; Scale</th><td>${escapeHtml(payload.intendedAudience)} &bull; Est. Participants: ${escapeHtml(payload.estimatedParticipants)}</td></tr>
          <tr><th>Delivery Format &amp; Date</th><td>${escapeHtml(payload.deliveryFormat)} &bull; Proposed: ${escapeHtml(payload.proposedTimeframe)}</td></tr>
          <tr><th>Request Summary</th><td>${escapeHtml(payload.requestDescription)}</td></tr>
          ${
            payload.additionalRequirements
              ? `<tr><th>Additional Requirements</th><td>${escapeHtml(payload.additionalRequirements)}</td></tr>`
              : ""
          }
        `;
      }

      if (mailtoBtnEl) mailtoBtnEl.setAttribute("href", mailtoHref);
      if (waBtnEl) waBtnEl.setAttribute("href", waHref);

      submitBtn.disabled = false;
      submitBtn.innerHTML = origBtnHtml;

      if (formContainer && confirmPanel) {
        formContainer.classList.add("d-none");
        confirmPanel.classList.remove("d-none");
        confirmPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    // 4. Download Dossier (.txt) button handler
    const downloadBtn = document.getElementById("cnsDownloadDossierBtn");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", function () {
        if (!lastSubmittedDossierText) return;
        const blob = new Blob([lastSubmittedDossierText], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${lastSubmittedRefId || "GNEP-Consultancy-Enquiry"}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    // 5. Reset / Submit Another Request button handler
    const resetBtn = document.getElementById("cnsNewRequestBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        form.reset();
        form.classList.remove("was-validated");
        if (confirmPanel && formContainer) {
          confirmPanel.classList.add("d-none");
          formContainer.classList.remove("d-none");
          formContainer.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }
  });
})();
