// 120 Summer Avenue, Reading MA — pre-filled from public records
// Replace anything marked TODO with your wife's input.

window.LISTING = {
  id: "120-summer-ave",
  status: "active", // active | draft
  agent: {
    name: "Your Wife",            // TODO: replace
    phone: "(781) 555-0120",      // TODO
    email: "agent@example.com",   // TODO
    brokerage: "Local Real Estate" // TODO
  },
  address: {
    line1: "120 Summer Avenue",
    city: "Reading",
    state: "MA",
    zip: "01867"
  },
  headline: "Dutch Colonial on a beloved tree-lined street",
  blurb: "Built c.1900 on the Summer Avenue corridor — a short walk to Birch Meadow, top-rated schools, and downtown Reading. Period character throughout, ready for its next chapter.",
  price: 899000, // TODO confirm
  beds: 3,
  baths: 2,
  halfBaths: 1,
  sqft: 2136,
  lotSqft: 13068, // 0.3 acres
  yearBuilt: 1900,
  heroPhoto: null, // drop a hero photo in admin
  highlights: [
    "Mantled fireplace",
    "Built-in hutch",
    "Butler's pantry",
    "Enclosed sunroom",
    "French doors",
    "Walk to Birch Meadow"
  ],
  floors: [
    {
      id: "first",
      name: "First Floor",
      rooms: [
        {
          id: "foyer",
          name: "Foyer",
          sqft: null,
          highlights: ["Period staircase", "Original millwork"],
          description: "A gracious foyer sets the tone — period staircase, generous landing, and the kind of light that only old houses have. Original millwork has been preserved.",
          photos: [],
          complete: true
        },
        {
          id: "living",
          name: "Living Room",
          sqft: 240,
          highlights: ["Mantled fireplace", "French doors", "Built-ins"],
          description: "Anchored by a mantled fireplace and flanked by French doors that open to the sunroom. Original hardwoods run throughout.",
          photos: [],
          complete: true
        },
        {
          id: "dining",
          name: "Dining Room",
          sqft: 200,
          highlights: ["Built-in hutch", "Wainscoting"],
          description: "Formal dining with a built-in hutch — the kind of detail you can't reproduce. Easy flow to the butler's pantry and kitchen.",
          photos: [],
          complete: true
        },
        {
          id: "butler",
          name: "Butler's Pantry",
          sqft: 60,
          highlights: ["Original cabinetry", "Bar-ready"],
          description: "A working butler's pantry between dining and kitchen — perfect bar setup or coffee station.",
          photos: [],
          complete: true
        },
        {
          id: "kitchen",
          name: "Kitchen",
          sqft: null, // TODO
          highlights: [], // TODO: counters, appliances, updates
          description: "", // TODO — buyers spend the most time here
          photos: [],
          complete: false
        },
        {
          id: "sunroom",
          name: "Sunroom",
          sqft: 120,
          highlights: ["Enclosed", "Three exposures"],
          description: "Enclosed sunroom with three exposures — works year-round as a reading room, office, or playroom.",
          photos: [],
          complete: true
        },
        {
          id: "mudroom",
          name: "Mudroom",
          sqft: 40,
          highlights: ["Side entry", "Storage"],
          description: "Side-entry mudroom with built-in storage — the unsung hero of New England houses.",
          photos: [],
          complete: true
        },
        {
          id: "half-bath",
          name: "Half Bath",
          sqft: null,
          highlights: [],
          description: "", // TODO
          photos: [],
          complete: false
        }
      ]
    },
    {
      id: "second",
      name: "Second Floor",
      rooms: [
        {
          id: "primary",
          name: "Primary Bedroom",
          sqft: null, // TODO
          highlights: [], // TODO
          description: "", // TODO — size, closets, light
          photos: [],
          complete: false
        },
        {
          id: "bed-2",
          name: "Bedroom 2",
          sqft: null, // TODO
          highlights: [],
          description: "", // TODO
          photos: [],
          complete: false
        },
        {
          id: "bed-3",
          name: "Bedroom 3",
          sqft: null, // TODO
          highlights: [],
          description: "", // TODO
          photos: [],
          complete: false
        },
        {
          id: "full-bath-1",
          name: "Full Bath",
          sqft: null,
          highlights: [], // TODO
          description: "", // TODO — updated? original?
          photos: [],
          complete: false
        },
        {
          id: "full-bath-2",
          name: "Full Bath",
          sqft: null,
          highlights: [],
          description: "", // TODO
          photos: [],
          complete: false
        }
      ]
    },
    {
      id: "outside",
      name: "Outside",
      rooms: [
        {
          id: "yard",
          name: "Yard",
          sqft: 13068,
          highlights: ["0.3 acres", "Mature trees"],
          description: "A tenth-of-an-acre lot with mature trees and room to breathe — rare for this part of Reading.",
          photos: [],
          complete: true
        },
        {
          id: "neighborhood",
          name: "Neighborhood",
          sqft: null,
          highlights: ["Walk to Birch Meadow", "Top schools", "Tree-lined"],
          description: "Summer Avenue is one of Reading's most-loved streets — a short walk to Birch Meadow recreational complex, the elementary school, and downtown.",
          photos: [],
          complete: true
        }
      ]
    }
  ]
};
