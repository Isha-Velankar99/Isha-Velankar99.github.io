/* ============================================================
   HEARTH — demo data. Prices in USD per night; all hotels are
   fictional. Photos are Wikimedia Commons (see credits.js).
   ============================================================ */
const IMG = n => `img/${n}.jpg`;

const HOTELS = [
  { id: "riverside", name: "The Riverside", city: "London", area: "South Bank", stars: 5, rating: 9.1, reviews: 1284,
    img: "hotel-lux", gallery: ["hotel-lux", "hotel-value", "hotel-near", "city-london"],
    was: 412, now: 289, quote: "Staff remembered our names by day two, and the river view never got old.", by: "Amira, stayed in October",
    compare: [["Booking.com", 301], ["Agoda", 309], ["Expedia", 314]] },
  { id: "galata", name: "Galata House", city: "Istanbul", area: "Beyoğlu", stars: 4, rating: 8.8, reviews: 902,
    img: "city-istanbul", gallery: ["city-istanbul", "hotel-near", "hotel-value", "hotel-lux"],
    was: 240, now: 168, quote: "Ten minutes from everything, and the rooftop breakfast is worth the stay alone.", by: "Daniel, stayed in September",
    compare: [["Booking.com", 176], ["Agoda", 171], ["Trip.com", 180]] },
  { id: "brera", name: "Casa Brera", city: "Milan", area: "Brera", stars: 4, rating: 8.6, reviews: 611,
    img: "hotel-value", gallery: ["hotel-value", "city-milan", "hotel-near", "hotel-lux"],
    was: 265, now: 199, quote: "Quiet street, big windows, and the best espresso we had in Milan.", by: "Lena, stayed in August",
    compare: [["Booking.com", 207], ["Expedia", 212], ["Agoda", 205]] },
  { id: "mirabeau", name: "Hôtel Mirabeau Seine", city: "Paris", area: "15th arr.", stars: 4, rating: 8.9, reviews: 1530,
    img: "city-paris", gallery: ["city-paris", "hotel-lux", "hotel-near", "hotel-value"],
    was: 330, now: 238, quote: "Walked to the Eiffel Tower every evening. Rooms are calm and spotless.", by: "Priya, stayed in October",
    compare: [["Booking.com", 249], ["Agoda", 244], ["Expedia", 251]] },
  { id: "granvia", name: "Gran Vía 41", city: "Madrid", area: "Centro", stars: 4, rating: 8.4, reviews: 744,
    img: "city-madrid", gallery: ["city-madrid", "hotel-near", "hotel-value", "hotel-lux"],
    was: 210, now: 139, quote: "Right on Gran Vía but you'd never know once the door shuts.", by: "Tom, stayed in July",
    compare: [["Booking.com", 147], ["Trip.com", 144], ["Agoda", 150]] },
  { id: "hudson", name: "Hudson Rooms", city: "New York", area: "Hudson Yards", stars: 5, rating: 9.0, reviews: 2210,
    img: "city-new-york-city", gallery: ["city-new-york-city", "hotel-lux", "hotel-value", "hotel-near"],
    was: 520, now: 379, quote: "The view of the skyline from bed is the whole reason to come back.", by: "Sofia, stayed in June",
    compare: [["Booking.com", 395], ["Expedia", 402], ["Agoda", 389]] },
  { id: "thames", name: "Thameside Lodge", city: "London", area: "Bankside", stars: 4, rating: 8.5, reviews: 688,
    img: "hotel-near", gallery: ["hotel-near", "city-london", "hotel-value", "hotel-lux"],
    was: 260, now: 175, quote: "Simple, warm and five minutes from Tate Modern.", by: "Kenji, stayed in May",
    compare: [["Booking.com", 182], ["Agoda", 179], ["Expedia", 188]] },
  { id: "covent", name: "Covent Yard", city: "London", area: "Covent Garden", stars: 5, rating: 9.3, reviews: 1046,
    img: "hotel-value", gallery: ["hotel-value", "hotel-lux", "city-london", "hotel-near"],
    was: 480, now: 312, quote: "Theatre at eight, back in bed by eleven. Perfect location.", by: "Grace, stayed in April",
    compare: [["Booking.com", 325], ["Expedia", 331], ["Agoda", 319]] },
];

// Room multipliers on the hotel's nightly price
const ROOMS = [
  { id: "deluxe", name: "Deluxe Room, 1 King Bed", size: "28 m²", bed: "1 king bed", view: "City view", x: 1, payLater: true, perks: ["Free cancellation until 9 Dec", "Breakfast included"] },
  { id: "twin", name: "Superior Room, 2 Twin Beds", size: "26 m²", bed: "2 twin beds", view: "Courtyard view", x: 0.92, payLater: true, perks: ["Free cancellation until 9 Dec"] },
  { id: "suite", name: "Junior Suite", size: "42 m²", bed: "1 king bed + sofa", view: "River view", x: 1.6, payLater: false, perks: ["Non-refundable", "Breakfast and lounge access"] },
];

const TRIP = { checkIn: "Fri, 12 Dec", checkOut: "Sun, 14 Dec", inTime: "3:00 PM", outTime: "12:00 PM", nights: 2, guests: 2, chargeDate: "9 Dec" };

const COLLECTIONS = [
  { title: "Top hotels in London: up to 35% off", city: "London" },
];

const DESTINATIONS = [
  ["London", "city-london"], ["Paris", "city-paris"], ["Milan", "city-milan"],
  ["Istanbul", "city-istanbul"], ["Madrid", "city-madrid"], ["New York", "city-new-york-city"],
];
