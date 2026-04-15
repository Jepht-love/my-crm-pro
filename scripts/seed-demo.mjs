/**
 * seed-demo.mjs — Insertion données fictives pour le tenant démo
 *
 * ⚠️  Exécuter APRÈS avoir appliqué la migration 012_complete_demo_setup.sql
 *     dans le SQL Editor Supabase.
 *
 * Usage :
 *   node --env-file=.env.local scripts/seed-demo.mjs
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const DEMO = '00000000-0000-0000-0000-000000000000'

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

async function upsert(table, rows, conflict) {
  const { error } = await supabase
    .from(table)
    .upsert(rows, { onConflict: conflict, ignoreDuplicates: true })
  if (error) {
    console.error(`❌ ${table}: ${error.message}`)
  } else {
    console.log(`✅ ${table}: ${rows.length} lignes insérées`)
  }
}

// ── Produits (50) ─────────────────────────────────────────────────────────────

const PRODUCTS = [
  { tenant_id: DEMO, name: 'Café Premium Arabica',       description: 'Arabica single origin, torréfaction artisanale',   price: 12.99, stock_quantity: 150, sku: 'CAF-001' },
  { tenant_id: DEMO, name: 'Thé Vert Bio',               description: 'Thé vert biologique de Chine, 100g',               price:  8.50, stock_quantity: 200, sku: 'THE-001' },
  { tenant_id: DEMO, name: 'Chocolat Noir 85%',          description: 'Tablette chocolat noir intense 85% cacao',          price:  4.99, stock_quantity: 300, sku: 'CHO-001' },
  { tenant_id: DEMO, name: 'Miel de Lavande',            description: 'Miel artisanal de Provence, pot 500g',              price:  9.90, stock_quantity:  80, sku: 'MIE-001' },
  { tenant_id: DEMO, name: "Huile d'Olive Vierge Extra", description: 'Première pression à froid, 75cl',                   price: 15.50, stock_quantity: 120, sku: 'HUI-001' },
  { tenant_id: DEMO, name: 'Confiture Fraise Artisanale',description: 'Fraises françaises, sans conservateurs, 370g',      price:  6.50, stock_quantity:  90, sku: 'CON-001' },
  { tenant_id: DEMO, name: 'Pâtes Artisanales Bio',      description: 'Pâtes à la semoule de blé dur bio, 500g',           price:  5.90, stock_quantity: 180, sku: 'PAT-001' },
  { tenant_id: DEMO, name: 'Vinaigre Balsamique IGP',    description: 'Vinaigre balsamique de Modène IGP, 25cl',           price: 12.00, stock_quantity:  60, sku: 'VIN-001' },
  { tenant_id: DEMO, name: 'Sel de Guérande',            description: 'Fleur de sel récoltée à la main, 250g',              price:  7.50, stock_quantity: 100, sku: 'SEL-001' },
  { tenant_id: DEMO, name: 'Poivre Noir de Madagascar',  description: 'Poivre noir entier, moulin inclus, 50g',             price:  5.50, stock_quantity: 140, sku: 'POI-001' },
  { tenant_id: DEMO, name: 'Tisane Relaxante',           description: 'Mélange camomille, lavande, verveine, 30 sachets',  price:  6.90, stock_quantity: 160, sku: 'TIS-001' },
  { tenant_id: DEMO, name: 'Biscuits Bretons',           description: 'Palets bretons au beurre, boîte métal 200g',         price:  8.90, stock_quantity:  70, sku: 'BIS-001' },
  { tenant_id: DEMO, name: 'Sirop de Citron Bio',        description: 'Sirop artisanal au citron bio, 50cl',                price:  7.20, stock_quantity:  85, sku: 'SIR-001' },
  { tenant_id: DEMO, name: 'Farine T65 Bio',             description: 'Farine de blé tendre T65 biologique, 1kg',           price:  3.50, stock_quantity: 250, sku: 'FAR-001' },
  { tenant_id: DEMO, name: 'Riz Basmati Long',           description: 'Riz basmati extra long, origine Pakistan, 1kg',      price:  4.20, stock_quantity: 200, sku: 'RIZ-001' },
  { tenant_id: DEMO, name: 'Lentilles Vertes du Puy',    description: 'IGP Lentilles vertes du Puy, 500g',                  price:  4.90, stock_quantity: 110, sku: 'LEN-001' },
  { tenant_id: DEMO, name: 'Noisettes Décortiquées',     description: 'Noisettes du Piémont, 200g',                          price:  6.80, stock_quantity:  95, sku: 'NOI-001' },
  { tenant_id: DEMO, name: 'Amandes Grillées',           description: 'Amandes grillées à sec sans sel, 200g',               price:  5.60, stock_quantity: 130, sku: 'AMA-001' },
  { tenant_id: DEMO, name: 'Quinoa Bio',                 description: 'Quinoa blanc biologique, 500g',                       price:  5.20, stock_quantity: 170, sku: 'QUI-001' },
  { tenant_id: DEMO, name: 'Granola Maison',             description: 'Granola artisanal fruits rouges, 400g',                price:  8.00, stock_quantity:  75, sku: 'GRA-001' },
  { tenant_id: DEMO, name: 'Purée de Sésame',            description: 'Tahini 100% sésame grillé, 250g',                     price:  6.40, stock_quantity:  65, sku: 'PUR-001' },
  { tenant_id: DEMO, name: "Eau de Fleur d'Oranger",     description: 'Eau florale distillée, 200ml',                        price:  4.50, stock_quantity: 110, sku: 'EAU-001' },
  { tenant_id: DEMO, name: 'Cacao Cru en Poudre',        description: 'Cacao non sucré, origine Pérou, 200g',                price:  9.80, stock_quantity:  88, sku: 'CAC-001' },
  { tenant_id: DEMO, name: "Sirop d'Agave",              description: "Sirop d'agave bleu biologique, 350ml",                price:  5.90, stock_quantity: 145, sku: 'AGV-001' },
  { tenant_id: DEMO, name: 'Graines de Chia',            description: 'Graines de chia biologiques, 300g',                   price:  6.10, stock_quantity: 190, sku: 'CHI-001' },
  { tenant_id: DEMO, name: "Piment d'Espelette",         description: "AOP Piment d'Espelette en poudre, 40g",               price:  7.90, stock_quantity:  55, sku: 'PIM-001' },
  { tenant_id: DEMO, name: 'Sauce Soja Tamari',          description: 'Sans gluten, fermentation naturelle, 25cl',            price:  5.30, stock_quantity: 120, sku: 'SAU-001' },
  { tenant_id: DEMO, name: 'Vinaigre de Cidre Bio',      description: 'Vinaigre de cidre non filtré bio, 75cl',               price:  4.80, stock_quantity: 165, sku: 'VCB-001' },
  { tenant_id: DEMO, name: 'Curcuma en Poudre',          description: 'Curcuma biologique moulu, 100g',                       price:  4.20, stock_quantity: 210, sku: 'CUR-001' },
  { tenant_id: DEMO, name: 'Cannelle de Ceylan',         description: 'Bâtons de cannelle vraie, 50g',                        price:  5.10, stock_quantity:  95, sku: 'CAN-001' },
  { tenant_id: DEMO, name: 'Pack Épices du Monde',       description: 'Coffret 6 épices sélectionnées, idéal cadeau',         price: 24.90, stock_quantity:  40, sku: 'PACK-001' },
  { tenant_id: DEMO, name: 'Coffret Thés Premium',       description: "Assortiment 5 thés d'exception, 50 sachets",           price: 18.50, stock_quantity:  35, sku: 'PACK-002' },
  { tenant_id: DEMO, name: 'Box Apéro Artisanal',        description: 'Sélection apéritif : chips, tapas, sauces',            price: 29.90, stock_quantity:  25, sku: 'PACK-003' },
  { tenant_id: DEMO, name: 'Kimchi Fermenté',            description: 'Légumes lacto-fermentés coréens, pot 500g',            price: 11.50, stock_quantity:  50, sku: 'KIM-001' },
  { tenant_id: DEMO, name: 'Miso Blanc',                 description: 'Pâte de miso blanc fermenté, 300g',                    price:  8.70, stock_quantity:  60, sku: 'MIS-001' },
  { tenant_id: DEMO, name: 'Olives Marinées',            description: 'Mélange olives vertes et noires marinées, 300g',        price:  7.30, stock_quantity:  80, sku: 'OLI-001' },
  { tenant_id: DEMO, name: 'Tapenade Noire',             description: "Tapenade d'olives noires maison, 180g",                price:  6.90, stock_quantity:  70, sku: 'TAP-001' },
  { tenant_id: DEMO, name: 'Pesto Basilic',              description: 'Pesto au basilic frais sans conservateurs, 190g',       price:  7.50, stock_quantity:  90, sku: 'PES-001' },
  { tenant_id: DEMO, name: 'Beurre de Cacahuète',        description: 'Pur beurre de cacahuète sans additifs, 340g',           price:  6.20, stock_quantity: 130, sku: 'BCA-001' },
  { tenant_id: DEMO, name: 'Caramel au Beurre Salé',     description: 'Caramel artisanal beurre salé de Guérande, 220g',       price:  8.40, stock_quantity:  60, sku: 'CAR-001' },
  { tenant_id: DEMO, name: 'Huile de Coco Vierge',       description: 'Huile de coco pressée à froid, 500ml',                  price: 13.90, stock_quantity: 100, sku: 'COC-001' },
  { tenant_id: DEMO, name: 'Levure de Boulanger',        description: 'Levure de boulanger fraîche, 42g',                      price:  1.50, stock_quantity: 400, sku: 'LEV-001' },
  { tenant_id: DEMO, name: 'Coco Râpée Bio',             description: 'Noix de coco déshydratée biologique, 200g',             price:  4.10, stock_quantity: 180, sku: 'RAP-001' },
  { tenant_id: DEMO, name: 'Biscuits Apéritifs',         description: 'Mini crackers au fromage, 150g',                        price:  3.90, stock_quantity: 220, sku: 'CRA-001' },
  { tenant_id: DEMO, name: 'Confit de Canard',           description: '2 cuisses de canard confites en conserve, 750g',        price: 14.50, stock_quantity:  45, sku: 'COF-001' },
  { tenant_id: DEMO, name: 'Pâté de Campagne',           description: 'Pâté artisanal aux herbes, terrine 200g',               price:  6.70, stock_quantity:  75, sku: 'PAT-002' },
  { tenant_id: DEMO, name: 'Sauce Tomate Maison',        description: 'Coulis de tomates fraîches cuites, 500ml',               price:  4.60, stock_quantity: 160, sku: 'TOM-001' },
  { tenant_id: DEMO, name: 'Soupe Potimarron',           description: 'Velouté de potimarron bio en brique, 1L',               price:  3.80, stock_quantity: 140, sku: 'SOU-001' },
  { tenant_id: DEMO, name: 'Bouillon de Légumes Bio',    description: 'Bouillon cube bio sans additifs, 8 cubes',               price:  3.20, stock_quantity: 300, sku: 'BOU-001' },
  { tenant_id: DEMO, name: "Moutarde à l'Ancienne",      description: 'Moutarde de Meaux aux grains entiers, 200g',             price:  5.80, stock_quantity:  95, sku: 'MOU-001' },
]

// ── Commandes (30) ────────────────────────────────────────────────────────────

const ORDERS = [
  { tenant_id: DEMO, customer_email: 'marie.dupont@example.com',     customer_name: 'Marie Dupont',     status: 'delivered',  total_amount:  87.45, created_at: daysAgo(1)  },
  { tenant_id: DEMO, customer_email: 'jean.martin@example.com',      customer_name: 'Jean Martin',      status: 'delivered',  total_amount: 156.30, created_at: daysAgo(1)  },
  { tenant_id: DEMO, customer_email: 'sophie.bernard@example.com',   customer_name: 'Sophie Bernard',   status: 'shipped',    total_amount:  43.90, created_at: daysAgo(2)  },
  { tenant_id: DEMO, customer_email: 'pierre.dubois@example.com',    customer_name: 'Pierre Dubois',    status: 'confirmed',  total_amount: 210.00, created_at: daysAgo(2)  },
  { tenant_id: DEMO, customer_email: 'alice.leroy@example.com',      customer_name: 'Alice Leroy',      status: 'delivered',  total_amount:  67.20, created_at: daysAgo(3)  },
  { tenant_id: DEMO, customer_email: 'thomas.morel@example.com',     customer_name: 'Thomas Morel',     status: 'pending',    total_amount:  32.50, created_at: daysAgo(3)  },
  { tenant_id: DEMO, customer_email: 'emma.petit@example.com',       customer_name: 'Emma Petit',       status: 'delivered',  total_amount: 189.90, created_at: daysAgo(4)  },
  { tenant_id: DEMO, customer_email: 'lucas.richard@example.com',    customer_name: 'Lucas Richard',    status: 'delivered',  total_amount:  54.80, created_at: daysAgo(4)  },
  { tenant_id: DEMO, customer_email: 'julie.thomas@example.com',     customer_name: 'Julie Thomas',     status: 'shipped',    total_amount:  76.40, created_at: daysAgo(5)  },
  { tenant_id: DEMO, customer_email: 'nicolas.roux@example.com',     customer_name: 'Nicolas Roux',     status: 'delivered',  total_amount: 123.00, created_at: daysAgo(5)  },
  { tenant_id: DEMO, customer_email: 'camille.blanc@example.com',    customer_name: 'Camille Blanc',    status: 'cancelled',  total_amount:  29.90, created_at: daysAgo(6)  },
  { tenant_id: DEMO, customer_email: 'maxime.henry@example.com',     customer_name: 'Maxime Henry',     status: 'delivered',  total_amount:  94.60, created_at: daysAgo(6)  },
  { tenant_id: DEMO, customer_email: 'laura.simon@example.com',      customer_name: 'Laura Simon',      status: 'delivered',  total_amount: 145.75, created_at: daysAgo(7)  },
  { tenant_id: DEMO, customer_email: 'romain.laurent@example.com',   customer_name: 'Romain Laurent',   status: 'delivered',  total_amount:  38.20, created_at: daysAgo(8)  },
  { tenant_id: DEMO, customer_email: 'elise.michel@example.com',     customer_name: 'Elise Michel',     status: 'delivered',  total_amount: 267.50, created_at: daysAgo(9)  },
  { tenant_id: DEMO, customer_email: 'julien.lefebvre@example.com',  customer_name: 'Julien Lefebvre',  status: 'delivered',  total_amount:  82.00, created_at: daysAgo(10) },
  { tenant_id: DEMO, customer_email: 'manon.garcia@example.com',     customer_name: 'Manon Garcia',     status: 'delivered',  total_amount: 115.30, created_at: daysAgo(11) },
  { tenant_id: DEMO, customer_email: 'anthony.martinez@example.com', customer_name: 'Anthony Martinez', status: 'delivered',  total_amount:  59.90, created_at: daysAgo(12) },
  { tenant_id: DEMO, customer_email: 'pauline.robin@example.com',    customer_name: 'Pauline Robin',    status: 'delivered',  total_amount: 173.40, created_at: daysAgo(13) },
  { tenant_id: DEMO, customer_email: 'mathieu.david@example.com',    customer_name: 'Mathieu David',    status: 'delivered',  total_amount:  48.70, created_at: daysAgo(14) },
  { tenant_id: DEMO, customer_email: 'claire.bertrand@example.com',  customer_name: 'Claire Bertrand',  status: 'delivered',  total_amount: 230.10, created_at: daysAgo(15) },
  { tenant_id: DEMO, customer_email: 'kevin.fontaine@example.com',   customer_name: 'Kevin Fontaine',   status: 'delivered',  total_amount:  71.50, created_at: daysAgo(16) },
  { tenant_id: DEMO, customer_email: 'sarah.girard@example.com',     customer_name: 'Sarah Girard',     status: 'delivered',  total_amount:  99.00, created_at: daysAgo(17) },
  { tenant_id: DEMO, customer_email: 'benjamin.bonnet@example.com',  customer_name: 'Benjamin Bonnet',  status: 'delivered',  total_amount: 136.80, created_at: daysAgo(18) },
  { tenant_id: DEMO, customer_email: 'amelie.dupuis@example.com',    customer_name: 'Amélie Dupuis',    status: 'delivered',  total_amount:  55.60, created_at: daysAgo(19) },
  { tenant_id: DEMO, customer_email: 'florian.lambert@example.com',  customer_name: 'Florian Lambert',  status: 'delivered',  total_amount: 188.20, created_at: daysAgo(20) },
  { tenant_id: DEMO, customer_email: 'lea.legrand@example.com',      customer_name: 'Léa Legrand',      status: 'delivered',  total_amount:  41.30, created_at: daysAgo(21) },
  { tenant_id: DEMO, customer_email: 'baptiste.masson@example.com',  customer_name: 'Baptiste Masson',  status: 'delivered',  total_amount: 205.90, created_at: daysAgo(22) },
  { tenant_id: DEMO, customer_email: 'anais.guerin@example.com',     customer_name: 'Anaïs Guerin',     status: 'delivered',  total_amount:  63.40, created_at: daysAgo(23) },
  { tenant_id: DEMO, customer_email: 'hugo.chevalier@example.com',   customer_name: 'Hugo Chevalier',   status: 'delivered',  total_amount: 312.00, created_at: daysAgo(24) },
]

// ── Newsletter (10) ───────────────────────────────────────────────────────────

const NEWSLETTER = [
  { tenant_id: DEMO, email: 'contact@restaurant-lebistrot.fr', prenom: 'Michel',    nom: 'Leblanc',   subscribed: true  },
  { tenant_id: DEMO, email: 'info@boulangerie-dupain.fr',       prenom: 'Sophie',    nom: 'Dupain',    subscribed: true  },
  { tenant_id: DEMO, email: 'bonjour@caveavins-bergerac.fr',    prenom: 'François',  nom: 'Vignes',    subscribed: true  },
  { tenant_id: DEMO, email: 'shop@fromagerie-artisan.fr',       prenom: 'Catherine', nom: 'Fromage',   subscribed: true  },
  { tenant_id: DEMO, email: 'hello@traiteur-moderne.fr',        prenom: 'Pierre',    nom: 'Delacroix', subscribed: true  },
  { tenant_id: DEMO, email: 'nathalie.perrin@gmail.com',        prenom: 'Nathalie',  nom: 'Perrin',    subscribed: true  },
  { tenant_id: DEMO, email: 'marc.aubert@hotmail.fr',           prenom: 'Marc',      nom: 'Aubert',    subscribed: true  },
  { tenant_id: DEMO, email: 'isabelle.leclercq@yahoo.fr',       prenom: 'Isabelle',  nom: 'Leclercq',  subscribed: true  },
  { tenant_id: DEMO, email: 'vente@epicerie-fine-lyon.fr',      prenom: 'Yves',      nom: 'Marchetti', subscribed: true  },
  { tenant_id: DEMO, email: 'commandes@primeur-halles.fr',      prenom: 'Sylvie',    nom: 'Marchand',  subscribed: false },
]

// ── Main ──────────────────────────────────────────────────────────────────────

async function seedDemo() {
  console.log('🌱 Insertion données démo...\n')

  await upsert('products',   PRODUCTS,   'sku')
  await upsert('orders',     ORDERS,     'id')
  await upsert('newsletter', NEWSLETTER, 'tenant_id,email')

  console.log('\n🎉 Terminé !')
  console.log(`   Produits   : ${PRODUCTS.length}`)
  console.log(`   Commandes  : ${ORDERS.length}`)
  console.log(`   Newsletter : ${NEWSLETTER.length}`)
}

seedDemo()