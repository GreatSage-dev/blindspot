// Curated Cross-Domain Case Studies & Cultural Knowledge Graph
// Tailored to Hospitality/Live Venues, Film/Media Studios, Consumer Brands, and Live Touring.

export const PRESET_CASES = [
  {
    id: 'standard-highline',
    label: 'The Standard, High Line',
    category: 'Hospitality & Live Venue',
    entityType: 'urn:entity:place',
    entityId: 'urn:entity:place:standard-high-line-nyc',
    city: 'New York',
    targetAge: '24_and_younger,25_to_29',
    loudEffect:
      'Under-30 weekend lounge & rooftop traffic dropped 31% over two quarters—even after management cut cocktail prices by 20%.',
    symptomBlamed:
      'Management blamed "Gen-Z drinking less and high drink prices" and hired a generic agency AI to book louder commercial club nights.',
    quietCauseSummary:
      'Price was never the problem. Qloo shows your core downtown crowd shifted away from big-room bottle-service nightlife toward intimate vinyl listening bars, A24-style indie cinema, low-ABV aperitivo culture, and left-of-center electronic sets.',
    audienceTags: [
      { id: 'urn:tag:music:indie_electronic', name: 'Indie Electronic & Downtempo', weight: 0.94 },
      { id: 'urn:tag:place:vinyl_listening_bar', name: 'Hi-Fi Vinyl Listening Bars', weight: 0.91 },
      { id: 'urn:tag:film:a24_indie_cinema', name: 'Arthouse & A24 Cinema', weight: 0.89 },
      { id: 'urn:tag:beverage:aperitivo_botanical', name: 'Botanical & Low-ABV Aperitivo', weight: 0.86 },
      { id: 'urn:tag:fashion:archival_workwear', name: 'Archival & Japanese Workwear', weight: 0.83 },
      { id: 'urn:tag:media:design_critique', name: 'Architecture & Design Culture', weight: 0.80 },
    ],
    demographics: {
      age: {
        '24_and_younger': 0.34,
        '25_to_29': 0.42,
        '30_to_34': 0.16,
        '35_to_54': -0.28,
        '55_and_older': -0.45,
      },
      gender: { female: 0.14, male: -0.14 },
    },
    momentum: {
      verdict: 'Rising (+18% 6-mo cultural velocity on vinyl/listening-bar tags)',
      delta: 0.18,
      series: [0.61, 0.64, 0.68, 0.72, 0.76, 0.79],
    },
    hiddenMarkets: [
      { city: 'Brooklyn / NYC', popRank: 1, tasteRank: 1, affinity: 0.96, note: 'Core hi-fi & indie cinema cluster' },
      { city: 'Austin', popRank: 10, tasteRank: 2, affinity: 0.93, note: '+8 rank jump over population' },
      { city: 'Portland', popRank: 25, tasteRank: 3, affinity: 0.91, note: '+22 rank jump over population' },
      { city: 'Los Angeles (Silver Lake)', popRank: 2, tasteRank: 4, affinity: 0.89, note: 'Strong A24/listening bar overlap' },
    ],
    naivePlan: [
      {
        domain: 'Music / Resident Act',
        filterType: 'urn:entity:artist',
        naivePick: {
          id: 'urn:entity:artist:david-guetta',
          name: 'David Guetta (Big-Room EDM Tribute)',
          popularity: 0.98,
          affinity: 0.19,
          sharedTagsCount: 0,
          clashingTags: ['Mainstream Vegas EDM', 'Stadium Pop', 'Bottle-Service Club'],
          ageSkew: '35_to_54 (+0.31)',
          whyItFails:
            '98% global fame, but 0 shared taste tags with your downtown crowd. Drives away vinyl/indie regulars immediately.',
        },
        qlooFix: {
          id: 'urn:entity:artist:kaytranada',
          name: 'KAYTRANADA / Men I Trust (Late-Night Vinyl Set)',
          popularity: 0.74,
          affinity: 0.95,
          sharedTagsCount: 5,
          sharedTags: ['Indie Electronic & Downtempo', 'Hi-Fi Vinyl Culture', 'Intimate Groove'],
          ageSkew: '25_to_29 (+0.44)',
          explainability: [
            { entity: 'The Standard, High Line', contribution: 0.58 },
            { entity: 'Hi-Fi Vinyl Listening Bars', contribution: 0.42 },
          ],
          whyItWorks:
            'High affinity (0.95) with controlled mainstream saturation (0.74). Matches the exact midnight listening habits of your 21–29 guests.',
        },
      },
      {
        domain: 'Beverage / Brand Partner',
        filterType: 'urn:entity:brand',
        naivePick: {
          id: 'urn:entity:brand:red-bull',
          name: 'Red Bull Vodka Tower Promo',
          popularity: 0.99,
          affinity: 0.14,
          sharedTagsCount: 0,
          clashingTags: ['Extreme Sports Mass-Market', 'College Frat Nightlife'],
          ageSkew: '35_to_54 (+0.19)',
          whyItFails:
            'Signals cheap mass-market nightlife; directly contradicts architectural & slow-craft hospitality taste.',
        },
        qlooFix: {
          id: 'urn:entity:brand:ghia',
          name: 'Ghia (Botanical Aperitivo) × Mezcal Amarás',
          popularity: 0.62,
          affinity: 0.93,
          sharedTagsCount: 4,
          sharedTags: ['Botanical & Low-ABV Aperitivo', 'Design-Forward Packaging', 'Downtown Culinary'],
          ageSkew: '24_and_younger (+0.38)',
          explainability: [
            { entity: 'Botanical & Low-ABV Aperitivo', contribution: 0.61 },
            { entity: 'The Standard, High Line', contribution: 0.39 },
          ],
          whyItWorks:
            'Solves the "Gen-Z drinking differently" shift without cheap discounts—elevates ticket spend with a cult aperitivo ritual.',
        },
      },
      {
        domain: 'Cultural Host / Creator',
        filterType: 'urn:entity:person',
        naivePick: {
          id: 'urn:entity:person:logan-paul',
          name: 'Viral Hype-House / Energy Drink Influencer',
          popularity: 0.97,
          affinity: 0.11,
          sharedTagsCount: 0,
          clashingTags: ['Stunt Vloggers', 'Mass Teen Merch'],
          ageSkew: '24_and_younger (Mass Market)',
          whyItFails:
            'Destroys room credibility in 10 seconds. Regulars never complain on Yelp—they just stop coming back.',
        },
        qlooFix: {
          id: 'urn:entity:person:dev-hynes',
          name: 'Dev Hynes (Blood Orange) / Benny Safdie Q&A Host',
          popularity: 0.68,
          affinity: 0.94,
          sharedTagsCount: 5,
          sharedTags: ['Arthouse & A24 Cinema', 'Downtown NYC Composers', 'Editorial Fashion'],
          ageSkew: '25_to_29 (+0.41)',
          explainability: [
            { entity: 'Arthouse & A24 Cinema', contribution: 0.54 },
            { entity: 'Indie Electronic & Downtempo', contribution: 0.46 },
          ],
          whyItWorks:
            'Bridges film score culture and downtown music—turning a quiet Tuesday/Thursday room into an insider cultural magnet.',
        },
      },
      {
        domain: 'Media & Podcast Tie-In',
        filterType: 'urn:entity:podcast',
        naivePick: {
          id: 'urn:entity:podcast:call-her-daddy',
          name: 'Top-5 Celebrity Tabloid Gossip Podcast',
          popularity: 0.96,
          affinity: 0.24,
          sharedTagsCount: 1,
          clashingTags: ['Mainstream Tabloid', 'Reality TV Recap'],
          ageSkew: '24_and_younger (+0.12)',
          whyItFails:
            'High chart rank, low neighborhood conversion. Listeners do not overlap with design-hotel regulars.',
        },
        qlooFix: {
          id: 'urn:entity:podcast:throwing-fits',
          name: 'Throwing Fits / The A24 Podcast (Live Taping)',
          popularity: 0.66,
          affinity: 0.92,
          sharedTagsCount: 4,
          sharedTags: ['Archival & Japanese Workwear', 'Downtown NYC Culture', 'Indie Cinema'],
          ageSkew: '25_to_29 (+0.46)',
          explainability: [
            { entity: 'Archival & Japanese Workwear', contribution: 0.57 },
            { entity: 'The Standard, High Line', contribution: 0.43 },
          ],
          whyItWorks:
            'Brings 400+ hyper-loyal local listeners directly into the room for a live conversation and after-hours listening session.',
        },
      },
      {
        domain: 'Film / Screening Night',
        filterType: 'urn:entity:movie',
        naivePick: {
          id: 'urn:entity:movie:fast-x',
          name: 'Generic Blockbuster Action Franchise Trivia',
          popularity: 0.95,
          affinity: 0.18,
          sharedTagsCount: 0,
          clashingTags: ['Multiplex Action', 'Suburban Mall Crowd'],
          ageSkew: '35_to_54 (+0.29)',
          whyItFails:
            'Turns a boutique rooftop into a suburban sports bar.',
        },
        qlooFix: {
          id: 'urn:entity:movie:past-lives',
          name: 'Past Lives / Paris, Texas (35mm Rooftop Screening)',
          popularity: 0.71,
          affinity: 0.96,
          sharedTagsCount: 5,
          sharedTags: ['Arthouse & A24 Cinema', 'Analog 35mm Aesthetics', 'Late-Night NYC Romance'],
          ageSkew: '25_to_29 (+0.43)',
          explainability: [
            { entity: 'Arthouse & A24 Cinema', contribution: 0.64 },
            { entity: 'The Standard, High Line', contribution: 0.36 },
          ],
          whyItWorks:
            'Highest cross-domain affinity (0.96) in the graph—pairs naturally with aperitivo hour and vinyl sets.',
        },
      },
    ],
  },
  {
    id: 'a24-indie-launch',
    label: 'A24 Film & Merch Launch',
    category: 'Film Studio & Entertainment',
    entityType: 'urn:entity:brand',
    entityId: 'urn:entity:brand:a24-films',
    city: 'Austin',
    targetAge: '24_and_younger,25_to_29',
    loudEffect:
      'Paid social ads & mainstream influencer promos in top-5 population cities are delivering 64% lower ticket pre-orders than last year.',
    symptomBlamed:
      'Marketing blamed " superhero/streaming fatigue" and proposed doubling spend on mega-TikTokers and Top-40 radio spots.',
    quietCauseSummary:
      'Your audience actively rejects polished studio marketing. Qloo shows your fans over-index in mid-sized cultural hubs (Austin, Portland, Atlanta) and discover films through vinyl record stores, cult streetwear drops, and film-essay podcasts.',
    audienceTags: [
      { id: 'urn:tag:film:elevated_genre', name: 'Elevated Genre & Director-Driven Film', weight: 0.96 },
      { id: 'urn:tag:music:bedroom_indie_shoegaze', name: 'Indie Rock, Shoegaze & Synth', weight: 0.92 },
      { id: 'urn:tag:fashion:cult_merch_streetwear', name: 'Small-Batch Graphic Streetwear', weight: 0.89 },
      { id: 'urn:tag:place:independent_cinema_cafe', name: 'Independent Rep-House Cinemas & Zine Cafes', weight: 0.88 },
      { id: 'urn:tag:media:longform_film_criticism', name: 'Letterboxd & Deep Film Criticism', weight: 0.85 },
    ],
    demographics: {
      age: {
        '24_and_younger': 0.45,
        '25_to_29': 0.39,
        '30_to_34': 0.14,
        '35_to_54': -0.32,
        '55_and_older': -0.51,
      },
      gender: { female: 0.08, male: -0.08 },
    },
    momentum: {
      verdict: 'Rising (+24% 6-mo velocity in Austin, Portland & Atlanta indie clusters)',
      delta: 0.24,
      series: [0.58, 0.63, 0.69, 0.74, 0.78, 0.82],
    },
    hiddenMarkets: [
      { city: 'Austin', popRank: 10, tasteRank: 1, affinity: 0.97, note: '#1 taste city (+9 rank jump vs population)' },
      { city: 'Portland', popRank: 25, tasteRank: 2, affinity: 0.95, note: '+23 rank jump vs population' },
      { city: 'Atlanta', popRank: 9, tasteRank: 3, affinity: 0.92, note: '+6 rank jump vs population' },
      { city: 'Seattle', popRank: 15, tasteRank: 4, affinity: 0.90, note: '+11 rank jump vs population' },
    ],
    naivePlan: [
      {
        domain: 'Soundtrack / Trailer Artist',
        filterType: 'urn:entity:artist',
        naivePick: {
          id: 'urn:entity:artist:imagine-dragons',
          name: 'Imagine Dragons (Stadium Trailer Anthem)',
          popularity: 0.97,
          affinity: 0.12,
          sharedTagsCount: 0,
          clashingTags: ['Corporate Arena Rock', 'Network TV Sports Promo'],
          ageSkew: '35_to_54 (+0.34)',
          whyItFails:
            'Makes an independent film look like a generic big-budget studio reboot. Instant credibility loss on Letterboxd.',
        },
        qlooFix: {
          id: 'urn:entity:artist:mk-gee',
          name: 'Mk.gee × Japanese Breakfast (Original Score & 7-Inch Vinyl)',
          popularity: 0.69,
          affinity: 0.96,
          sharedTagsCount: 5,
          sharedTags: ['Indie Rock, Shoegaze & Synth', 'Lo-Fi Analog Texture', 'Cult Vinyl Collectors'],
          ageSkew: '24_and_younger (+0.46)',
          explainability: [
            { entity: 'A24', contribution: 0.62 },
            { entity: 'Elevated Genre & Director-Driven Film', contribution: 0.38 },
          ],
          whyItWorks:
            '96% audience affinity with deep vinyl collector overlap—fans share the trailer strictly for the track.',
        },
      },
      {
        domain: 'Merch / Brand Collaboration',
        filterType: 'urn:entity:brand',
        naivePick: {
          id: 'urn:entity:brand:shein',
          name: 'Fast-Fashion Mass-Print Promo Tees',
          popularity: 0.96,
          affinity: 0.08,
          sharedTagsCount: 0,
          clashingTags: ['Disposable Fast Fashion', 'Mass Mall Retail'],
          ageSkew: '24_and_younger (Mass)',
          whyItFails:
            'Violates the audience’s collector ethic; zero resale or cultural cachet.',
        },
        qlooFix: {
          id: 'urn:entity:brand:online-ceramics',
          name: 'Online Ceramics × Criterion Closet Capsule',
          popularity: 0.59,
          affinity: 0.95,
          sharedTagsCount: 5,
          sharedTags: ['Small-Batch Graphic Streetwear', 'Elevated Genre & Director-Driven Film', 'Heavyweight Screenprint'],
          ageSkew: '25_to_29 (+0.42)',
          explainability: [
            { entity: 'Small-Batch Graphic Streetwear', contribution: 0.59 },
            { entity: 'A24', contribution: 0.41 },
          ],
          whyItWorks:
            'Turns marketing budget into a profitable collector drop that sells out in 12 minutes.',
        },
      },
      {
        domain: 'Premiere Venue / Neighborhood Activation',
        filterType: 'urn:entity:place',
        naivePick: {
          id: 'urn:entity:place:amc-times-square',
          name: 'Generic Suburban Mall Multiplex Lobby Standee',
          popularity: 0.94,
          affinity: 0.21,
          sharedTagsCount: 1,
          clashingTags: ['Tourist Multiplex', 'Chain Concession'],
          ageSkew: '35_to_54 (+0.22)',
          whyItFails:
            'Zero sense of discovery; treated like wallpaper by passersby.',
        },
        qlooFix: {
          id: 'urn:entity:place:alamo-drafthouse-south-lamar',
          name: 'Alamo Drafthouse South Lamar (Austin) + Rough Trade Record Store',
          popularity: 0.72,
          affinity: 0.94,
          sharedTagsCount: 4,
          sharedTags: ['Independent Rep-House Cinemas & Zine Cafes', 'Austin Film Community', 'Midnight Screenings'],
          ageSkew: '25_to_29 (+0.39)',
          explainability: [
            { entity: 'Independent Rep-House Cinemas & Zine Cafes', contribution: 0.55 },
            { entity: 'A24', contribution: 0.45 },
          ],
          whyItWorks:
            'Anchors the launch in Austin (#1 taste rank vs #10 population rank) where word-of-mouth spreads 4x faster.',
        },
      },
      {
        domain: 'Podcast & Media Partner',
        filterType: 'urn:entity:podcast',
        naivePick: {
          id: 'urn:entity:podcast:daily-news-generic',
          name: 'Generic Morning Commute News Ad Read',
          popularity: 0.95,
          affinity: 0.26,
          sharedTagsCount: 0,
          clashingTags: ['Broad Commuter News', 'Programmatic Ad Read'],
          ageSkew: '35_to_54 (+0.37)',
          whyItFails:
            'Listeners skip programmatic mid-roll ads; skews 15 years older than target ticket buyers.',
        },
        qlooFix: {
          id: 'urn:entity:podcast:the-big-picture',
          name: 'The Big Picture (Sean Fennessey & Amanda Dobbins) Director Deep-Dive',
          popularity: 0.67,
          affinity: 0.95,
          sharedTagsCount: 5,
          sharedTags: ['Letterboxd & Deep Film Criticism', 'Elevated Genre & Director-Driven Film', 'Physical Media'],
          ageSkew: '25_to_29 (+0.41)',
          explainability: [
            { entity: 'Letterboxd & Deep Film Criticism', contribution: 0.63 },
            { entity: 'A24', contribution: 0.37 },
          ],
          whyItWorks:
            'Reaches opening-weekend evangelists who buy tickets on day one and review on Letterboxd.',
        },
      },
      {
        domain: 'Host / Creator Partner',
        filterType: 'urn:entity:person',
        naivePick: {
          id: 'urn:entity:person:charli-damelio',
          name: 'Mainstream TikTok Dance Macro-Influencer',
          popularity: 0.96,
          affinity: 0.14,
          sharedTagsCount: 0,
          clashingTags: ['Lip-Sync Dance Trends', 'Sponsored Beauty Hauls'],
          ageSkew: '24_and_younger (Broad)',
          whyItFails:
            'Zero film credibility; audience immediately smells a paid corporate sponsorship.',
        },
        qlooFix: {
          id: 'urn:entity:person:hideo-kojima',
          name: 'Hideo Kojima × Sean Baker (Criterion / Letterboxd Top-4 Pick)',
          popularity: 0.75,
          affinity: 0.93,
          sharedTagsCount: 4,
          sharedTags: ['Auteur Worldbuilding', 'Cult Gaming & Cinema Crossover', 'Physical Media Collectors'],
          ageSkew: '24_and_younger (+0.40)',
          explainability: [
            { entity: 'Elevated Genre & Director-Driven Film', contribution: 0.56 },
            { entity: 'A24', contribution: 0.44 },
          ],
          whyItWorks:
            'Unlocks the massive cross-domain bridge between auteur gaming and indie cinema that standard AI completely misses.',
        },
      },
    ],
  },
  {
    id: 'liquid-death-cult',
    label: 'Liquid Death (Cult Beverage)',
    category: 'Consumer Brand & Retail',
    entityType: 'urn:entity:brand',
    entityId: 'urn:entity:brand:liquid-death',
    city: 'Atlanta',
    targetAge: '24_and_younger,25_to_29',
    loudEffect:
      'An automated AI marketing agent spent $45k on "healthy hydration & yoga lifestyle" ads—and repeat D2C orders dropped 29%.',
    symptomBlamed:
      'Growth team assumed "canned water is getting too crowded" and planned a 25% subscription discount.',
    quietCauseSummary:
      'Your AI agent treated you like a polite bottled-water company. Qloo proves your buyers do not share taste tags with yoga/wellness brands—they live in punk/hardcore music, stand-up comedy clubs, skateparks, and horror cinema.',
    audienceTags: [
      { id: 'urn:tag:music:hardcore_punk_metal', name: 'Hardcore Punk, Metal & Skate Rock', weight: 0.95 },
      { id: 'urn:tag:comedy:club_standup', name: 'Late-Night Club Stand-Up Comedy', weight: 0.93 },
      { id: 'urn:tag:sports:skate_bmx_tattoo', name: 'Skateboarding, BMX & Tattoo Culture', weight: 0.90 },
      { id: 'urn:tag:film:cult_horror_midnight', name: '80s/90s Cult Horror & Practical Effects', weight: 0.87 },
      { id: 'urn:tag:place:dive_bar_rock_venue', name: 'Independent Rock Venues & Comedy Cellars', weight: 0.85 },
    ],
    demographics: {
      age: {
        '24_and_younger': 0.38,
        '25_to_29': 0.41,
        '30_to_34': 0.19,
        '35_to_54': -0.24,
        '55_and_older': -0.49,
      },
      gender: { female: -0.12, male: 0.12 },
    },
    momentum: {
      verdict: 'Rising (+21% 6-mo velocity across hardcore music & live comedy tags)',
      delta: 0.21,
      series: [0.60, 0.65, 0.68, 0.73, 0.77, 0.81],
    },
    hiddenMarkets: [
      { city: 'Atlanta', popRank: 9, tasteRank: 1, affinity: 0.95, note: '+8 rank jump vs population' },
      { city: 'Austin', popRank: 10, tasteRank: 2, affinity: 0.94, note: 'Live comedy + rock venue stronghold' },
      { city: 'Denver', popRank: 19, tasteRank: 3, affinity: 0.91, note: '+16 rank jump vs population' },
      { city: 'Las Vegas', popRank: 29, tasteRank: 4, affinity: 0.89, note: '+25 rank jump vs population' },
    ],
    naivePlan: [
      {
        domain: 'Tour / Festival Music Partner',
        filterType: 'urn:entity:artist',
        naivePick: {
          id: 'urn:entity:artist:ed-sheeran',
          name: 'Polite Adult-Contemporary Acoustic Pop Tour',
          popularity: 0.98,
          affinity: 0.13,
          sharedTagsCount: 0,
          clashingTags: ['Soft Adult Pop', 'Wedding Ballads'],
          ageSkew: '35_to_54 (+0.32)',
          whyItFails:
            'Kills the rebellious brand joke on contact. Zero overlap with skate/punk buyers.',
        },
        qlooFix: {
          id: 'urn:entity:artist:turnstile',
          name: 'Turnstile (Hardcore / Skate Pit Barricade Hydration)',
          popularity: 0.71,
          affinity: 0.96,
          sharedTagsCount: 5,
          sharedTags: ['Hardcore Punk, Metal & Skate Rock', 'Skateboarding, BMX & Tattoo Culture', 'Mosh-Pit Energy'],
          ageSkew: '24_and_younger (+0.45)',
          explainability: [
            { entity: 'Liquid Death', contribution: 0.63 },
            { entity: 'Hardcore Punk, Metal & Skate Rock', contribution: 0.37 },
          ],
          whyItWorks:
            'Puts cold tallboys directly in the hands of dehydrated mosh-pit fans where water actually looks badass.',
        },
      },
      {
        domain: 'Talent / Comedian Partner',
        filterType: 'urn:entity:person',
        naivePick: {
          id: 'urn:entity:person:gwyneth-paltrow',
          name: 'Clean-Beauty & Luxury Spa Wellness Guru',
          popularity: 0.94,
          affinity: 0.09,
          sharedTagsCount: 0,
          clashingTags: ['Luxury Detox Spa', 'Pastel Minimalist Wellness'],
          ageSkew: '35_to_54 (+0.44)',
          whyItFails:
            'Standard AI hears "water" and picks wellness gurus—completely misreading the satirical heavy-metal identity.',
        },
        qlooFix: {
          id: 'urn:entity:person:mark-normand',
          name: 'Mark Normand × Tony Hinchcliffe (Green-Room Tallboy Drop)',
          popularity: 0.72,
          affinity: 0.94,
          sharedTagsCount: 4,
          sharedTags: ['Late-Night Club Stand-Up Comedy', 'Independent Rock Venues & Comedy Cellars', 'Irreverent Satire'],
          ageSkew: '25_to_29 (+0.43)',
          explainability: [
            { entity: 'Late-Night Club Stand-Up Comedy', contribution: 0.58 },
            { entity: 'Liquid Death', contribution: 0.42 },
          ],
          whyItWorks:
            'Makes the tallboy the default stage prop across every sold-out comedy club in Austin and Atlanta.',
        },
      },
      {
        domain: 'Co-Branded Drop Partner',
        filterType: 'urn:entity:brand',
        naivePick: {
          id: 'urn:entity:brand:lululemon',
          name: 'Pastel Yoga Mat & Pilates Studio Bundle',
          popularity: 0.96,
          affinity: 0.16,
          sharedTagsCount: 0,
          clashingTags: ['Boutique Pilates', 'Suburban Athleisure'],
          ageSkew: '30_to_34 (+0.29)',
          whyItFails:
            'Turns an edgy cult brand into generic supermarket bottled water.',
        },
        qlooFix: {
          id: 'urn:entity:brand:vans',
          name: 'Vans Skate × Santa Cruz Limited Tallboy Cooler Deck',
          popularity: 0.78,
          affinity: 0.93,
          sharedTagsCount: 5,
          sharedTags: ['Skateboarding, BMX & Tattoo Culture', 'Hardcore Punk, Metal & Skate Rock', 'DIY Streetwear'],
          ageSkew: '24_and_younger (+0.42)',
          explainability: [
            { entity: 'Skateboarding, BMX & Tattoo Culture', contribution: 0.60 },
            { entity: 'Liquid Death', contribution: 0.40 },
          ],
          whyItWorks:
            '93% taste affinity across skateparks and punk venues where tallboys replace energy drinks.',
        },
      },
      {
        domain: 'Venue / On-Premise Placement',
        filterType: 'urn:entity:place',
        naivePick: {
          id: 'urn:entity:place:equinox-uptown',
          name: 'Uptown Luxury Spa Juice Bar',
          popularity: 0.91,
          affinity: 0.17,
          sharedTagsCount: 0,
          clashingTags: ['Luxury Fitness Club', '$18 Cold-Pressed Juice'],
          ageSkew: '35_to_54 (+0.35)',
          whyItFails:
            'Wrong room, wrong price expectation, zero social shareability.',
        },
        qlooFix: {
          id: 'urn:entity:place:comedy-mothership',
          name: 'Comedy Mothership (Austin) & The Masquerade (Atlanta)',
          popularity: 0.70,
          affinity: 0.95,
          sharedTagsCount: 4,
          sharedTags: ['Independent Rock Venues & Comedy Cellars', 'Late-Night Club Stand-Up Comedy', '2-Drink Minimum Rooms'],
          ageSkew: '25_to_29 (+0.41)',
          explainability: [
            { entity: 'Independent Rock Venues & Comedy Cellars', contribution: 0.61 },
            { entity: 'Liquid Death', contribution: 0.39 },
          ],
          whyItWorks:
            'Solves the "2-drink minimum" in comedy clubs and rock rooms for fans who want a tallboy in hand without a hangover.',
        },
      },
      {
        domain: 'Podcast Sponsorship',
        filterType: 'urn:entity:podcast',
        naivePick: {
          id: 'urn:entity:podcast:corporate-leadership',
          name: 'Generic B2B Productivity & Morning Routine Podcast',
          popularity: 0.92,
          affinity: 0.15,
          sharedTagsCount: 0,
          clashingTags: ['Corporate Self-Help', 'Morning Cold Plunge Cliché'],
          ageSkew: '35_to_54 (+0.38)',
          whyItFails:
            'Wastes $45k on listeners who buy plain filter water.',
        },
        qlooFix: {
          id: 'urn:entity:podcast:last-podcast-on-the-left',
          name: 'Last Podcast on the Left / Tuesdays with Stories',
          popularity: 0.73,
          affinity: 0.94,
          sharedTagsCount: 5,
          sharedTags: ['80s/90s Cult Horror & Practical Effects', 'Late-Night Club Stand-Up Comedy', 'Macabre Humor'],
          ageSkew: '25_to_29 (+0.40)',
          explainability: [
            { entity: '80s/90s Cult Horror & Practical Effects', contribution: 0.57 },
            { entity: 'Liquid Death', contribution: 0.43 },
          ],
          whyItWorks:
            'Matches the exact horror-and-comedy sensibility of the brand; hosts turn the ad read into a viral bit.',
        },
      },
    ],
  },
];

