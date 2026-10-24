/* ============================================================
   BRAND — swap these (colours live in styles.css :root)
   ============================================================ */
const BRAND = {
  name: "Sideplay",
  tagline: "The game hits different live.",
  currency: "$",
};

/* ============================================================
   CONTENT — events, competitions, cities, hotels, extras.
   `art` picks a placeholder gradient; set `img` to a photo URL
   on any event, competition or city to use a real image.
   ============================================================ */
const SPORTS = [
  { id: "football",   name: "Football",    icon: "sports_soccer" },
  { id: "basketball", name: "Basketball",  icon: "sports_basketball" },
  { id: "racing",     name: "Motorsport",  icon: "sports_motorsports" },
  { id: "usfootball", name: "US Football", icon: "sports_football" },
  { id: "rugby",      name: "Rugby",       icon: "sports_rugby" },
  { id: "tennis",     name: "Tennis",      icon: "sports_tennis" },
];

const COMPETITIONS = [
  { id: "ucl",  name: "Champions League",  sport: "football",   where: "Across Europe" },
  { id: "epl",  name: "Premier League",    sport: "football",   where: "England" },
  { id: "spl",  name: "Saudi Pro League",  sport: "football",   where: "Saudi Arabia" },
  { id: "liga", name: "LaLiga",            sport: "football",   where: "Spain" },
  { id: "sa",   name: "Serie A",           sport: "football",   where: "Italy" },
  { id: "bun",  name: "Bundesliga",        sport: "football",   where: "Germany" },
  { id: "l1",   name: "Ligue 1",           sport: "football",   where: "France" },
  { id: "sl",   name: "Süper Lig",         sport: "football",   where: "Türkiye" },
  { id: "f1",   name: "Formula 1",         sport: "racing",     where: "Abu Dhabi, Brazil, …" },
  { id: "nba",  name: "NBA",               sport: "basketball", where: "USA" },
  { id: "nfl",  name: "NFL",               sport: "usfootball", where: "USA" },
  { id: "rugby",name: "Autumn Internationals", sport: "rugby",  where: "England" },
];

/* nightly = typical 4★ hotel rate per night in USD */
const CITIES = {
  "Riyadh":        { country: "Saudi Arabia", nightly: 165, art: "desert", tagline: "Saudi Pro League nights at Al-Awwal Park, from the Riyadh derby to Al-Nassr’s biggest clashes." },
  "London":        { country: "England",      nightly: 260, art: "city", tagline: "North London derbies, Premier League weekends and autumn rugby at Twickenham." },
  "Liverpool":     { country: "England",      nightly: 145, art: "city", tagline: "Anfield on a big night: the Merseyside derby and Premier League title clashes." },
  "Milan":         { country: "Italy",        nightly: 205, art: "city", tagline: "The Derby della Madonnina and the Derby d’Italia under the San Siro lights." },
  "Turin":         { country: "Italy",        nightly: 140, art: "city", tagline: "Juventus at home in Turin, against Napoli and AC Milan." },
  "Madrid":        { country: "Spain",        nightly: 185, art: "warm", tagline: "El Clásico, the Madrid derby and Champions League nights at the Bernabéu." },
  "Dortmund":      { country: "Germany",      nightly: 120, art: "city", tagline: "Der Klassiker and Champions League nights in front of the Yellow Wall." },
  "Paris":         { country: "France",       nightly: 305, art: "city", tagline: "Le Classique and Champions League nights at the Parc des Princes." },
  "Le Havre":      { country: "France",       nightly: 110, art: "sea" },
  "Los Angeles":   { country: "USA",          nightly: 295, art: "warm", tagline: "Lakers rivalry nights at Crypto.com Arena, from the Celtics to the Warriors." },
  "New York City": { country: "USA",          nightly: 360, art: "city", tagline: "Knicks basketball at Madison Square Garden, the world’s most famous arena." },
  "Abu Dhabi":     { country: "UAE",          nightly: 220, art: "desert", tagline: "The Formula 1 season finale under the lights at Yas Marina." },
  "Sao Paulo":     { country: "Brazil",       nightly: 130, art: "warm", tagline: "Interlagos, home of the São Paulo Grand Prix and some of F1’s wildest races." },
  "Kansas City":   { country: "USA",          nightly: 150, art: "city", tagline: "Chiefs Kingdom at Arrowhead, one of the loudest stadiums in the NFL." },
  "Istanbul":      { country: "Türkiye",      nightly: 155, art: "sea", tagline: "The Intercontinental derby: Fenerbahçe vs Galatasaray, one of football’s loudest nights." },
};

