import { getUncachableRevenueCatClient } from "./revenueCatClient";
import {
  listProjects,
  createProject,
  listApps,
  createApp,
  listAppPublicApiKeys,
  listProducts,
  createProduct,
  listEntitlements,
  createEntitlement,
  attachProductsToEntitlement,
  listOfferings,
  createOffering,
  updateOffering,
  listPackages,
  createPackages,
  attachProductsToPackage,
  type App,
  type Product,
  type Project,
  type Entitlement,
  type Offering,
  type Package,
  type CreateProductData,
} from "@replit/revenuecat-sdk";

const PROJECT_NAME = "The Innovators Den";
const APP_STORE_APP_NAME = "The Innovators Den iOS";
const APP_STORE_BUNDLE_ID = "com.theinnovatorsden.app";
const PLAY_STORE_APP_NAME = "The Innovators Den Android";
const PLAY_STORE_PACKAGE_NAME = "com.theinnovatorsden.app";

// Entitlement — a single "pro" entitlement gates all paid tiers
const ENTITLEMENT_IDENTIFIER = "pro";
const ENTITLEMENT_DISPLAY_NAME = "Pro Access";

// One offering with all 4 tiers × monthly + annual packages
const OFFERING_IDENTIFIER = "default";
const OFFERING_DISPLAY_NAME = "The Innovators Den Membership";

type PlanDef = {
  identifier: string;
  playStoreIdentifier: string;
  displayName: string;
  title: string;
  duration: "P1M" | "P1Y";
  packageKey: string;
  packageDisplayName: string;
  priceUSD: number; // in micros
};

const PLANS: PlanDef[] = [
  {
    identifier: "tid_member_monthly",
    playStoreIdentifier: "tid_member_monthly:monthly",
    displayName: "Den Member Monthly",
    title: "Den Member — $9/month",
    duration: "P1M",
    packageKey: "$rc_monthly",
    packageDisplayName: "Den Member Monthly",
    priceUSD: 9_000_000,
  },
  {
    identifier: "tid_member_annual",
    playStoreIdentifier: "tid_member_annual:annual",
    displayName: "Den Member Annual",
    title: "Den Member — $90/year",
    duration: "P1Y",
    packageKey: "$rc_annual",
    packageDisplayName: "Den Member Annual",
    priceUSD: 90_000_000,
  },
  {
    identifier: "tid_pro_monthly",
    playStoreIdentifier: "tid_pro_monthly:monthly",
    displayName: "Den Pro Monthly",
    title: "Den Pro — $19/month",
    duration: "P1M",
    packageKey: "tid_pro_monthly",
    packageDisplayName: "Den Pro Monthly",
    priceUSD: 19_000_000,
  },
  {
    identifier: "tid_pro_annual",
    playStoreIdentifier: "tid_pro_annual:annual",
    displayName: "Den Pro Annual",
    title: "Den Pro — $190/year",
    duration: "P1Y",
    packageKey: "tid_pro_annual",
    packageDisplayName: "Den Pro Annual",
    priceUSD: 190_000_000,
  },
  {
    identifier: "tid_ic_monthly",
    playStoreIdentifier: "tid_ic_monthly:monthly",
    displayName: "Inner Circle Monthly",
    title: "Den Inner Circle — $49/month",
    duration: "P1M",
    packageKey: "tid_ic_monthly",
    packageDisplayName: "Inner Circle Monthly",
    priceUSD: 49_000_000,
  },
  {
    identifier: "tid_ic_annual",
    playStoreIdentifier: "tid_ic_annual:annual",
    displayName: "Inner Circle Annual",
    title: "Den Inner Circle — $490/year",
    duration: "P1Y",
    packageKey: "tid_ic_annual",
    packageDisplayName: "Inner Circle Annual",
    priceUSD: 490_000_000,
  },
  {
    identifier: "tid_founding_annual",
    playStoreIdentifier: "tid_founding_annual:annual",
    displayName: "Founding / Patron",
    title: "Founding Member — $999/year",
    duration: "P1Y",
    packageKey: "tid_founding_annual",
    packageDisplayName: "Founding / Patron",
    priceUSD: 999_000_000,
  },
];

