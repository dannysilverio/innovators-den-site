/**
 * Seed house ad campaigns, creatives, and placements using raw SQL.
 * Run: node lib/db/seed-house-ads.mjs
 * Idempotent — safe to re-run.
 */
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    console.log("Seeding house ad campaigns…");
    await client.query("BEGIN");

    const now = new Date().toISOString();
    const farFuture = "2099-12-31T23:59:59Z";

    // ── Campaign 1: Membership upgrade ──────────────────────────────
    let membershipCampaignId;
    const existingMembership = await client.query(
      `SELECT id FROM ad_campaigns WHERE campaign_name = 'TID House Ad: Membership Upgrade' LIMIT 1`
    );
    if (existingMembership.rows.length) {
      membershipCampaignId = existingMembership.rows[0].id;
      console.log("  — Membership campaign exists:", membershipCampaignId);
      // Ensure it's active
      await client.query(`UPDATE ad_campaigns SET status='active', updated_at=NOW() WHERE id=$1`, [membershipCampaignId]);
    } else {
      const { rows } = await client.query(`
        INSERT INTO ad_campaigns (advertiser_name, campaign_name, campaign_type, start_date, end_date, status, target_url, notes)
        VALUES ('The Innovators Den','TID House Ad: Membership Upgrade','house_ad',$1,$2,'active','/web/membership','Evergreen membership upgrade house ad')
        RETURNING id
      `, [now, farFuture]);
      membershipCampaignId = rows[0].id;
      console.log("  ✓ Created membership campaign:", membershipCampaignId);
    }

    // Creatives for membership campaign
    const membershipCreatives = [
      { type: "billboard", headline: "Unlock the Full Den Experience", body: "Pro and Founding members get full access to every Room, Door, Circle, Intelligence Report, and more.", category: "MEMBERSHIP", logoChar: "✦", cta: "See Plans", sponsorLabel: "THE INNOVATORS DEN", accentColor: "#FFE600" },
      { type: "native",    headline: "Go Pro. Unlock Every Door.",     body: "Get full access to all opportunities, events, circles, and intelligence — built for the culture.",             category: "MEMBERSHIP", logoChar: "✦", cta: "View Plans", sponsorLabel: "THE INNOVATORS DEN", accentColor: "#FFE600" },
      { type: "featured_listing", headline: "✦ Founding Member — Be Part of What's Being Built", body: "Founding membership is limited. Get lifetime access, private rooms, and your place in the community.", category: "MEMBERSHIP", logoChar: "✦", cta: "Join Now", sponsorLabel: "LIMITED SPOTS", accentColor: "#FFE600" },
      { type: "sponsored_module", headline: "Upgrade to Pro — Support the Culture", body: "Every membership funds independent Black media. Access everything, fund everything.", category: "MEMBERSHIP", logoChar: "✦", cta: "Learn More", sponsorLabel: "THE INNOVATORS DEN", accentColor: "#FFE600" },
    ];

    const membershipCreativeIdsByType = {};
    for (const cv of membershipCreatives) {
      const existing = await client.query(
        `SELECT id FROM ad_creatives WHERE campaign_id=$1 AND creative_type=$2 LIMIT 1`,
        [membershipCampaignId, cv.type]
      );
      if (existing.rows.length) {
        membershipCreativeIdsByType[cv.type] = existing.rows[0].id;
        console.log(`  — ${cv.type} creative exists:`, existing.rows[0].id);
      } else {
        const { rows } = await client.query(`
          INSERT INTO ad_creatives (campaign_id, creative_type, headline, body, brand_name, category, logo_char, cta, sponsor_label, accent_color, theme)
          VALUES ($1,$2,$3,$4,'The Innovators Den',$5,$6,$7,$8,$9,'dark')
          RETURNING id
        `, [membershipCampaignId, cv.type, cv.headline, cv.body, cv.category, cv.logoChar, cv.cta, cv.sponsorLabel, cv.accentColor]);
        membershipCreativeIdsByType[cv.type] = rows[0].id;
        console.log(`  ✓ Created ${cv.type} creative:`, rows[0].id);
      }
    }

    // ── Campaign 2: Events & Rooms promo ────────────────────────────
    let eventCampaignId;
    const existingEvent = await client.query(
      `SELECT id FROM ad_campaigns WHERE campaign_name = 'TID House Ad: Events & Rooms' LIMIT 1`
    );
    if (existingEvent.rows.length) {
      eventCampaignId = existingEvent.rows[0].id;
      console.log("  — Events campaign exists:", eventCampaignId);
      await client.query(`UPDATE ad_campaigns SET status='active', updated_at=NOW() WHERE id=$1`, [eventCampaignId]);
    } else {
      const { rows } = await client.query(`
        INSERT INTO ad_campaigns (advertiser_name, campaign_name, campaign_type, start_date, end_date, status, target_url, notes)
        VALUES ('The Innovators Den','TID House Ad: Events & Rooms','house_ad',$1,$2,'active','/web/events','Evergreen events/rooms promo house ad')
        RETURNING id
      `, [now, farFuture]);
      eventCampaignId = rows[0].id;
      console.log("  ✓ Created events campaign:", eventCampaignId);
    }

    // Event creatives
    const eventCreativeDefs = [
      { type: "featured_listing", headline: "Rooms Worth Being In — See What's Coming", body: "Summits, masterclasses, mixers, and private gatherings. Curated for Black innovators nationwide.", category: "EVENTS", logoChar: "🏛", cta: "View Events", sponsorLabel: "DEN EVENTS", accentColor: "#60A5FA" },
      { type: "native", headline: "What Rooms Are You In? Find Yours.", body: "The Innovators Den curates the most important gatherings for Black innovators. In-person and virtual.", category: "EVENTS", logoChar: "🏛", cta: "Explore Rooms", sponsorLabel: "DEN ROOMS", accentColor: "#60A5FA" },
    ];

    const eventCreativeIds = {};
    for (const cv of eventCreativeDefs) {
      const existing = await client.query(
        `SELECT id FROM ad_creatives WHERE campaign_id=$1 AND creative_type=$2 LIMIT 1`,
        [eventCampaignId, cv.type]
      );
      if (existing.rows.length) {
        eventCreativeIds[cv.type] = existing.rows[0].id;
        console.log(`  — events ${cv.type} creative exists:`, existing.rows[0].id);
      } else {
        const { rows } = await client.query(`
          INSERT INTO ad_creatives (campaign_id, creative_type, headline, body, brand_name, category, logo_char, cta, sponsor_label, accent_color, theme)
          VALUES ($1,$2,$3,$4,'The Innovators Den',$5,$6,$7,$8,$9,'dark')
          RETURNING id
        `, [eventCampaignId, cv.type, cv.headline, cv.body, cv.category, cv.logoChar, cv.cta, cv.sponsorLabel, cv.accentColor]);
        eventCreativeIds[cv.type] = rows[0].id;
        console.log(`  ✓ Created events ${cv.type} creative:`, rows[0].id);
      }
    }

    // ── Placements ────────────────────────────────────────────────────
    const placements = [
      // Web Home
      { slotKey: "W-HOME-001", campaignId: membershipCampaignId, creativeType: "billboard",        tierExclusions: ["pro","founding"], weight: 10 },
      { slotKey: "W-HOME-002", campaignId: membershipCampaignId, creativeType: "native",           tierExclusions: ["pro","founding"], weight: 10 },
      { slotKey: "W-HOME-003", campaignId: membershipCampaignId, creativeType: "native",           tierExclusions: ["pro","founding"], weight: 8  },
      // App Home
      { slotKey: "A-HOME-001", campaignId: membershipCampaignId, creativeType: "sponsored_module", tierExclusions: ["pro","founding"], weight: 10 },
      { slotKey: "A-HOME-002", campaignId: membershipCampaignId, creativeType: "native",           tierExclusions: ["pro","founding"], weight: 10 },
      // Doors (membership for free, events for all)
      { slotKey: "W-DOORS-001", campaignId: membershipCampaignId, creativeType: "featured_listing", tierExclusions: ["pro","founding"], weight: 5 },
      { slotKey: "W-DOORS-002", campaignId: eventCampaignId,      creativeType: "native",           tierExclusions: [],                weight: 8 },
      { slotKey: "A-DOORS-001", campaignId: membershipCampaignId, creativeType: "featured_listing", tierExclusions: ["pro","founding"], weight: 5 },
      { slotKey: "A-DOORS-002", campaignId: eventCampaignId,      creativeType: "native",           tierExclusions: [],                weight: 6 },
      // Rooms (events always)
      { slotKey: "W-ROOMS-001", campaignId: eventCampaignId, creativeType: "featured_listing", tierExclusions: [], weight: 10 },
      { slotKey: "A-ROOMS-001", campaignId: eventCampaignId, creativeType: "featured_listing", tierExclusions: [], weight: 10 },
      // People
      { slotKey: "A-PEOPLE-001", campaignId: membershipCampaignId, creativeType: "sponsored_module", tierExclusions: ["pro","founding"], weight: 8 },
      // Article
      { slotKey: "W-SIGNAL-003", campaignId: membershipCampaignId, creativeType: "native", tierExclusions: ["pro","founding"], weight: 5 },
      // House slots
      { slotKey: "H-001", campaignId: membershipCampaignId, creativeType: "billboard",         tierExclusions: ["pro","founding"], weight: 10 },
      { slotKey: "H-002", campaignId: eventCampaignId,      creativeType: "featured_listing",  tierExclusions: [],                weight: 10 },
    ];

    let newPlacements = 0;
    for (const p of placements) {
      const slotRes = await client.query(`SELECT id FROM ad_inventory_slots WHERE slot_key=$1`, [p.slotKey]);
      if (!slotRes.rows.length) { console.warn(`  ⚠ Slot not found: ${p.slotKey}`); continue; }
      const slotId = slotRes.rows[0].id;

      const creativeId = p.campaignId === membershipCampaignId
        ? membershipCreativeIdsByType[p.creativeType]
        : eventCreativeIds[p.creativeType];

      if (!creativeId) { console.warn(`  ⚠ No creative for type ${p.creativeType}`); continue; }

      const exists = await client.query(
        `SELECT id FROM ad_placements WHERE campaign_id=$1 AND slot_id=$2 LIMIT 1`,
        [p.campaignId, slotId]
      );
      if (exists.rows.length) {
        console.log(`  — Placement exists: ${p.slotKey}`);
        continue;
      }

      await client.query(`
        INSERT INTO ad_placements (campaign_id, slot_id, creative_id, weight, tier_exclusions, page_targeting, city_targeting, topic_targeting)
        VALUES ($1,$2,$3,$4,$5::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb)
      `, [p.campaignId, slotId, creativeId, p.weight, JSON.stringify(p.tierExclusions)]);
      console.log(`  ✓ Placed ${p.creativeType} on ${p.slotKey} (weight=${p.weight})`);
      newPlacements++;
    }

    await client.query("COMMIT");
    console.log(`\n✅ Done. ${newPlacements} new placements created.`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