const EVENTS = [
  { id: "nassr-ahli", title: "Al-Nassr FC vs Al-Ahli", sport: "football", comp: "spl", venue: "Al-Awwal Park", city: "Riyadh", date: "2026-10-29T20:00", from: 230, was: 255 },
  { id: "ars-mun", title: "Arsenal vs Manchester United", sport: "football", comp: "epl", venue: "Emirates Stadium", city: "London", date: "2026-10-24T15:00", from: 785, was: 875 },
  { id: "liv-ars",         title: "Liverpool vs Arsenal",              sport: "football",   comp: "epl",  venue: "Anfield",                      city: "Liverpool",     date: "2026-11-08T16:30", from: 770, was: 855, hot: true },
  { id: "mil-int",         title: "AC Milan vs Inter",                 sport: "football",   comp: "sa",   venue: "Stadio San Siro",              city: "Milan",         date: "2026-11-22T20:45", from: 260,  was: 285, hot: true },
  { id: "juv-nap",         title: "Juventus FC vs SSC Napoli",         sport: "football",   comp: "sa",   venue: "Juventus Stadium",             city: "Turin",         date: "2026-11-01T20:45", from: 425, was: 470 },
  { id: "rma-mci", title: "Real Madrid vs Manchester City", sport: "football", comp: "ucl", venue: "Estadio Santiago Bernabéu", city: "Madrid", date: "2026-11-04T21:00", from: 660, was: 735, hot: true },
  { id: "atm-rma", title: "Atlético Madrid vs Real Madrid", sport: "football", comp: "liga", venue: "Estadio Metropolitano", city: "Madrid", date: "2026-10-24T21:00", from: 370, was: 410, hot: true },
  { id: "bvb-b04", title: "Borussia Dortmund vs Bayer Leverkusen", sport: "football", comp: "bun", venue: "Signal Iduna Park", city: "Dortmund", date: "2026-10-24T18:30", from: 235, was: 265 },
  { id: "psg-om", title: "Paris Saint-Germain vs Olympique de Marseille", sport: "football", comp: "l1", venue: "Parc des Princes", city: "Paris", date: "2026-10-25T20:45", from: 460, was: 510, hot: true },
  { id: "fen-gal", title: "Fenerbahçe vs Galatasaray", sport: "football", comp: "sl", venue: "Şükrü Saracoğlu Stadium", city: "Istanbul", date: "2026-11-29T20:00", from: 495, was: 550, hot: true },
  { id: "lal-gsw", title: "Los Angeles Lakers vs Golden State Warriors", sport: "basketball", comp: "nba", venue: "Crypto.com Arena", city: "Los Angeles", date: "2026-11-02T19:30", from: 330, was: 370 },
  { id: "nyk-sas",         title: "New York Knicks vs San Antonio Spurs", sport: "basketball", comp: "nba", venue: "Madison Square Garden",     city: "New York City", date: "2026-11-14T19:30", from: 630, was: 700, hot: true },
  { id: "abu-gp",          title: "Abu Dhabi Grand Prix",              sport: "racing",     comp: "f1",   venue: "Yas Marina Circuit",           city: "Abu Dhabi",     date: "2026-12-06T17:00", from: 415, was: 460, hot: true },
  { id: "bra-gp",          title: "São Paulo Grand Prix",              sport: "racing",     comp: "f1",   venue: "Interlagos",                   city: "Sao Paulo",     date: "2026-11-08T14:00", from: 415, was: 460 },
  { id: "kc-lv", title: "Kansas City Chiefs vs Las Vegas Raiders", sport: "usfootball", comp: "nfl", venue: "Arrowhead Stadium", city: "Kansas City", date: "2026-11-15T12:00", from: 260, was: 290 },
  { id: "ars-che",         title: "Arsenal vs Chelsea",                sport: "football",   comp: "epl",  venue: "Emirates Stadium",             city: "London",        date: "2026-12-05T17:30", from: 815, was: 905 },
  { id: "ars-tot",         title: "Arsenal vs Tottenham Hotspur",      sport: "football",   comp: "epl",  venue: "Emirates Stadium",             city: "London",        date: "2027-01-16T12:30", from: 910, was: 1015, hot: true },
  { id: "liv-mci",         title: "Liverpool vs Manchester City",      sport: "football",   comp: "epl",  venue: "Anfield",                      city: "Liverpool",     date: "2026-11-29T16:30", from: 850, was: 940, hot: true },
  { id: "liv-eve",         title: "Liverpool vs Everton FC",           sport: "football",   comp: "epl",  venue: "Anfield",                      city: "Liverpool",     date: "2027-01-03T15:00", from: 595, was: 665, hot: true },
  { id: "nassr-hilal",     title: "Al-Nassr FC vs Al-Hilal",           sport: "football",   comp: "spl",  venue: "Al-Awwal Park", city: "Riyadh",        date: "2026-11-20T21:00", from: 305, was: 340, hot: true },
  { id: "nassr-ittihad",   title: "Al-Nassr FC vs Al-Ittihad",         sport: "football",   comp: "spl",  venue: "Al-Awwal Park", city: "Riyadh",        date: "2026-12-18T20:00", from: 250,  was: 280 },
  { id: "int-juv",         title: "Inter vs Juventus FC",              sport: "football",   comp: "sa",   venue: "Stadio San Siro",              city: "Milan",         date: "2026-12-13T20:45", from: 330, was: 370 },
  { id: "juv-mil",         title: "Juventus FC vs AC Milan",           sport: "football",   comp: "sa",   venue: "Juventus Stadium",             city: "Turin",         date: "2027-01-24T20:45", from: 375, was: 420 },
  { id: "rma-bar",         title: "Real Madrid vs FC Barcelona",       sport: "football",   comp: "liga", venue: "Estadio Santiago Bernabéu",    city: "Madrid",        date: "2026-12-20T21:00", from: 975, was: 1080, hot: true },
  { id: "atm-bar", title: "Atlético Madrid vs FC Barcelona", sport: "football", comp: "liga", venue: "Estadio Metropolitano", city: "Madrid", date: "2026-11-28T18:30", from: 335, was: 375 },
  { id: "bvb-rma",         title: "Borussia Dortmund vs Real Madrid",  sport: "football",   comp: "ucl",  venue: "Signal Iduna Park",            city: "Dortmund",      date: "2026-11-25T21:00", from: 350, was: 390 },
  { id: "bvb-fcb",         title: "Borussia Dortmund vs FC Bayern München", sport: "football", comp: "bun", venue: "Signal Iduna Park",          city: "Dortmund",      date: "2027-01-30T18:30", from: 420, was: 465, hot: true },
  { id: "psg-fcb", title: "Paris Saint-Germain vs FC Bayern München", sport: "football", comp: "ucl", venue: "Parc des Princes", city: "Paris", date: "2026-12-09T21:00", from: 575, was: 635 },
  { id: "lal-bos",         title: "Los Angeles Lakers vs Boston Celtics", sport: "basketball", comp: "nba", venue: "Crypto.com Arena",          city: "Los Angeles",   date: "2026-12-25T17:00", from: 505, was: 560, hot: true },
  { id: "nyk-bos", title: "New York Knicks vs Boston Celtics", sport: "basketball", comp: "nba", venue: "Madison Square Garden", city: "New York City", date: "2026-12-08T19:30", from: 530, was: 585, hot: true },
  { id: "kc-buf",          title: "Kansas City Chiefs vs Buffalo Bills", sport: "usfootball", comp: "nfl", venue: "Arrowhead Stadium",         city: "Kansas City",   date: "2026-12-13T15:25", from: 300, was: 330 },
  { id: "eng-nzl",         title: "England vs New Zealand",            sport: "rugby",      comp: "rugby",venue: "Allianz Stadium, Twickenham",  city: "London",        date: "2026-11-21T15:10", from: 395, was: 435 },
  { id: "eng-aus",        title: "England vs Australia",              sport: "rugby",      comp: "rugby",venue: "Allianz Stadium, Twickenham",  city: "London",        date: "2026-11-07T15:10", from: 325, was: 360 },
];