type TestStorePricesResponse = {
  object: string;
  prices: { amount_micros: number; currency: string }[];
};

async function ensureProduct(
  client: any,
  project: Project,
  targetApp: App,
  plan: PlanDef,
  isTestStore: boolean,
  existingProducts: Product[]
): Promise<Product> {
  const storeId = isTestStore
    ? plan.identifier
    : targetApp.type === "play_store"
    ? plan.playStoreIdentifier
    : plan.identifier;

  const existing = existingProducts.find(
    (p) => p.store_identifier === storeId && p.app_id === targetApp.id
  );
  if (existing) {
    console.log(`  ✓ Product exists [${storeId}]:`, existing.id);
    return existing;
  }

  const body: CreateProductData["body"] = {
    store_identifier: storeId,
    app_id: targetApp.id,
    type: "subscription",
    display_name: plan.displayName,
  };
  if (isTestStore) {
    body.subscription = { duration: plan.duration };
    body.title = plan.title;
  }

  const { data, error } = await createProduct({
    client,
    path: { project_id: project.id },
    body,
  });
  if (error) throw new Error(`Failed to create product ${storeId}: ${JSON.stringify(error)}`);
  console.log(`  ✓ Created product [${storeId}]:`, data.id);
  return data;
}

async function seedRevenueCat() {
  console.log("🚀 Starting RevenueCat seed for The Innovators Den...\n");
  const client = await getUncachableRevenueCatClient();

  // ── Project ────────────────────────────────────────────────────────────────
  const { data: projectsData, error: listProjErr } = await listProjects({ client, query: { limit: 20 } });
  if (listProjErr) throw new Error("Failed to list projects");

  let project: Project;
  const existingProject = projectsData.items?.find((p) => p.name === PROJECT_NAME);
  if (existingProject) {
    console.log("✓ Project exists:", existingProject.id);
    project = existingProject;
  } else {
    const { data, error } = await createProject({ client, body: { name: PROJECT_NAME } });
    if (error) throw new Error("Failed to create project");
    console.log("✓ Created project:", data.id);
    project = data;
  }

  // ── Apps ───────────────────────────────────────────────────────────────────
  const { data: appsData, error: listAppsErr } = await listApps({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });
  if (listAppsErr || !appsData?.items?.length) throw new Error("No apps found in project");

  let testApp = appsData.items.find((a) => a.type === "test_store");
  let iosApp = appsData.items.find((a) => a.type === "app_store");
  let androidApp = appsData.items.find((a) => a.type === "play_store");

  if (!testApp) throw new Error("No test store app found — RevenueCat always creates one automatically");
  console.log("✓ Test Store app:", testApp.id);

  if (!iosApp) {
    const { data, error } = await createApp({
      client,
      path: { project_id: project.id },
      body: { name: APP_STORE_APP_NAME, type: "app_store", app_store: { bundle_id: APP_STORE_BUNDLE_ID } },
    });
    if (error) throw new Error("Failed to create iOS app: " + JSON.stringify(error));
    iosApp = data;
    console.log("✓ Created iOS app:", iosApp.id);
  } else {
    console.log("✓ iOS app exists:", iosApp.id);
  }

  if (!androidApp) {
    const { data, error } = await createApp({
      client,
      path: { project_id: project.id },
      body: { name: PLAY_STORE_APP_NAME, type: "play_store", play_store: { package_name: PLAY_STORE_PACKAGE_NAME } },
    });
    if (error) throw new Error("Failed to create Android app: " + JSON.stringify(error));
    androidApp = data;
    console.log("✓ Created Android app:", androidApp.id);
  } else {
    console.log("✓ Android app exists:", androidApp.id);
  }

  // ── Products ───────────────────────────────────────────────────────────────
  console.log("\n📦 Creating products...");
  const { data: productsData, error: listProdErr } = await listProducts({
    client,
    path: { project_id: project.id },
    query: { limit: 100 },
  });
  if (listProdErr) throw new Error("Failed to list products");
  const existingProducts = productsData.items ?? [];

  const productsByPlan: Record<string, { test: Product; ios: Product; android: Product }> = {};

  for (const plan of PLANS) {
    console.log(`\n  → ${plan.displayName}`);
    const testProduct = await ensureProduct(client, project, testApp, plan, true, existingProducts);
    const iosProduct = await ensureProduct(client, project, iosApp, plan, false, existingProducts);
    const androidProduct = await ensureProduct(client, project, androidApp, plan, false, existingProducts);
    productsByPlan[plan.identifier] = { test: testProduct, ios: iosProduct, android: androidProduct };

    // Add test store prices
    const { error: priceError } = await client.post<TestStorePricesResponse>({
      url: "/projects/{project_id}/products/{product_id}/test_store_prices",
      path: { project_id: project.id, product_id: testProduct.id },
      body: { prices: [{ amount_micros: plan.priceUSD, currency: "USD" }] },
    });
    if (priceError) {
      if ((priceError as any)?.type === "resource_already_exists") {
        console.log(`  ✓ Test store price already exists`);
      } else {
        console.warn(`  ⚠ Could not set test store price:`, JSON.stringify(priceError));
      }
    } else {
      console.log(`  ✓ Test store price set`);
    }
  }

  // ── Entitlement ────────────────────────────────────────────────────────────
  console.log("\n🔑 Creating entitlement...");
  const { data: entData, error: listEntErr } = await listEntitlements({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });
  if (listEntErr) throw new Error("Failed to list entitlements");

  let entitlement: Entitlement;
  const existingEnt = entData.items?.find((e) => e.lookup_key === ENTITLEMENT_IDENTIFIER);
  if (existingEnt) {
    console.log("✓ Entitlement exists:", existingEnt.id);
    entitlement = existingEnt;
  } else {
    const { data, error } = await createEntitlement({
      client,
      path: { project_id: project.id },
      body: { lookup_key: ENTITLEMENT_IDENTIFIER, display_name: ENTITLEMENT_DISPLAY_NAME },
    });
    if (error) throw new Error("Failed to create entitlement: " + JSON.stringify(error));
    console.log("✓ Created entitlement:", data.id);
    entitlement = data;
  }

  // Attach all products to entitlement
  const allProductIds = Object.values(productsByPlan).flatMap((p) => [p.test.id, p.ios.id, p.android.id]);
  const { error: attachEntErr } = await attachProductsToEntitlement({
    client,
    path: { project_id: project.id, entitlement_id: entitlement.id },
    body: { product_ids: allProductIds },
  });
  if (attachEntErr && (attachEntErr as any)?.type !== "unprocessable_entity_error") {
    throw new Error("Failed to attach products to entitlement: " + JSON.stringify(attachEntErr));
  }
  console.log("✓ All products attached to entitlement");

  // ── Offering ───────────────────────────────────────────────────────────────
  console.log("\n🛍  Creating offering...");
  const { data: offeringsData, error: listOffErr } = await listOfferings({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });
  if (listOffErr) throw new Error("Failed to list offerings");

  let offering: Offering;
  const existingOffering = offeringsData.items?.find((o) => o.lookup_key === OFFERING_IDENTIFIER);
  if (existingOffering) {
    console.log("✓ Offering exists:", existingOffering.id);
    offering = existingOffering;
  } else {
    const { data, error } = await createOffering({
      client,
      path: { project_id: project.id },
      body: { lookup_key: OFFERING_IDENTIFIER, display_name: OFFERING_DISPLAY_NAME },
    });
    if (error) throw new Error("Failed to create offering: " + JSON.stringify(error));
    console.log("✓ Created offering:", data.id);
    offering = data;
  }

  if (!offering.is_current) {
    const { error } = await updateOffering({
      client,
      path: { project_id: project.id, offering_id: offering.id },
      body: { is_current: true },
    });
    if (error) throw new Error("Failed to set offering as current");
    console.log("✓ Set offering as current");
  }

  // ── Packages ───────────────────────────────────────────────────────────────
  console.log("\n📦 Creating packages...");
  const { data: packagesData, error: listPkgErr } = await listPackages({
    client,
    path: { project_id: project.id, offering_id: offering.id },
    query: { limit: 50 },
  });
  if (listPkgErr) throw new Error("Failed to list packages");
  const existingPackages = packagesData.items ?? [];

  for (const plan of PLANS) {
    const products = productsByPlan[plan.identifier];
    let pkg: Package;
    const existingPkg = existingPackages.find((p) => p.lookup_key === plan.packageKey);
    if (existingPkg) {
      console.log(`  ✓ Package exists [${plan.packageKey}]:`, existingPkg.id);
      pkg = existingPkg;
    } else {
      const { data, error } = await createPackages({
        client,
        path: { project_id: project.id, offering_id: offering.id },
        body: { lookup_key: plan.packageKey, display_name: plan.packageDisplayName },
      });
      if (error) throw new Error(`Failed to create package ${plan.packageKey}: ` + JSON.stringify(error));
      console.log(`  ✓ Created package [${plan.packageKey}]:`, data.id);
      pkg = data;
    }

    const { error: attachPkgErr } = await attachProductsToPackage({
      client,
      path: { project_id: project.id, package_id: pkg.id },
      body: {
        products: [
          { product_id: products.test.id, eligibility_criteria: "all" },
          { product_id: products.ios.id, eligibility_criteria: "all" },
          { product_id: products.android.id, eligibility_criteria: "all" },
        ],
      },
    });
    if (attachPkgErr && !(attachPkgErr as any)?.message?.includes("Cannot attach product")) {
      console.warn(`  ⚠ Package attach warning [${plan.packageKey}]:`, JSON.stringify(attachPkgErr));
    } else {
      console.log(`  ✓ Products attached to package [${plan.packageKey}]`);
    }
  }

  // ── API Keys ───────────────────────────────────────────────────────────────
  console.log("\n🔐 Fetching API keys...");
  const { data: testKeys } = await listAppPublicApiKeys({ client, path: { project_id: project.id, app_id: testApp.id } });
  const { data: iosKeys } = await listAppPublicApiKeys({ client, path: { project_id: project.id, app_id: iosApp.id } });
  const { data: androidKeys } = await listAppPublicApiKeys({ client, path: { project_id: project.id, app_id: androidApp.id } });

  console.log("\n========================================");
  console.log("✅ RevenueCat setup complete!");
  console.log("========================================");
  console.log("Project ID:              ", project.id);
  console.log("Test Store App ID:       ", testApp.id);
  console.log("iOS App ID:              ", iosApp.id);
  console.log("Android App ID:          ", androidApp.id);
  console.log("Entitlement:             ", ENTITLEMENT_IDENTIFIER);
  console.log("\nSet these environment variables:");
  console.log("REVENUECAT_PROJECT_ID=", project.id);
  console.log("REVENUECAT_TEST_STORE_APP_ID=", testApp.id);
  console.log("REVENUECAT_APPLE_APP_STORE_APP_ID=", iosApp.id);
  console.log("REVENUECAT_GOOGLE_PLAY_STORE_APP_ID=", androidApp.id);
  console.log("EXPO_PUBLIC_REVENUECAT_TEST_API_KEY=", testKeys?.items?.[0]?.key ?? "N/A");
  console.log("EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=", iosKeys?.items?.[0]?.key ?? "N/A");
  console.log("EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=", androidKeys?.items?.[0]?.key ?? "N/A");
  console.log("========================================\n");
}

seedRevenueCat().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
