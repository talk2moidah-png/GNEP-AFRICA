/**
 * GNEP Africa Edge Worker & Consultancy Enquiry API
 * Supports both Cloudflare Workers (with [assets] binding) and Cloudflare Pages (_worker.js).
 *
 * Endpoint: POST /api/consultancy-enquiry
 * Optional Environment Variable for external webhook/email forwarding:
 *   CONSULTANCY_WEBHOOK_URL - If configured in Cloudflare dashboard/wrangler, forwards validated JSON payloads.
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/consultancy-enquiry") {
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      };

      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      if (request.method !== "POST") {
        return new Response(
          JSON.stringify({ ok: false, error: "Method not allowed. Use POST." }),
          { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      try {
        const body = await request.json();

        // 1. Honeypot spam protection
        if (body.website_url_hp && String(body.website_url_hp).trim() !== "") {
          return new Response(
            JSON.stringify({ ok: false, error: "Automated submission rejected." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // 2. Required field validation
        const requiredFields = [
          "fullName",
          "email",
          "phone",
          "organisation",
          "country",
          "organisationType",
          "engagementType",
          "serviceOfInterest",
          "intendedAudience",
          "estimatedParticipants",
          "deliveryFormat",
          "proposedTimeframe",
          "requestDescription"
        ];

        for (const field of requiredFields) {
          if (!body[field] || String(body[field]).trim() === "") {
            return new Response(
              JSON.stringify({ ok: false, error: `Missing required field: ${field}` }),
              { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        // 3. Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(body.email).trim())) {
          return new Response(
            JSON.stringify({ ok: false, error: "Please provide a valid email address." }),
            { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const referenceId =
          body.referenceId ||
          `GNEP-CNS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        const receivedAt = new Date().toISOString();

        // 4. Optional downstream webhook / email relay integration point
        let relayStatus = "registered_at_gnep_edge";
        if (env && env.CONSULTANCY_WEBHOOK_URL) {
          try {
            const whRes = await fetch(env.CONSULTANCY_WEBHOOK_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                referenceId,
                receivedAt,
                division: "GNEP Consultancy & Capacity Development",
                enquiry: {
                  fullName: String(body.fullName).trim(),
                  email: String(body.email).trim(),
                  phone: String(body.phone).trim(),
                  organisation: String(body.organisation).trim(),
                  country: String(body.country).trim(),
                  organisationType: String(body.organisationType).trim(),
                  engagementType: String(body.engagementType).trim(),
                  serviceOfInterest: String(body.serviceOfInterest).trim(),
                  intendedAudience: String(body.intendedAudience).trim(),
                  estimatedParticipants: String(body.estimatedParticipants).trim(),
                  deliveryFormat: String(body.deliveryFormat).trim(),
                  proposedTimeframe: String(body.proposedTimeframe).trim(),
                  requestDescription: String(body.requestDescription).trim(),
                  additionalRequirements: String(body.additionalRequirements || "").trim()
                }
              })
            });
            relayStatus = whRes.ok ? "forwarded_to_webhook" : `webhook_status_${whRes.status}`;
          } catch (relayErr) {
            relayStatus = "webhook_unreachable_logged_at_edge";
          }
        }

        console.log(
          JSON.stringify({
            event: "GNEP_CONSULTANCY_ENQUIRY",
            referenceId,
            receivedAt,
            organisation: String(body.organisation).trim(),
            organisationType: String(body.organisationType).trim(),
            engagementType: String(body.engagementType).trim(),
            serviceOfInterest: String(body.serviceOfInterest).trim()
          })
        );

        return new Response(
          JSON.stringify({
            ok: true,
            referenceId,
            receivedAt,
            relayStatus,
            deskEmail: "gnep.partnership@gmail.com",
            message:
              "Your consultancy and training programme request has been validated and registered with GNEP Consultancy & Capacity Development."
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
              "Cache-Control": "no-store"
            }
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ ok: false, error: "Invalid request payload." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return fetch(request);
  }
};