/* Seat tiers — price multiplier on top of the event's `from` price */
const TIERS = [
  { id: "standard",    name: "Standard",    mult: 1,   colour: "var(--tier-standard)", label: "var(--ink)",
    perks: ["Upper-tier seat", "Mobile ticket", "Seats together"] },
  { id: "premium",     name: "Premium",     mult: 1.9, colour: "var(--tier-premium)", label: "var(--ink)",
    perks: ["Lower-tier seat, closer to the action", "Fast-track entry", "Seats together"] },
  { id: "hospitality", name: "Hospitality", mult: 4.2, colour: "var(--tier-hospitality)", label: "#ffffff",
    perks: ["Halfway-line padded seat", "Lounge access 2 hrs before", "3-course dining & drinks"] },
];

/* Hotel templates — combined with each city's nightly rate */
const HOTEL_TEMPLATES = [
  { key: "near",  name: "Matchday Suites",      stars: 4, km: 0.6, rateX: 1.05, tag: "Walk to the stadium", art: "hotel1" },
  { key: "lux",   name: "The Grand Central",    stars: 5, km: 2.4, rateX: 1.75, tag: "City-centre luxury",  art: "hotel2" },
  { key: "value", name: "Urban Lodge",          stars: 3, km: 1.5, rateX: 0.58, tag: "Best value",          art: "hotel3" },
];