export const ADVERSARIAL_CLICHES = [
  {
    id: 'cliche-drake-stadium',
    name: 'Drake (Stadium Pop Crossover)',
    domain: 'Music / Artist',
    filterType: 'urn:entity:artist',
    popularity: 0.99,
    affinity: 0.16,
    sharedTagsCount: 0,
    clashingTags: ['Global Chart Top-40', 'Mass Arena Pop'],
    ageSkew: 'Broad Mainstream',
    rejectionReason:
      'BLOCKED BY QLOO GATE: 99% fame score, but 0 shared niche taste tags (`affinity: 0.16`). Replaces subcultural identity with generic chart pop.',
  },
  {
    id: 'cliche-mrbeast-promo',
    name: 'MrBeast Giveaway Stunt Collab',
    domain: 'Creator / Talent',
    filterType: 'urn:entity:person',
    popularity: 0.99,
    affinity: 0.11,
    sharedTagsCount: 0,
    clashingTags: ['Mass Family YouTube', 'Cash Giveaway Stunts'],
    ageSkew: 'Under-18 Mass Market',
    rejectionReason:
      'BLOCKED BY QLOO GATE: Extreme popularity/affinity divergence (`0.99` fame vs `0.11` taste fit). Triggers immediate core-audience walkout.',
  },
  {
    id: 'cliche-times-square-chain',
    name: 'Times Square Hard Rock / Chain Takeover',
    domain: 'Venue / Place',
    filterType: 'urn:entity:place',
    popularity: 0.96,
    affinity: 0.14,
    sharedTagsCount: 0,
    clashingTags: ['Tourist Trap Chain', 'Suburban Bus Tour'],
    ageSkew: '35_to_54 (+0.39)',
    rejectionReason:
      'BLOCKED BY QLOO GATE: Skews 35–54 tourist demographic (`+0.39`) and clashes with local neighborhood discovery tags.',
  },
];