const EXTRAS = [
  { id: "airport", name: "Airport transfers", desc: "Private car both ways", price: 85, per: "booking", icon: "airport_shuttle" },
  { id: "matchday",name: "Match-day ride",    desc: "Hotel ↔ stadium, skip the crowds", price: 39, per: "booking", icon: "local_taxi" },
  { id: "tour",    name: "Stadium tour",      desc: "Day-before behind-the-scenes tour", price: 25, per: "person", icon: "tour" },
];

/* ============================================================
   TEAM CRESTS — original designs, not club logos. Each team
   gets its kit colours [main, accent] and a pattern that
   echoes its kit; crests.js draws the SVG from this.
   Patterns: plain · stripes · halves · band · sash · chevron · hoops
   ============================================================ */
const TEAMS = {
  // Saudi Pro League
  "Al-Nassr FC":            { c: ["#FFD500", "#0B2A63"], p: "plain" },
  "Al-Hilal":               { c: ["#005CB9", "#FFFFFF"], p: "plain" },
  "Al-Ittihad":             { c: ["#F6D20E", "#111111"], p: "stripes" },
  "Al-Ahli":                { c: ["#007A3D", "#FFFFFF"], p: "sash" },
  // Premier League
  "Arsenal":                { c: ["#DB0007", "#FFFFFF"], p: "plain" },
  "Chelsea":                { c: ["#034694", "#FFFFFF"], p: "plain" },
  "Tottenham Hotspur":      { c: ["#FFFFFF", "#132257"], p: "plain" },
  "Manchester United":      { c: ["#DA291C", "#FBE122"], p: "plain" },
  "Manchester City":        { c: ["#6CABDD", "#1C2C5B"], p: "plain" },
  "Liverpool":              { c: ["#C8102E", "#F6EB61"], p: "plain" },
  "Everton FC":             { c: ["#003399", "#FFFFFF"], p: "plain" },
  // Serie A
  "AC Milan":               { c: ["#FB090B", "#111111"], p: "stripes" },
  "Inter":                  { c: ["#0068A8", "#111111"], p: "stripes" },
  "Juventus FC":            { c: ["#111111", "#FFFFFF"], p: "stripes" },
  "SSC Napoli":             { c: ["#12A0D7", "#FFFFFF"], p: "plain" },
  // LaLiga
  "Real Madrid":            { c: ["#FFFFFF", "#C9A227"], p: "plain" },
  "FC Barcelona":           { c: ["#004D98", "#A50044"], p: "stripes" },
  "Atlético Madrid":        { c: ["#CB3524", "#FFFFFF"], p: "stripes" },
  // Bundesliga
  "Borussia Dortmund":      { c: ["#FDE100", "#111111"], p: "plain" },
  "FC Bayern München":      { c: ["#DC052D", "#FFFFFF"], p: "plain" },
  "Bayer Leverkusen":       { c: ["#111111", "#E32221"], p: "chevron" },
  // Ligue 1
  "Paris Saint-Germain":    { c: ["#004170", "#DA291C"], p: "band" },
  "Olympique de Marseille": { c: ["#FFFFFF", "#2FAEE0"], p: "sash" },
  // Süper Lig
  "Fenerbahçe":             { c: ["#163962", "#FFED00"], p: "stripes" },
  "Galatasaray":            { c: ["#A90432", "#FDB912"], p: "halves" },
  // NBA
  "Los Angeles Lakers":     { c: ["#552583", "#FDB927"], p: "plain" },
  "Boston Celtics":         { c: ["#007A33", "#FFFFFF"], p: "plain" },
  "Golden State Warriors":  { c: ["#1D428A", "#FFC72C"], p: "plain" },
  "New York Knicks":        { c: ["#006BB6", "#F58426"], p: "plain" },
  "San Antonio Spurs":      { c: ["#111111", "#C4CED4"], p: "plain" },
  // NFL
  "Kansas City Chiefs":     { c: ["#E31837", "#FFB81C"], p: "plain" },
  "Las Vegas Raiders":      { c: ["#111111", "#A5ACAF"], p: "plain" },
  "Buffalo Bills":          { c: ["#00338D", "#C60C30"], p: "plain" },
  // Rugby nations
  "England":                { c: ["#FFFFFF", "#CE1124"], p: "hoops" },
  "Australia":              { c: ["#FFCD00", "#00843D"], p: "hoops" },
  "New Zealand":            { c: ["#111111", "#FFFFFF"], p: "hoops" },
};
